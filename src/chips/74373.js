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

import { createPin, INPUT, OUTPUT } from "components/pin"

export function create74373() {
  const pins = {
    // Input pins.
    D0: createPin(3, "D0", INPUT),
    D1: createPin(4, "D1", INPUT),
    D2: createPin(7, "D2", INPUT),
    D3: createPin(8, "D3", INPUT),
    D4: createPin(13, "D4", INPUT),
    D5: createPin(14, "D5", INPUT),
    D6: createPin(17, "D6", INPUT),
    D7: createPin(18, "D7", INPUT),

    // Output pins.
    O0: createPin(2, "O0", OUTPUT, false),
    O1: createPin(5, "O1", OUTPUT, false),
    O2: createPin(6, "O2", OUTPUT, false),
    O3: createPin(9, "O3", OUTPUT, false),
    O4: createPin(12, "O4", OUTPUT, false),
    O5: createPin(15, "O5", OUTPUT, false),
    O6: createPin(16, "O6", OUTPUT, false),
    O7: createPin(19, "O7", OUTPUT, false),

    // Output enable. When this is high, the outputs function normally according to their inputs
    // and LE. When this is low, the outputs are all hi-Z.
    _OE: createPin(1, "_OE", INPUT),

    // Latch enable. When set high, data flows transparently through the device, with output pins
    // matching their input pins. When it goes low, the output pins remain in their current state
    // for as long as LE is low, no matter what the inputs do.
    LE: createPin(11, "LE", INPUT),

    // Power supply and ground pins. These are not emulated.
    GND: createPin(10, "GND", INPUT, null),
    VCC: createPin(20, "VCC", INPUT, null),
  }

  // "Memory" for the latched values. When _OE returns high while LE is low, these values will
  // be put onto the output pins. (Otherwise, if LE is high, the output pins just get the values
  // of the input pins like normal.)
  const latches = [false, false, false, false, false, false, false, false]

  function inputChanged(dpin, opin) {
    if (pins.LE.high && pins._OE.low) {
      opin.state = dpin.state
    }
  }

  function latchChanged(le) {
    if (le.low) {
      for (let i = 0; i < 8; i++) {
        latches[i] = pins[`D${i}`].state
      }
    } else {
      for (let i = 0; i < 8; i++) {
        pins[`O${i}`].state = pins[`D${i}`].state
        latches[i] = null
      }
    }
  }

  function enableChanged(_oe) {
    if (_oe.high) {
      for (let i = 0; i < 8; i++) {
        pins[`O${i}`].state = null
      }
    } else {
      const le = pins.LE.low
      for (let i = 0; i < 8; i++) {
        pins[`O${i}`].state = le ? latches[i] : pins[`D${i}`].state
      }
    }
  }

  for (let i = 0; i < 8; i++) {
    pins[`D${i}`].addListener(() => inputChanged(pins[`D${i}`], pins[`O${i}`]))
  }
  pins.LE.addListener(latchChanged)
  pins._OE.addListener(enableChanged)

  const latch = {
    pins,
  }

  for (const name in pins) {
    latch[name] = pins[name]
  }

  return latch
}
