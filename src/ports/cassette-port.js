/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, BIDIRECTIONAL, createPinArray } from "components/pin"

export function createCassettePort() {
  const pins = createPinArray(
    createPin(4, "READ", BIDIRECTIONAL),
    createPin(5, "WRITE", BIDIRECTIONAL),
    createPin(6, "SENSE", BIDIRECTIONAL),
    createPin(3, "MOTOR", BIDIRECTIONAL),

    createPin(2, "VCC", INPUT, null),
    createPin(1, "GND", INPUT, null),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
