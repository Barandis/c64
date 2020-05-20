/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, createPinArray, OUTPUT, UNCONNECTED } from "components/pin"

export function createControl1Port() {
  const pins = createPinArray(
    createPin(1, "JOYA0", OUTPUT, null),
    createPin(2, "JOYA1", OUTPUT, null),
    createPin(3, "JOYA2", OUTPUT, null),
    createPin(4, "JOYA3", OUTPUT, null),
    createPin(9, "POTAX", OUTPUT, null),
    createPin(5, "POTAY", OUTPUT, null),
    createPin(6, "BTNA_LP", OUTPUT, null),

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
