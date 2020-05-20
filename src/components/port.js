/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPinArray } from "./pin"
import { newConnectorArray } from "./connector"

export function newPort(...pins) {
  const pinArray = newPinArray(...pins)
  const connectorArray = newConnectorArray(pinArray)

  const port = {
    pins: pinArray,
    connectors: connectorArray,
  }

  for (const name in pinArray) {
    port[name] = port.pins[name]
  }

  return port
}
