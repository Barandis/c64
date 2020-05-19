/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, BIDIRECTIONAL, INPUT } from "components/pin"

export function createControl1Port() {
  const pins = {
    JOYA0: createPin(1, "JOYA0", BIDIRECTIONAL),
    JOYA1: createPin(2, "JOYA1", BIDIRECTIONAL),
    JOYA2: createPin(3, "JOYA2", BIDIRECTIONAL),
    JOYA3: createPin(4, "JOYA3", BIDIRECTIONAL),
    POTAX: createPin(9, "POTAX", BIDIRECTIONAL),
    POTAY: createPin(5, "POTAY", BIDIRECTIONAL),
    BUTTONA_LP: createPin(6, "BUTTONA_LP", BIDIRECTIONAL),

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
