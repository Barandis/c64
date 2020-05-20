/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, OUTPUT, UNCONNECTED } from "components/pin"
import { newPort } from "components/port"

export function newControl2Port() {
  return newPort(
    newPin(1, "JOYB0", OUTPUT, null),
    newPin(2, "JOYB1", OUTPUT, null),
    newPin(3, "JOYB2", OUTPUT, null),
    newPin(4, "JOYB3", OUTPUT, null),
    newPin(9, "POTBX", OUTPUT, null),
    newPin(5, "POTBY", OUTPUT, null),
    newPin(6, "BTNB", OUTPUT, null),

    newPin(7, "VCC", UNCONNECTED),
    newPin(8, "GND", UNCONNECTED),
  )
}
