// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Port, Pin, OUTPUT } from "components"

export function Control2Port() {
  return Port(
    Pin(1, "JOYB0", OUTPUT),
    Pin(2, "JOYB1", OUTPUT),
    Pin(3, "JOYB2", OUTPUT),
    Pin(4, "JOYB3", OUTPUT),
    Pin(9, "POTBX", OUTPUT),
    Pin(5, "POTBY", OUTPUT),
    Pin(6, "BTNB", OUTPUT),

    Pin(7, "VCC"),
    Pin(8, "GND"),
  )
}
