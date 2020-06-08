// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Pin, INPUT, UNCONNECTED, OUTPUT } from "components/pin"
import { Port } from "components/port"

export function CassettePort() {
  return Port(
    Pin(4, "READ", OUTPUT),
    Pin(5, "WRITE", INPUT),
    Pin(6, "SENSE", OUTPUT),
    Pin(3, "MOTOR", INPUT),

    Pin(2, "VCC", UNCONNECTED),
    Pin(1, "GND", UNCONNECTED),
  )
}
