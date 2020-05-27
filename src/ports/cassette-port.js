/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, INPUT, UNCONNECTED, OUTPUT } from "components/pin"
import { newPort } from "components/port"

export function newCassettePort() {
  return newPort(
    newPin(4, "READ", OUTPUT),
    newPin(5, "WRITE", INPUT),
    newPin(6, "SENSE", OUTPUT),
    newPin(3, "MOTOR", INPUT),

    newPin(2, "VCC", UNCONNECTED),
    newPin(1, "GND", UNCONNECTED),
  )
}
