/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, BIDIRECTIONAL, INPUT } from "components/pin"

export function createSerialPort() {
  const pins = {
    DATA: createPin(5, "DATA", BIDIRECTIONAL),
    CLK: createPin(4, "CLK", BIDIRECTIONAL),
    ATN: createPin(3, "ATN", BIDIRECTIONAL),
    _SRQ: createPin(1, "_SRQ", BIDIRECTIONAL),
    _RESET: createPin(6, "_RESET", BIDIRECTIONAL),

    GND: createPin(2, "GND", INPUT, null),
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
