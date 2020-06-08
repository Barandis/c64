// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  UNUSED1, POTX, PWHI1, PWHI2, PWHI3, MAX_LAST_WRITE_TIME,
} from "./constants"

import { Pin, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { Chip } from "components/chip"
import { setMode, valueToPins, pinsToValue } from "utils"

export function Ic6581() {
  const chip = Chip(
    // Address pins to access internal registers
    Pin(9, "A0", INPUT),
    Pin(10, "A1", INPUT),
    Pin(11, "A2", INPUT),
    Pin(12, "A3", INPUT),
    Pin(13, "A4", INPUT),

    // Data bus pins D0...D7. These are bidirectional but the direction
    // is set by the R__W pin.
    Pin(15, "D0", INPUT),
    Pin(16, "D1", INPUT),
    Pin(17, "D2", INPUT),
    Pin(18, "D3", INPUT),
    Pin(19, "D4", INPUT),
    Pin(20, "D5", INPUT),
    Pin(21, "D6", INPUT),
    Pin(22, "D7", INPUT),

    // Potentiometer pins. These are analog inputs that are fed to the
    // A/D converters.
    Pin(24, "POTX", INPUT),
    Pin(23, "POTY", INPUT),

    // Audio input and output. These are obviously analog and are mostly
    // given names that have spaces in them such as "AUDIO OUT" and "EXT
    // IN"; since that is more difficult to work with the names here are
    // without spaces.
    Pin(27, "AUDIO", OUTPUT),
    Pin(26, "EXT", INPUT),

    // Clock input.
    Pin(6, "φ2", INPUT),

    // Read/write control pin. If this is high then data is being read
    // from the SID, else data is being written to it.
    Pin(7, "R__W", INPUT),

    // Chip select pin. If this is high then the data bus is hi-Z stated
    // and no response is made to address pins.
    Pin(8, "_CS", INPUT),

    // Resets the chip when it goes low.
    Pin(5, "_RES", INPUT),

    // Filter capacitor connections. Larger capacitors, necessary for
    // the proper operation of the on-board filters, are connected
    // across these pairs of pins. There is no need to emulate them
    // here.
    Pin(1, "CAP1A", UNCONNECTED),
    Pin(2, "CAP1B", UNCONNECTED),
    Pin(3, "CAP2A", UNCONNECTED),
    Pin(4, "CAP2B", UNCONNECTED),

    // Power supply and ground pins. These are not emulated.
    Pin(25, "VCC", UNCONNECTED),
    Pin(28, "VDD", UNCONNECTED),
    Pin(14, "GND", UNCONNECTED),
  )

  const addressPins = [chip.RS0, chip.RS1, chip.RS2, chip.RS3]
  const dataPins = [
    chip.D0, chip.D1, chip.D2, chip.D3, chip.D4, chip.D5, chip.D6, chip.D7,
  ]

  // The 32 addressable registers on the 6581. Only 29 of these are
  // actually used; reading the others will always return 0xff and
  // writing them will have no effect.
  const registers = new Uint8Array(32)

  // -------------------------------------------------------------------
  // Reset

  // The spec says that _RES must be low for at least 10 cycles before a
  // reset will occur. This variable is set to 0 when _RES first goes
  // low, and each φ2 cycle increments it. When it gets to 10, `reset()`
  // will be called.
  let resetClock = 0

  // Flag to know whether the chip has reset since the last time _RES
  // went low. This is used to ensure that the chip only resets once,
  // rather than once every 10 cycles as long as _RES is held low.
  let hasReset = false

  // This is the result of a reset according to the specs of the device.
  // This is pretty simple since the only outputs are the data lines and
  // the audio out; all registers are set to zero, audio output is
  // silenced, and data lines are set back to their normal unconnected
  // state.
  //
  // Since the three unused registers always return 0xff, we just set
  // that here and keep it from changing.
  //
  // TODO: For now, we're simply setting the registers directly rather
  // than using the `writeRegister` function to do it because there are
  // no side effects in writing them; when sound is implemented this may
  // or may not change.
  function reset() {
    for (let i = 0; i < 32; i++) {
      registers[i] = i >= UNUSED1 ? 0xff : 0x00
    }
    for (let i = 0; i < 8; i++) {
      const name = `D${i}`
      chip[name].mode = OUTPUT
      chip[name].level = null
    }
  }

  chip._RES.addListener(pin => {
    if (pin.low) {
      resetClock = 0
    } else {
      hasReset = false
    }
  })

  chip.φ2.addListener(pin => {
    if (pin.high && chip._RES.low && !hasReset) {
      resetClock++
      if (resetClock >= 10) {
        reset()
        hasReset = true
      }
    }
  })

  // -------------------------------------------------------------------
  // Register reading and writing

  let lastWriteValue = 0
  let lastWriteTime = 0

  // Reads and writes between the data bus and the registers only
  // happens on translation of _CS from high to low.
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

  // Keeps track of how many cycles have passed since the last write to
  // a write-only register. If it has exceeded max, then lastWriteValue
  // becomes 0.
  chip.φ2.addListener(pin => {
    if (pin.high) {
      lastWriteTime++
      if (lastWriteTime > MAX_LAST_WRITE_TIME) {
        lastWriteValue = 0
      }
    }
  })

  // Reads a SID register. This only works as expected for the four
  // read-only registers.
  //
  // The three unused registers always return 0xff. The write-only
  // registers return the value of the last write made to *any* SID
  // register. However, in the real chip this last-write value 'fades'
  // over time until, after 2000-4000 clock cycles, it is zero. The
  // model for this fading is unknown and is not properly emulated here;
  // this emulation simply returns the last written value as long as the
  // last write has happened in the last 2000 cycles; otherwise it
  // returns 0.
  function readRegister(index) {
    if (index < POTX) {
      return lastWriteValue
    }
    return registers[index]
  }

  // Writes a value to a register. This does not affect the read-only
  // and unused registers, and the high byte of the pulse-width
  // registers only sees its low 4 bits written (the high 4 bits remain,
  // as always, 0).
  function writeRegister(index, value) {
    if (index === PWHI1 || index === PWHI2 || index === PWHI3) {
      // Strip the upper four bits so that the register always has 0's
      // there
      registers[index] = value & 0x0f
      lastWriteTime = 0
    } else if (index < POTX) {
      registers[index] = value
      lastWriteTime = 0
    }
  }

  reset()

  return chip
}
