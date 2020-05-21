/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// Wraps a pin to connect to another connector, allowing pins to directly interface. This is
// essentially a single pin in a connector and that is its intention - to be a part of one of the
// C64's external ports.
//
// When a connector connects to another connector, the values of their pins are equalized. If one is
// an input pin and one is an output pin, then the output pin will take on the value from the input
// pin, transfering whatever signal was in the input pin's side instantaneously. If two
// bidirectional pins connect, then whichever one is in the connector that actually called `connect`
// will be the one whose signal takes precedence.
export function newConnector(pin) {
  let other = null

  pin.addListener(p => {
    if (other !== null) {
      other.pin.value = p.value
    }
  })

  return {
    get pin() {
      return pin
    },

    // Connects to another connector. The `_skip` parameter is not meant to be called externally;
    // it prevents infinite loops from connectors connecting back and forth.
    connect(connector, _skip = false) {
      if (other === null) {
        other = connector
        if (!_skip) {
          other.connect(this, true)

          if (pin.input && other.pin.output) {
            other.pin.value = pin.value
          } else if (pin.output && other.pin.input) {
            pin.value = other.pin.value
          }
        }
      }
    },

    // Disconnects the connector from whatever it's connected to. The connector that disconnects
    // need not be the one to have connected. When the disconnect happens, both pins are set to
    // `null`, which leaves their traces free to set them to where they should be.
    disconnect(_skip = false) {
      if (other !== null) {
        const connector = other
        other = null

        if (!_skip) {
          connector.disconnect(true)

          pin.value = null
          connector.pin.value = null
        }
      }
    },
  }
}

export function newConnectorArray(pinArray) {
  const array = []

  for (const pin of pinArray) {
    if (pin) {
      const connector = newConnector(pin)
      array[pin.num] = connector
      array[pin.name] = connector
    }
  }

  return array
}
