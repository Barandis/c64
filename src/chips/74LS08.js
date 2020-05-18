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

import { createPin, INPUT, OUTPUT } from "circuits/pin"

export function create74LS08() {
  const pins = {
    // Gate 1 inputs and output
    A1: createPin(1, "A1", INPUT),
    B1: createPin(2, "B1", INPUT),
    Y1: createPin(3, "Y1", OUTPUT, 0),

    // Gate 2 inputs and output
    A2: createPin(4, "A2", INPUT),
    B2: createPin(5, "B2", INPUT),
    Y2: createPin(6, "Y2", OUTPUT, 0),

    // Gate 3 inputs and output
    A3: createPin(9, "A3", INPUT),
    B3: createPin(10, "B3", INPUT),
    Y3: createPin(8, "Y3", OUTPUT, 0),

    // Gate 4 inputs and output
    A4: createPin(12, "A4", INPUT),
    B4: createPin(13, "B4", INPUT),
    Y4: createPin(11, "Y4", OUTPUT, 0),

    // Power supply and ground pins, not emulated
    VCC: createPin(14, "VCC", INPUT, null),
    GND: createPin(7, "GND", INPUT, null),
  }

  function setOutput(apin, bpin, ypin) {
    ypin.state = apin.state && bpin.state
  }

  function setGate1() {
    setOutput(pins.A1, pins.B1, pins.Y1)
  }

  function setGate2() {
    setOutput(pins.A2, pins.B2, pins.Y2)
  }

  function setGate3() {
    setOutput(pins.A3, pins.B3, pins.Y3)
  }

  function setGate4() {
    setOutput(pins.A4, pins.B4, pins.Y4)
  }

  pins.A1.addListener(setGate1)
  pins.B1.addListener(setGate1)
  pins.A2.addListener(setGate2)
  pins.B2.addListener(setGate2)
  pins.A3.addListener(setGate3)
  pins.B3.addListener(setGate3)
  pins.A4.addListener(setGate4)
  pins.B4.addListener(setGate4)

  const gates = {
    pins,
  }

  for (const name in pins) {
    gates[name] = pins[name]
  }

  return gates
}
