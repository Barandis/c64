/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// Emulation of the 7408 series of quad 2-input AND gates. The variant used in the Commodore 64 was
// the 74LS08, but differences between variants boil down mostly to timing and levels, and this
// emulation should serve for all of them.
//
// The chip consists of four independent dual-input AND gates. The operation is what one would
// expect from AND gates - if both inputs are high, the output is high; otherwise the output is low.
//
// On the C64 schematic, U27 is a 74LS08.

import { newPin, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { newChip } from "components/chip"

export function new7408() {
  const chip = newChip(
    // Gate 1 inputs and output
    newPin(1, "A1", INPUT),
    newPin(2, "B1", INPUT),
    newPin(3, "Y1", OUTPUT, 0),

    // Gate 2 inputs and output
    newPin(4, "A2", INPUT),
    newPin(5, "B2", INPUT),
    newPin(6, "Y2", OUTPUT, 0),

    // Gate 3 inputs and output
    newPin(9, "A3", INPUT),
    newPin(10, "B3", INPUT),
    newPin(8, "Y3", OUTPUT, 0),

    // Gate 4 inputs and output
    newPin(12, "A4", INPUT),
    newPin(13, "B4", INPUT),
    newPin(11, "Y4", OUTPUT, 0),

    // Power supply and ground pins, not emulated
    newPin(14, "VCC", UNCONNECTED),
    newPin(7, "GND", UNCONNECTED),
  )

  function setOutput(apin, bpin, ypin) {
    ypin.state = apin.state && bpin.state
  }

  function setGate1() {
    setOutput(chip.A1, chip.B1, chip.Y1)
  }

  function setGate2() {
    setOutput(chip.A2, chip.B2, chip.Y2)
  }

  function setGate3() {
    setOutput(chip.A3, chip.B3, chip.Y3)
  }

  function setGate4() {
    setOutput(chip.A4, chip.B4, chip.Y4)
  }

  chip.A1.addListener(setGate1)
  chip.B1.addListener(setGate1)
  chip.A2.addListener(setGate2)
  chip.B2.addListener(setGate2)
  chip.A3.addListener(setGate3)
  chip.B3.addListener(setGate3)
  chip.A4.addListener(setGate4)
  chip.B4.addListener(setGate4)

  return chip
}
