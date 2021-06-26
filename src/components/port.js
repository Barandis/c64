// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Connector from 'components/connector'

// Represents an external port on a computer, consisting of a number of pins to connect to
// the electronics behind it and a matching number of connectors to allow connection to
// external devices.

export default function Port(pins) {
  const connectors = []

  for (const pin of pins) {
    if (pin) {
      connectors[pin.number] = new Connector(pin)
    }
  }

  return {
    get pins() {
      return pins
    },

    get connectors() {
      return Object.freeze(connectors)
    },

    connect(port) {
      for (const [i, connector] of connectors.entries()) {
        const other = port.connectors[i]
        if (connector && other) {
          connector.connect(other)
        }
      }
    },

    disconnect() {
      for (const connector of connectors) {
        if (connector) connector.disconnect()
      }
    },
  }
}
