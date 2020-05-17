/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, OUTPUT } from "circuits/pin"
import { LOW, HIGH, HI_Z } from "circuits/state"

export function create74LS08() {
  const pins = {
    // Gate 1 inputs and output
    A1: createPin(1, "A1", INPUT),
    B1: createPin(2, "B1", INPUT),
    Y1: createPin(3, "Y1", OUTPUT, LOW),

    // Gate 2 inputs and output
    A2: createPin(4, "A2", INPUT),
    B2: createPin(5, "B2", INPUT),
    Y2: createPin(6, "Y2", OUTPUT, LOW),

    // Gate 3 inputs and output
    A3: createPin(9, "A3", INPUT),
    B3: createPin(10, "B3", INPUT),
    Y3: createPin(8, "Y3", OUTPUT, LOW),

    // Gate 4 inputs and output
    A4: createPin(12, "A4", INPUT),
    B4: createPin(13, "B4", INPUT),
    Y4: createPin(11, "Y4", OUTPUT, LOW),

    // Power supply and ground pins, not emulated
    VCC: createPin(14, "VCC", INPUT, HI_Z),
    GND: createPin(7, "GND", INPUT, HI_Z),
  }

  function setOutput(apin, bpin, ypin) {
    ypin.state = apin.state === HIGH && bpin.state === HIGH ? HIGH : LOW
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
