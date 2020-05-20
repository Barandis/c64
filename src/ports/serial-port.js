/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, BIDIRECTIONAL, INPUT, newPinArray, OUTPUT, UNCONNECTED } from "components/pin"

export function newSerialPort() {
  const pins = newPinArray(
    newPin(5, "DATA", BIDIRECTIONAL, null),
    newPin(4, "CLK", BIDIRECTIONAL, null),
    newPin(3, "ATN", INPUT),
    newPin(1, "_SRQ", OUTPUT, null),
    newPin(6, "_RESET", BIDIRECTIONAL, null),

    newPin(2, "GND", UNCONNECTED),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
