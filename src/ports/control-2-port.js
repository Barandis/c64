/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, BIDIRECTIONAL, INPUT } from "components/pin"

export function createControl2Port() {
  const pins = {
    JOYB0: createPin(1, "JOYB0", BIDIRECTIONAL),
    JOYB1: createPin(2, "JOYB1", BIDIRECTIONAL),
    JOYB2: createPin(3, "JOYB2", BIDIRECTIONAL),
    JOYB3: createPin(4, "JOYB3", BIDIRECTIONAL),
    POTBX: createPin(9, "POTBX", BIDIRECTIONAL),
    POTBY: createPin(5, "POTBY", BIDIRECTIONAL),
    BUTTONB: createPin(6, "BUTTONB", BIDIRECTIONAL),

    VCC: createPin(7, "VCC", INPUT, null),
    GND: createPin(8, "GND", INPUT, null),
  }

  const port = []
  port.pins = pins

  for (const name in pins) {
    const pin = pins[name]
    port[name] = pin
    port[pin.num] = pin
  }

  return port
}
