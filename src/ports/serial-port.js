// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Pin, BIDIRECTIONAL, INPUT, OUTPUT } from "components/pin"
import { Port } from "components/port"

export function SerialPort() {
  return Port(
    Pin(5, "DATA", BIDIRECTIONAL),
    Pin(4, "CLK", BIDIRECTIONAL),
    Pin(3, "ATN", INPUT),
    Pin(1, "_SRQ", OUTPUT),
    Pin(6, "_RESET", BIDIRECTIONAL),

    Pin(2, "GND"),
  )
}
