/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, createPinArray, OUTPUT, UNCONNECTED } from "components/pin"

export function createKeyboardPort() {
  // There is no pin 2; it is used for alignment.
  const pins = createPinArray(
    createPin(12, "ROW0", OUTPUT, null),
    createPin(11, "ROW1", OUTPUT, null),
    createPin(10, "ROW2", OUTPUT, null),
    createPin(5, "ROW3", OUTPUT, null),
    createPin(8, "ROW4", OUTPUT, null),
    createPin(7, "ROW5", OUTPUT, null),
    createPin(6, "ROW6", OUTPUT, null),
    createPin(9, "ROW7", OUTPUT, null),

    createPin(13, "COL0", INPUT),
    createPin(19, "COL1", INPUT),
    createPin(18, "COL2", INPUT),
    createPin(17, "COL3", INPUT),
    createPin(16, "COL4", INPUT),
    createPin(15, "COL5", INPUT),
    createPin(14, "COL6", INPUT),
    createPin(20, "COL7", INPUT),

    createPin(3, "_RESTORE", OUTPUT),

    createPin(2, "KEY", UNCONNECTED),
    createPin(3, "VCC", UNCONNECTED),
    createPin(1, "GND", UNCONNECTED),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
