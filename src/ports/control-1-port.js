/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, BIDIRECTIONAL, INPUT, createPinArray } from "components/pin"

export function createControl1Port() {
  const pins = createPinArray(
    createPin(1, "JOYA0", BIDIRECTIONAL),
    createPin(2, "JOYA1", BIDIRECTIONAL),
    createPin(3, "JOYA2", BIDIRECTIONAL),
    createPin(4, "JOYA3", BIDIRECTIONAL),
    createPin(9, "POTAX", BIDIRECTIONAL),
    createPin(5, "POTAY", BIDIRECTIONAL),
    createPin(6, "BUTTONA_LP", BIDIRECTIONAL),

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
