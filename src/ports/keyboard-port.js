/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, INPUT, newPinArray, OUTPUT, UNCONNECTED } from "components/pin"

export function newKeyboardPort() {
  // There is no pin 2; it is used for alignment.
  const pins = newPinArray(
    newPin(12, "ROW0", OUTPUT, null),
    newPin(11, "ROW1", OUTPUT, null),
    newPin(10, "ROW2", OUTPUT, null),
    newPin(5, "ROW3", OUTPUT, null),
    newPin(8, "ROW4", OUTPUT, null),
    newPin(7, "ROW5", OUTPUT, null),
    newPin(6, "ROW6", OUTPUT, null),
    newPin(9, "ROW7", OUTPUT, null),

    newPin(13, "COL0", INPUT),
    newPin(19, "COL1", INPUT),
    newPin(18, "COL2", INPUT),
    newPin(17, "COL3", INPUT),
    newPin(16, "COL4", INPUT),
    newPin(15, "COL5", INPUT),
    newPin(14, "COL6", INPUT),
    newPin(20, "COL7", INPUT),

    newPin(3, "_RESTORE", OUTPUT),

    newPin(2, "KEY", UNCONNECTED),
    newPin(3, "VCC", UNCONNECTED),
    newPin(1, "GND", UNCONNECTED),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
