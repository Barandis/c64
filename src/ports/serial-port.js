/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, BIDIRECTIONAL, INPUT, createPinArray } from "components/pin"

export function createSerialPort() {
  const pins = createPinArray(
    createPin(5, "DATA", BIDIRECTIONAL),
    createPin(4, "CLK", BIDIRECTIONAL),
    createPin(3, "ATN", BIDIRECTIONAL),
    createPin(1, "_SRQ", BIDIRECTIONAL),
    createPin(6, "_RESET", BIDIRECTIONAL),

    createPin(2, "GND", INPUT, null),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
