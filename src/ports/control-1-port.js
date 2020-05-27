/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, OUTPUT, UNCONNECTED } from "components/pin"
import { newPort } from "components/port"

export function newControl1Port() {
  return newPort(
    newPin(1, "JOYA0", OUTPUT),
    newPin(2, "JOYA1", OUTPUT),
    newPin(3, "JOYA2", OUTPUT),
    newPin(4, "JOYA3", OUTPUT),
    newPin(9, "POTAX", OUTPUT),
    newPin(5, "POTAY", OUTPUT),
    newPin(6, "BTNA_LP", OUTPUT),

    newPin(7, "VCC", UNCONNECTED),
    newPin(8, "GND", UNCONNECTED),
  )
}
