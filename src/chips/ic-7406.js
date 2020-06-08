// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 7406 family of hex inverters. The version used in
// the C64 was the 7406, but differences between versions involve
// electrical levels and timing and this emulation should work for all
// of them.
//
// The inverter is the simplest of logic circuits: if an input is high,
// the output will be low. If the input is low, the output will be high.
// That's all there is to it.
//
// On the C64 schematic, U8 is a 7406.

import { Pin, INPUT, OUTPUT } from "components/pin"
import { Chip } from "components/chip"

export function Ic7406() {
  const chip = Chip(
    // Input pins. In the TI data sheet, these are named "1A", "2A",
    // etc., and the C64 schematic does not suggest named for them.
    // Since these names are not legal JS variable names, I've switched
    // the letter and number.
    Pin(1, "A1", INPUT),
    Pin(3, "A2", INPUT),
    Pin(5, "A3", INPUT),
    Pin(9, "A4", INPUT),
    Pin(11, "A5", INPUT),
    Pin(13, "A6", INPUT),

    // Output pins. Similarly, the TI data sheet refers to these as
    // "1Y", "2Y", etc.
    Pin(2, "Y1", OUTPUT).set(),
    Pin(4, "Y2", OUTPUT).set(),
    Pin(6, "Y3", OUTPUT).set(),
    Pin(8, "Y4", OUTPUT).set(),
    Pin(10, "Y5", OUTPUT).set(),
    Pin(12, "Y6", OUTPUT).set(),

    // Power supply and ground pins, not emulated
    Pin(14, "VCC"),
    Pin(7, "GND"),
  )

  chip.A1.addListener(pin => (chip.Y1.level = pin.low))
  chip.A2.addListener(pin => (chip.Y2.level = pin.low))
  chip.A3.addListener(pin => (chip.Y3.level = pin.low))
  chip.A4.addListener(pin => (chip.Y4.level = pin.low))
  chip.A5.addListener(pin => (chip.Y5.level = pin.low))
  chip.A6.addListener(pin => (chip.Y6.level = pin.low))

  return chip
}
