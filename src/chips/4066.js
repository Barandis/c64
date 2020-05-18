/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, OUTPUT, INPUT_OUTPUT } from "circuits/pin"

export function create4066() {
  const pins = {
    X1: createPin(1, "X1", INPUT_OUTPUT),
    Y1: createPin(2, "Y1", INPUT_OUTPUT),
    A1: createPin(13, "A1", INPUT),

    X2: createPin(3, "X2", INPUT_OUTPUT),
    Y2: createPin(4, "Y2", INPUT_OUTPUT),
    A2: createPin(5, "A2", INPUT),

    X3: createPin(9, "X3", INPUT_OUTPUT),
    Y3: createPin(8, "Y3", INPUT_OUTPUT),
    A3: createPin(6, "A3", INPUT),

    X4: createPin(11, "X4", INPUT_OUTPUT),
    Y4: createPin(10, "Y4", INPUT_OUTPUT),
    A4: createPin(12, "A4", INPUT),

    VDD: createPin(14, "VDD", "INPUT", null),
    GND: createPin(7, "GND", INPUT, null),
  }

  pins.Y1.mode = OUTPUT
  pins.Y2.mode = OUTPUT
  pins.Y3.mode = OUTPUT
  pins.Y4.mode = OUTPUT

  function setOutput(apin, xpin, ypin) {
    if (xpin.mode === INPUT && ypin.mode === OUTPUT) {
      ypin.value = apin.low ? 0 : xpin.value
    } else if (ypin.mode === INPUT && xpin.mode === OUTPUT) {
      xpin.value = apin.low ? 0 : ypin.value
    }
  }

  function setSwitch1() {
    setOutput(pins.A1, pins.X1, pins.Y1)
  }

  function setSwitch2() {
    setOutput(pins.A2, pins.X2, pins.Y2)
  }

  function setSwitch3() {
    setOutput(pins.A3, pins.X3, pins.Y3)
  }

  function setSwitch4() {
    setOutput(pins.A4, pins.X4, pins.Y4)
  }

  pins.A1.addListener(setSwitch1)
  pins.X1.addListener(setSwitch1)
  pins.Y1.addListener(setSwitch1)
  pins.A2.addListener(setSwitch2)
  pins.X2.addListener(setSwitch2)
  pins.Y2.addListener(setSwitch2)
  pins.A3.addListener(setSwitch3)
  pins.X3.addListener(setSwitch3)
  pins.Y3.addListener(setSwitch3)
  pins.A4.addListener(setSwitch4)
  pins.X4.addListener(setSwitch4)
  pins.Y4.addListener(setSwitch4)

  const switches = {
    pins,
  }

  for (const name in pins) {
    switches[name] = pins[name]
  }

  return switches
}
