/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, newPinArray, OUTPUT, UNCONNECTED } from "components/pin"

export function newControl1Port() {
  const pins = newPinArray(
    newPin(1, "JOYA0", OUTPUT, null),
    newPin(2, "JOYA1", OUTPUT, null),
    newPin(3, "JOYA2", OUTPUT, null),
    newPin(4, "JOYA3", OUTPUT, null),
    newPin(9, "POTAX", OUTPUT, null),
    newPin(5, "POTAY", OUTPUT, null),
    newPin(6, "BTNA_LP", OUTPUT, null),

    newPin(7, "VCC", UNCONNECTED),
    newPin(8, "GND", UNCONNECTED),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
