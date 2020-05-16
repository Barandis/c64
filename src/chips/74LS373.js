/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, OUTPUT } from "circuits/pin"
import { LOW, HIGH, HI_Z } from "circuits/state"

export function create74LS373() {
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
    O0: createPin(2, "O0", OUTPUT),
    O1: createPin(5, "O1", OUTPUT),
    O2: createPin(6, "O2", OUTPUT),
    O3: createPin(9, "O3", OUTPUT),
    O4: createPin(12, "O4", OUTPUT),
    O5: createPin(15, "O5", OUTPUT),
    O6: createPin(16, "O6", OUTPUT),
    O7: createPin(19, "O7", OUTPUT),

    // Output enable. When this is high, the outputs function normally according to their inputs
    // and LE. When this is low, the outputs are all hi-Z.
    _OE: createPin(1, "_OE", INPUT),

    // Latch enable. When set high, data flows transparently through the device, with output pins
    // matching their input pins. When it goes low, the output pins remain in their current state
    // for as long as LE is low, no matter what the inputs do.
    LE: createPin(11, "LE", INPUT),

    // Power supply and ground pins. These are not emulated.
    GND: createPin(10, "GND", INPUT, HI_Z),
    VCC: createPin(20, "VCC", INPUT, HI_Z),
  }

  // "Memory" for the latched values. When _OE returns high while LE is low, these values will
  // be put onto the output pins. (Otherwise, if LE is high, the output pins just get the values
  // of the input pins like normal.)
  const latches = []

  function inputChanged(dpin, opin) {
    if (pins.LE.state === HIGH && pins._OE.state === LOW) {
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
        pins[`O${i}`].state = HI_Z
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
