/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, BIDIRECTIONAL } from "components/pin"

export function createKeyboardPort() {
  // There is no pin 2; it is used for alignment.
  const pins = {
    ROW0: createPin(12, "ROW0", BIDIRECTIONAL),
    ROW1: createPin(11, "ROW1", BIDIRECTIONAL),
    ROW2: createPin(10, "ROW2", BIDIRECTIONAL),
    ROW3: createPin(5, "ROW3", BIDIRECTIONAL),
    ROW4: createPin(8, "ROW4", BIDIRECTIONAL),
    ROW5: createPin(7, "ROW5", BIDIRECTIONAL),
    ROW6: createPin(6, "ROW6", BIDIRECTIONAL),
    ROW7: createPin(9, "ROW7", BIDIRECTIONAL),

    COL0: createPin(13, "COL0", BIDIRECTIONAL),
    COL1: createPin(19, "COL1", BIDIRECTIONAL),
    COL2: createPin(18, "COL2", BIDIRECTIONAL),
    COL3: createPin(17, "COL3", BIDIRECTIONAL),
    COL4: createPin(16, "COL4", BIDIRECTIONAL),
    COL5: createPin(15, "COL5", BIDIRECTIONAL),
    COL6: createPin(14, "COL6", BIDIRECTIONAL),
    COL7: createPin(20, "COL7", BIDIRECTIONAL),

    _RESTORE: createPin(3, "_RESTORE", BIDIRECTIONAL),

    GND: createPin(1, "GND", INPUT, null),
    VCC: createPin(3, "VCC", INPUT, null),
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
