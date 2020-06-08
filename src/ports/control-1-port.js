// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Pin, OUTPUT, UNCONNECTED } from "components/pin"
import { Port } from "components/port"

export function Control1Port() {
  return Port(
    Pin(1, "JOYA0", OUTPUT),
    Pin(2, "JOYA1", OUTPUT),
    Pin(3, "JOYA2", OUTPUT),
    Pin(4, "JOYA3", OUTPUT),
    Pin(9, "POTAX", OUTPUT),
    Pin(5, "POTAY", OUTPUT),
    Pin(6, "BTNA_LP", OUTPUT),

    Pin(7, "VCC", UNCONNECTED),
    Pin(8, "GND", UNCONNECTED),
  )
}
