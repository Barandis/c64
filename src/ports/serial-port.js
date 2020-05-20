/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, BIDIRECTIONAL, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { newPort } from "components/port"

export function newSerialPort() {
  return newPort(
    newPin(5, "DATA", BIDIRECTIONAL, null),
    newPin(4, "CLK", BIDIRECTIONAL, null),
    newPin(3, "ATN", INPUT),
    newPin(1, "_SRQ", OUTPUT, null),
    newPin(6, "_RESET", BIDIRECTIONAL, null),

    newPin(2, "GND", UNCONNECTED),
  )
}
