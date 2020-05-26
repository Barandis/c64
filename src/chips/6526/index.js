/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { newChip } from "components/chip"
import { valueToPins, pinsToValue, setMode, setBit, bitSet } from "utils"
import {
  CIAPRA,
  CIAPRB,
  CIDDRA,
  CIDDRB,
  TIMALO,
  TIMBHI,
  TIMAHI,
  TIMBLO,
  TODTEN,
  TODSEC,
  TODMIN,
  TODHRS,
  CIASDR,
  CIAICR,
  CIACRA,
  CIACRB,
  ICR_FLG,
  ICR_IR,
} from "./constants"
import { ports } from "./ports"
import { timers } from "./timers"
import { tod } from "./tod"
import { control } from "./control"

// An emulation of the MOS Technologies 6526 Complex Interface Adapter (CIA). This is a chip
// designed as an I/O provider for 6500-series microprocessors. It features two 8-bit parallel data
// ports, a serial data port, two microsecond-accuracy timers, a BCD-based time-of-day clock, and 16
// registers to interface with the microprocessor.
//
// The Commodore 64 has two 6526 CIAs. The first is used almost exclusively to read the keyboard,
// joysticks, and joystick/paddle button. (It also provides one serial port to the User Port and
// fires an interrupt when the cassette tape is read.) Its interrupts are provided to the CPU over
// the regular IRQ line; these interrupts typically happen 60 times a second for keyboard scanning
// in addition to whatever may come from the serial port or the cassette tape.
//
// The second CIA mostly controls the Serial Port and the parallel (RS-232) port available on the
// User Port, though it's also used to provide bank switching to the VIC. Its interrupts are
// provided to the CPU over the NMI line, ensuring that they're processed without delay.

export function new6526() {
  const chip = newChip(
    // Register select pins. The 6526 has 16 addressable 8-bit registers, which requires four pins.
    newPin(38, "RS0", INPUT),
    newPin(37, "RS1", INPUT),
    newPin(36, "RS2", INPUT),
    newPin(35, "RS3", INPUT),

    // Data bus pins. These are input OR output pins, not both at the same time.
    newPin(33, "D0", OUTPUT, null),
    newPin(32, "D1", OUTPUT, null),
    newPin(31, "D2", OUTPUT, null),
    newPin(30, "D3", OUTPUT, null),
    newPin(29, "D4", OUTPUT, null),
    newPin(28, "D5", OUTPUT, null),
    newPin(27, "D6", OUTPUT, null),
    newPin(26, "D7", OUTPUT, null),

    // Parallel Port A pins. These are bidirectional but the direction is switchable via register.
    newPin(2, "PA0", INPUT),
    newPin(3, "PA1", INPUT),
    newPin(4, "PA2", INPUT),
    newPin(5, "PA3", INPUT),
    newPin(6, "PA4", INPUT),
    newPin(7, "PA5", INPUT),
    newPin(8, "PA6", INPUT),
    newPin(9, "PA7", INPUT),

    // Parallel Port B pins. These are bidirectional but the direction is switchable via register.
    newPin(10, "PB0", INPUT),
    newPin(11, "PB1", INPUT),
    newPin(12, "PB2", INPUT),
    newPin(13, "PB3", INPUT),
    newPin(14, "PB4", INPUT),
    newPin(15, "PB5", INPUT),
    newPin(16, "PB6", INPUT),
    newPin(17, "PB7", INPUT),

    // Port control pin. Pulses low after a read or write on port B, can be used for handshaking.
    newPin(18, "_PC", OUTPUT, 1),

    // IRQ input, maskable to fire hardware interrupt. Often used for handshaking.
    newPin(24, "_FLAG", INPUT),

    // Determines whether data is being read from (1) or written to (0) the chip
    newPin(22, "R__W", INPUT),

    // Interrupt request output. When low, this signals an interrupt to the CPU. There can be
    // several sources of interrupts connected to the same CPU, so this pin will be set to `null` if
    // there is no interrupt and `0` if there is. Setting the trace that connects these interrupts
    // to PULL_UP will cause the trace to be high unless one or more IRQ pins lower it.
    newPin(21, "_IRQ", OUTPUT, null),

    // Serial port. This is bidirectional but the direction is chosen by a control bit.
    newPin(39, "SP", INPUT),

    // Timed control line. This is used in conjunction with the serial port to control timing of the
    // bits of data into the port's shift register. It is bidirectional for that reason, though the
    // direction depends on the operation of the shift register and not directly on a control bit.
    newPin(40, "CNT", INPUT),

    // System clock input. In the 6526 this is expected to be a 1 MHz clock. It's actually typically
    // named "φ2" but that's difficult to type.
    newPin(25, "O2", INPUT),

    // TOD clock input. This can be either 50Hz or 60Hz, selectable from a control register.
    newPin(19, "TOD", INPUT),

    // Chip select pin. When this is low, the chip responds to R/W and register select signals.
    // When it's high, the data pins become hi-Z.
    newPin(23, "_CS", INPUT),

    // Resets the chip on a low signal.
    newPin(34, "_RES", INPUT),

    // Power supply and ground pins. These are not emulated.
    newPin(20, "VCC", UNCONNECTED),
    newPin(1, "VSS", UNCONNECTED),
  )

  const addressPins = [chip.RS0, chip.RS1, chip.RS2, chip.RS3]
  const dataPins = [chip.D0, chip.D1, chip.D2, chip.D3, chip.D4, chip.D5, chip.D6, chip.D7]

  // The 16 readable registers on the 6526.
  const registers = new Uint8Array(16)

  // Some registers have read-only and write-only portions. For those registers, these are the
  // write-only portions.
  const latches = new Uint8Array(16)

  const { readPrb, writePra, writePrb, writeDdra, writeDdrb } = ports(chip, registers)
  const { readTenths, readHours, writeTenths, writeSeconds, writeMinutes, writeHours } = tod(
    chip,
    registers,
    latches,
  )
  const { writeSdr } = timers(chip, registers, latches)
  const { readIcr, writeIcr, writeCra, writeCrb } = control(chip, registers, latches)

  // --------------------------------------------------------------------------
  // Reset

  // This is the result of a reset according to the specs of the device. The kernal is repsonsible
  // for setting up actual operation. For example, it's well known that the "default" state of the
  // DDR on CIA 1 is all outputs for port A and all inputs for port B; only in this way can the
  // keyboard be scanned. However, the hardware reset sets both ports to all inputs; the kernal
  // routine starting at $FDA5 actually sets port A to be all outputs.
  chip._RES.addListener(_res => {
    if (_res.low) {
      for (let i = 0; i < registers.length; i++) {
        registers[i] = 0x00
        latches[i] = i >= TIMALO && i <= TIMBHI ? 0xff : 0x00
      }
    }
  })

  // --------------------------------------------------------------------------
  // Register reading and writing

  // Reads and writes between the data bus and the registers only happens on translation of _CS
  // from high to low.
  chip._CS.addListener(pin => {
    if (pin.high) {
      setMode(OUTPUT, ...dataPins)
      valueToPins(null, ...dataPins)
    } else {
      const index = pinsToValue(...addressPins)
      if (chip.R__W.high) {
        valueToPins(readRegister(index), ...dataPins)
      } else {
        setMode(INPUT, ...dataPins)
        writeRegister(index, pinsToValue(...dataPins))
      }
    }
  })

  function readRegister(index) {
    switch (index) {
      case CIAPRB:
        return readPrb()
      case TODTEN:
        return readTenths()
      case TODHRS:
        return readHours()
      case CIAICR:
        return readIcr()
      default:
        return registers[index]
    }
  }

  function writeRegister(index, value) {
    switch (index) {
      case CIAPRA:
        writePra(value)
        break
      case CIAPRB:
        writePrb(value)
        break
      case CIDDRA:
        writeDdra(value)
        break
      case CIDDRB:
        writeDdrb(value)
        break
      case TIMALO:
      case TIMAHI:
      case TIMBLO:
      case TIMBHI:
        latches[index] = value
        break
      case TODTEN:
        writeTenths(value)
        break
      case TODSEC:
        writeSeconds(value)
        break
      case TODMIN:
        writeMinutes(value)
        break
      case TODHRS:
        writeHours(value)
        break
      case CIASDR:
        writeSdr(value)
        break
      case CIAICR:
        writeIcr(value)
        break
      case CIACRA:
        writeCra(value)
        break
      case CIACRB:
        writeCrb(value)
        break
      default:
        registers[index] = value
        break
    }
  }

  // _FLAG handling. Lowering this pin sets the appropriate bit in the ICR and fires an interrupt if
  // that bit is enabled by the ICR mask. This is potentially useful for handshaking with another
  // 6526 by receiving its _PC output on this pin.
  chip._FLAG.addListener(pin => {
    if (pin.low) {
      setBit(registers[CIAICR], ICR_FLG)
      if (bitSet(latches[CIAICR], ICR_FLG)) {
        setBit(registers[CIAICR], ICR_IR)
        chip._IRQ.clear()
      }
    }
  })

  return chip
}
