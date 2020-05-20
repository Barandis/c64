/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, createPinArray, UNCONNECTED, OUTPUT } from "components/pin"

export function createCassettePort() {
  const pins = createPinArray(
    createPin(4, "READ", OUTPUT, null),
    createPin(5, "WRITE", INPUT),
    createPin(6, "SENSE", OUTPUT, null),
    createPin(3, "MOTOR", INPUT),

    createPin(2, "VCC", UNCONNECTED),
    createPin(1, "GND", UNCONNECTED),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
