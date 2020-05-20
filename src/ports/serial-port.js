/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import {
  createPin,
  BIDIRECTIONAL,
  INPUT,
  createPinArray,
  OUTPUT,
  UNCONNECTED,
} from "components/pin"

export function createSerialPort() {
  const pins = createPinArray(
    createPin(5, "DATA", BIDIRECTIONAL, null),
    createPin(4, "CLK", BIDIRECTIONAL, null),
    createPin(3, "ATN", INPUT),
    createPin(1, "_SRQ", OUTPUT, null),
    createPin(6, "_RESET", BIDIRECTIONAL, null),

    createPin(2, "GND", UNCONNECTED),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
