/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// An emulation of the 74373 family of octal, tri-state transparent latches. The version used in the
// C64 was the 74LS373, but the differences between members are electrical in nature and this
// emulation should serve for all of them.
//
// The concept of this chip is quite simple. When the LE pin is low, data flows transparently
// through the chip from its input pins (D0...D7) to their respective output pins (O0...O7). Once
// LE goes high, however, the current state of the input pins is latched, and that state will remain
// fixed on the output pins for as long as LE remains high, no matter what changes are made to the
// input pins. Once LE returns to low, transparent operation resumes and the output pins again
// reflect their inputs.
//
// The _OE pin can be set to high to force the outputs into a high-impedance state, effectively
// cutting them off from the rest of the circuit. This allows the chip to be used on busses. The
// latches remain active while in hi-Z; once _OE returns to low, if LE is high, then the output pins
// will be immediately set to the latched values (if LE is low, they'll be set to the input values
// as normal).
//
// On the C64 schematic, there is a 74LS373 at U26.

import { newPin, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { newChip } from "components/chip"

export function new74373() {
  const chip = newChip(
    // Input pins.
    newPin(3, "D0", INPUT),
    newPin(4, "D1", INPUT),
    newPin(7, "D2", INPUT),
    newPin(8, "D3", INPUT),
    newPin(13, "D4", INPUT),
    newPin(14, "D5", INPUT),
    newPin(17, "D6", INPUT),
    newPin(18, "D7", INPUT),

    // Output pins.
    newPin(2, "O0", OUTPUT),
    newPin(5, "O1", OUTPUT),
    newPin(6, "O2", OUTPUT),
    newPin(9, "O3", OUTPUT),
    newPin(12, "O4", OUTPUT),
    newPin(15, "O5", OUTPUT),
    newPin(16, "O6", OUTPUT),
    newPin(19, "O7", OUTPUT),

    // Output enable. When this is high, the outputs function normally according to their inputs
    // and LE. When this is low, the outputs are all hi-Z.
    newPin(1, "_OE", INPUT),

    // Latch enable. When set high, data flows transparently through the device, with output pins
    // matching their input pins. When it goes low, the output pins remain in their current state
    // for as long as LE is low, no matter what the inputs do.
    newPin(11, "LE", INPUT),

    // Power supply and ground pins. These are not emulated.
    newPin(10, "GND", UNCONNECTED),
    newPin(20, "VCC", UNCONNECTED),
  )

  // "Memory" for the latched values. When _OE returns high while LE is low, these values will
  // be put onto the output pins. (Otherwise, if LE is high, the output pins just get the values
  // of the input pins like normal.)
  const latches = [false, false, false, false, false, false, false, false]

  function inputChanged(dpin, opin) {
    if (chip.LE.high && chip._OE.low) {
      opin.level = dpin.level
    }
  }

  function latchChanged(le) {
    if (le.low) {
      for (let i = 0; i < 8; i++) {
        latches[i] = !!chip[`D${i}`].level
      }
    } else {
      for (let i = 0; i < 8; i++) {
        chip[`O${i}`].level = chip[`D${i}`].level
        latches[i] = null
      }
    }
  }

  function enableChanged(_oe) {
    if (_oe.high) {
      for (let i = 0; i < 8; i++) {
        chip[`O${i}`].float()
      }
    } else {
      const le = chip.LE.low
      for (let i = 0; i < 8; i++) {
        chip[`O${i}`].level = le ? latches[i] : chip[`D${i}`].level
      }
    }
  }

  for (let i = 0; i < 8; i++) {
    chip[`D${i}`].addListener(() => inputChanged(chip[`D${i}`], chip[`O${i}`]))
  }
  chip.LE.addListener(latchChanged)
  chip._OE.addListener(enableChanged)

  return chip
}
