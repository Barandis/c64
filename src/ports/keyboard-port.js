/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, BIDIRECTIONAL, createPinArray } from "components/pin"

export function createKeyboardPort() {
  // There is no pin 2; it is used for alignment.
  const pins = createPinArray(
    createPin(12, "ROW0", BIDIRECTIONAL),
    createPin(11, "ROW1", BIDIRECTIONAL),
    createPin(10, "ROW2", BIDIRECTIONAL),
    createPin(5, "ROW3", BIDIRECTIONAL),
    createPin(8, "ROW4", BIDIRECTIONAL),
    createPin(7, "ROW5", BIDIRECTIONAL),
    createPin(6, "ROW6", BIDIRECTIONAL),
    createPin(9, "ROW7", BIDIRECTIONAL),

    createPin(13, "COL0", BIDIRECTIONAL),
    createPin(19, "COL1", BIDIRECTIONAL),
    createPin(18, "COL2", BIDIRECTIONAL),
    createPin(17, "COL3", BIDIRECTIONAL),
    createPin(16, "COL4", BIDIRECTIONAL),
    createPin(15, "COL5", BIDIRECTIONAL),
    createPin(14, "COL6", BIDIRECTIONAL),
    createPin(20, "COL7", BIDIRECTIONAL),

    createPin(3, "_RESTORE", BIDIRECTIONAL),

    createPin(1, "GND", INPUT, null),
    createPin(3, "VCC", INPUT, null),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
