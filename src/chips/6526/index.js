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
  CRA_LOAD,
  CRB_LOAD,
  CRB_ALRM,
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
    newPin(33, "D0", OUTPUT),
    newPin(32, "D1", OUTPUT),
    newPin(31, "D2", OUTPUT),
    newPin(30, "D3", OUTPUT),
    newPin(29, "D4", OUTPUT),
    newPin(28, "D5", OUTPUT),
    newPin(27, "D6", OUTPUT),
    newPin(26, "D7", OUTPUT),

    // Parallel Port A pins. These are bidirectional but the direction is switchable via register.
    newPin(2, "PA0", INPUT).pullUp(),
    newPin(3, "PA1", INPUT).pullUp(),
    newPin(4, "PA2", INPUT).pullUp(),
    newPin(5, "PA3", INPUT).pullUp(),
    newPin(6, "PA4", INPUT).pullUp(),
    newPin(7, "PA5", INPUT).pullUp(),
    newPin(8, "PA6", INPUT).pullUp(),
    newPin(9, "PA7", INPUT).pullUp(),

    // Parallel Port B pins. These are bidirectional but the direction is switchable via register.
    newPin(10, "PB0", INPUT).pullUp(),
    newPin(11, "PB1", INPUT).pullUp(),
    newPin(12, "PB2", INPUT).pullUp(),
    newPin(13, "PB3", INPUT).pullUp(),
    newPin(14, "PB4", INPUT).pullUp(),
    newPin(15, "PB5", INPUT).pullUp(),
    newPin(16, "PB6", INPUT).pullUp(),
    newPin(17, "PB7", INPUT).pullUp(),

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
    newPin(21, "_IRQ", OUTPUT),

    // Serial port. This is bidirectional but the direction is chosen by a control bit.
    newPin(39, "SP", INPUT),

    // Count pin. This is used for a couple of different purposes. As an input (its default state),
    // it can provide pulses for the interval timers to count, or it can be used to signal that a
    // new bit is available to receive on the serial port. It can serve as an output as well; in
    // that case the 6526 uses it to signal to the outside that an outgoing bit is ready on the
    // serial port pin.
    newPin(40, "CNT", INPUT),

    // System clock input. In the 6526 this is expected to be a 1 MHz clock. It's actually typically
    // named "φ2" but that's difficult to type.
    newPin(25, "O2", INPUT),

    // TOD clock input. This can be either 50Hz or 60Hz, selectable from a control register.
    newPin(19, "TOD", INPUT),

    // Chip select pin. When this is low, the chip responds to R/W and register select signals.
    // When it's high, the data pins go high impedance.
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
  //
  // This function does the following:
  // 1. Sets interval timer registers to max (0xff each)
  // 2. Clears all other registers (0x00 each) *
  // 3. Clears the IRQ mask in the ICR latch
  // 4. Disconnects all data lines
  // 5. Sets SP and CNT as inputs
  // 6. Resets _IRQ and _PC outputs to their default values
  //
  // * Note that pins PA0...PA7 and PB0...PB7 are pulled up by internal resistors, which is
  //   emulated, so the PCR registers will read all 1's for unconnected lines on reset.
  function reset() {
    // Backwards order to hit control registers first, so we know we're setting the TOD clock later
    // and not the TOD alarm, and also to ensure hours gets hit before tenths so we know the clock
    // hasn't halted
    for (let i = registers.length; i >= 0; i--) {
      // Timer latches get all 1's; ICR mask gets all flags reset; all others get all 0's
      const value = i >= TIMALO && i <= TIMBHI ? 0xff : i === CIAICR ? 0x7f : 0x00
      writeRegister(i, value)
    }
    // Force latched timer values into timer registers
    writeRegister(CIACRA, 1 << CRA_LOAD)
    writeRegister(CIACRB, 1 << CRB_LOAD)
    // Read ICR to clear all IRQ flags and release IRQ line
    readRegister(CIAICR)
    // Write zeroes to the TOD alarm
    writeRegister(CIACRB, 1 << CRB_ALRM)
    writeRegister(TODHRS, 0)
    writeRegister(TODMIN, 0)
    writeRegister(TODSEC, 0)
    writeRegister(TODTEN, 0)
    writeRegister(CIACRB, 0)

    chip._PC.set()

    for (let i = 0; i < 8; i++) {
      const name = `D${i}`
      chip[name].mode = OUTPUT
      chip[name].level = null
    }
  }

  chip._RES.addListener(_res => {
    if (_res.low) {
      reset()
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
    }
  }

  // _FLAG handling. Lowering this pin sets the appropriate bit in the ICR and fires an interrupt if
  // that bit is enabled by the ICR mask. This is potentially useful for handshaking with another
  // 6526 by receiving its _PC output on this pin.
  chip._FLAG.addListener(pin => {
    if (pin.low) {
      registers[CIAICR] = setBit(registers[CIAICR], ICR_FLG)
      if (bitSet(latches[CIAICR], ICR_FLG)) {
        registers[CIAICR] = setBit(registers[CIAICR], ICR_IR)
        chip._IRQ.clear()
      }
    }
  })

  reset()

  return chip
}
