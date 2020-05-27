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

import { newPin, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { newChip } from "components/chip"

export function new7406() {
  const chip = newChip(
    // Input pins. In the TI data sheet, these are named "1A", "2A", etc., and the C64 schematic
    // does not suggest named for them. Since these names are not legal JS variable names, I've
    // switched the letter and number.
    newPin(1, "A1", INPUT),
    newPin(3, "A2", INPUT),
    newPin(5, "A3", INPUT),
    newPin(9, "A4", INPUT),
    newPin(11, "A5", INPUT),
    newPin(13, "A6", INPUT),

    // Output pins. Similarly, the TI data sheet refers to these as "1Y", "2Y", etc.
    newPin(2, "Y1", OUTPUT),
    newPin(4, "Y2", OUTPUT),
    newPin(6, "Y3", OUTPUT),
    newPin(8, "Y4", OUTPUT),
    newPin(10, "Y5", OUTPUT),
    newPin(12, "Y6", OUTPUT),

    // Power supply and ground pins, not emulated
    newPin(14, "VCC", UNCONNECTED),
    newPin(7, "GND", UNCONNECTED),
  )

  chip.Y1.set()
  chip.Y2.set()
  chip.Y3.set()
  chip.Y4.set()
  chip.Y5.set()
  chip.Y6.set()

  chip.A1.addListener(pin => (chip.Y1.level = pin.low))
  chip.A2.addListener(pin => (chip.Y2.level = pin.low))
  chip.A3.addListener(pin => (chip.Y3.level = pin.low))
  chip.A4.addListener(pin => (chip.Y4.level = pin.low))
  chip.A5.addListener(pin => (chip.Y5.level = pin.low))
  chip.A6.addListener(pin => (chip.Y6.level = pin.low))

  return chip
}
