/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, createPinArray, OUTPUT, UNCONNECTED } from "components/pin"

export function createControl2Port() {
  const pins = createPinArray(
    createPin(1, "JOYB0", OUTPUT, null),
    createPin(2, "JOYB1", OUTPUT, null),
    createPin(3, "JOYB2", OUTPUT, null),
    createPin(4, "JOYB3", OUTPUT, null),
    createPin(9, "POTBX", OUTPUT, null),
    createPin(5, "POTBY", OUTPUT, null),
    createPin(6, "BTNB", OUTPUT, null),

    createPin(7, "VCC", UNCONNECTED),
    createPin(8, "GND", UNCONNECTED),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
