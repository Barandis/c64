// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Pin, INPUT, OUTPUT } from "components/pin"
import { Port } from "components/port"

export function KeyboardPort() {
  // There is no pin 2; it is used for alignment.
  return Port(
    Pin(12, "ROW0", OUTPUT),
    Pin(11, "ROW1", OUTPUT),
    Pin(10, "ROW2", OUTPUT),
    Pin(5, "ROW3", OUTPUT),
    Pin(8, "ROW4", OUTPUT),
    Pin(7, "ROW5", OUTPUT),
    Pin(6, "ROW6", OUTPUT),
    Pin(9, "ROW7", OUTPUT),

    Pin(13, "COL0", INPUT),
    Pin(19, "COL1", INPUT),
    Pin(18, "COL2", INPUT),
    Pin(17, "COL3", INPUT),
    Pin(16, "COL4", INPUT),
    Pin(15, "COL5", INPUT),
    Pin(14, "COL6", INPUT),
    Pin(20, "COL7", INPUT),

    Pin(3, "_RESTORE", OUTPUT),

    Pin(4, "VCC"),
    Pin(1, "GND"),
  )
}
