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

import { createPin, INPUT, OUTPUT, createPinArray } from "components/pin"

export function create7406() {
  const pins = createPinArray(
    // Input pins. In the TI data sheet, these are named "1A", "2A", etc., and the C64 schematic
    // does not suggest named for them. Since these names are not legal JS variable names, I've
    // switched the letter and number.
    createPin(1, "A1", INPUT),
    createPin(3, "A2", INPUT),
    createPin(5, "A3", INPUT),
    createPin(9, "A4", INPUT),
    createPin(11, "A5", INPUT),
    createPin(13, "A6", INPUT),

    // Output pins. Similarly, the TI data sheet refers to these as "1Y", "2Y", etc.
    createPin(2, "Y1", OUTPUT, true),
    createPin(4, "Y2", OUTPUT, true),
    createPin(6, "Y3", OUTPUT, true),
    createPin(8, "Y4", OUTPUT, true),
    createPin(10, "Y5", OUTPUT, true),
    createPin(12, "Y6", OUTPUT, true),

    // Power supply and ground pins, not emulated
    createPin(14, "VCC", INPUT, null),
    createPin(7, "GND", INPUT, null),
  )

  function inputChanged(apin, ypin) {
    ypin.state = apin.low
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
