/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, BIDIRECTIONAL } from "components/pin"

export function createCassettePort() {
  const pins = {
    READ: createPin(4, "READ", BIDIRECTIONAL),
    WRITE: createPin(5, "WRITE", BIDIRECTIONAL),
    SENSE: createPin(6, "SENSE", BIDIRECTIONAL),
    MOTOR: createPin(3, "MOTOR", BIDIRECTIONAL),

    VCC: createPin(2, "VCC", INPUT, null),
    GND: createPin(1, "GND", INPUT, null),
  }

  const port = []
  port.pins = pins

  for (const name in pins) {
    const pin = pins[name]
    port[name] = pin
    port[pin.num] = pin
  }

  return port
}
