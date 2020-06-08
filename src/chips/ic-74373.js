// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 74373 family of octal, tri-state transparent
// latches. The version used in the C64 was the 74LS373, but the
// differences between members are electrical in nature and this
// emulation should serve for all of them.
//
// The concept of this chip is quite simple. When the LE pin is low,
// data flows transparently through the chip from its input pins
// (D0...D7) to their respective output pins (O0...O7). Once LE goes
// high, however, the current state of the input pins is latched, and
// that state will remain fixed on the output pins for as long as LE
// remains high, no matter what changes are made to the input pins. Once
// LE returns to low, transparent operation resumes and the output pins
// again reflect their inputs.
//
// The _OE pin can be set to high to force the outputs into a
// high-impedance state, effectively cutting them off from the rest of
// the circuit. This allows the chip to be used on busses. The latches
// remain active while in hi-Z; once _OE returns to low, if LE is high,
// then the output pins will be immediately set to the latched values
// (if LE is low, they'll be set to the input values as normal).
//
// On the C64 schematic, there is a 74LS373 at U26.

import { Chip, Pin, INPUT, OUTPUT } from "components"
import { range } from "utils"

export function Ic74373() {
  const chip = Chip(
    // Input pins.
    Pin(3, "D0", INPUT),
    Pin(4, "D1", INPUT),
    Pin(7, "D2", INPUT),
    Pin(8, "D3", INPUT),
    Pin(13, "D4", INPUT),
    Pin(14, "D5", INPUT),
    Pin(17, "D6", INPUT),
    Pin(18, "D7", INPUT),

    // Output pins.
    Pin(2, "O0", OUTPUT).clear(),
    Pin(5, "O1", OUTPUT).clear(),
    Pin(6, "O2", OUTPUT).clear(),
    Pin(9, "O3", OUTPUT).clear(),
    Pin(12, "O4", OUTPUT).clear(),
    Pin(15, "O5", OUTPUT).clear(),
    Pin(16, "O6", OUTPUT).clear(),
    Pin(19, "O7", OUTPUT).clear(),

    // Output enable. When this is high, the outputs function normally
    // according to their inputs and LE. When this is low, the outputs
    // are all hi-Z.
    Pin(1, "_OE", INPUT),

    // Latch enable. When set high, data flows transparently through the
    // device, with output pins matching their input pins. When it goes
    // low, the output pins remain in their current state for as long as
    // LE is low, no matter what the inputs do.
    Pin(11, "LE", INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(10, "GND"),
    Pin(20, "VCC"),
  )

  // "Memory" for the latched values. When _OE returns high while LE is
  // low, these values will be put onto the output pins. (Otherwise, if
  // LE is high, the output pins just get the values of the input pins
  // like normal.)
  const latches = [false, false, false, false, false, false, false, false]

  function inputChanged(dpin, opin) {
    if (chip.LE.high && chip._OE.low) {
      opin.level = dpin.level
    }
  }

  function latchChanged(le) {
    if (le.low) {
      for (const i of range(8)) {
        latches[i] = !!chip[`D${i}`].level
      }
    } else {
      for (const i of range(8)) {
        chip[`O${i}`].level = chip[`D${i}`].level
        latches[i] = null
      }
    }
  }

  function enableChanged(_oe) {
    if (_oe.high) {
      for (const i of range(8)) {
        chip[`O${i}`].float()
      }
    } else {
      const le = chip.LE.low
      for (const i of range(8)) {
        chip[`O${i}`].level = le ? latches[i] : chip[`D${i}`].level
      }
    }
  }

  for (const i of range(8)) {
    chip[`D${i}`].addListener(() => inputChanged(chip[`D${i}`], chip[`O${i}`]))
  }
  chip.LE.addListener(latchChanged)
  chip._OE.addListener(enableChanged)

  return chip
}
