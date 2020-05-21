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

    connect(port) {
      for (let i = 0; i < connectorArray.length; i++) {
        const con1 = connectorArray[i]
        const con2 = port.connectors[i]
        if (con1 && con2) {
          con1.connect(con2)
        }
      }
    },

    disconnect() {
      for (const con of connectorArray) {
        if (con) {
          con.disconnect()
        }
      }
    },
  }

  for (const name in pinArray) {
    port[name] = pinArray[name]
  }

  return port
}
