// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { PinArray } from "components/pin"
import { ConnectorArray } from "components/connector"

// Represents an external port on a computer, consisting of a number of
// pins to connect to the electronics behind it and a matching number of
// connectors to allow connection to external devices.

export function Port(...pins) {
  const pinArray = PinArray(...pins)
  const connectorArray = ConnectorArray(pinArray)

  const port = {
    pins: pinArray,
    connectors: connectorArray,

    // Connects each connector to the corresponding connector on the
    // other port. This doens't check to see if the pins match in name,
    // number, or anything else...pin 1 connects to pin 1, pin 2
    // connects to pin 2, and so on. If any pins do not match (one side
    // has a pin 3 and the other doesn't), then simply no connection is
    // made for that pin.
    connect(port) {
      for (let i = 0; i < connectorArray.length; i++) {
        const con1 = connectorArray[i]
        const con2 = port.connectors[i]
        if (con1 && con2) {
          con1.connect(con2)
        }
      }
    },

    // Disconnects each connector in the port to whatever it was
    // connected to.
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
