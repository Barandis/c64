/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, BIDIRECTIONAL, INPUT, createPinArray } from "components/pin"

export function createControl2Port() {
  const pins = createPinArray(
    createPin(1, "JOYB0", BIDIRECTIONAL),
    createPin(2, "JOYB1", BIDIRECTIONAL),
    createPin(3, "JOYB2", BIDIRECTIONAL),
    createPin(4, "JOYB3", BIDIRECTIONAL),
    createPin(9, "POTBX", BIDIRECTIONAL),
    createPin(5, "POTBY", BIDIRECTIONAL),
    createPin(6, "BUTTONB", BIDIRECTIONAL),

    createPin(7, "VCC", INPUT, null),
    createPin(8, "GND", INPUT, null),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
