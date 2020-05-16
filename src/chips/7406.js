/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// An emulation of the 7406 family of hex inverters. The version used in the C64 was the 7406, but
// differences between versions involve electrical levels and timing and this emulation should work
// for all of them.
//
// The inverter is the simplest of logic circuits: if an input is high, the output will be low. If
// the input is low, the output will be high. That's all there is to it.
//
// On the C64 schematic, U8 is a 7406.

import { createPin, INPUT, OUTPUT } from "circuits/pin"
import { LOW, HIGH, HI_Z } from "circuits/state"

export function create7406() {
  const pins = {
    // Input pins. In the TI data sheet, these are named "1A", "2A", etc., and the C64 schematic
    // does not suggest named for them. Since these names are not legal JS variable names, I've
    // switched the letter and number.
    A1: createPin(1, "A1", INPUT),
    A2: createPin(3, "A2", INPUT),
    A3: createPin(5, "A3", INPUT),
    A4: createPin(9, "A4", INPUT),
    A5: createPin(11, "A5", INPUT),
    A6: createPin(13, "A6", INPUT),

    // Output pins. Similarly, the TI data sheet refers to these as "1Y", "2Y", etc.
    Y1: createPin(2, "Y1", OUTPUT, HIGH),
    Y2: createPin(4, "Y2", OUTPUT, HIGH),
    Y3: createPin(6, "Y3", OUTPUT, HIGH),
    Y4: createPin(8, "Y4", OUTPUT, HIGH),
    Y5: createPin(10, "Y5", OUTPUT, HIGH),
    Y6: createPin(12, "Y6", OUTPUT, HIGH),

    // Power supply and ground pins, not emulated
    VCC: createPin(14, "VCC", INPUT, HI_Z),
    GND: createPin(7, "GND", INPUT, HI_Z),
  }

  function inputChanged(apin, ypin) {
    ypin.state = apin.high ? LOW : HIGH
  }

  for (let i = 1; i <= 6; i++) {
    pins[`A${i}`].addListener(() => inputChanged(pins[`A${i}`], pins[`Y${i}`]))
  }

  const inverter = {
    pins,
  }

  for (const name in pins) {
    inverter[name] = pins[name]
  }

  return inverter
}
