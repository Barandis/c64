// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Wraps a pin to connect to another connector, allowing pins to directly interface. This is
// essentially a single pin in a connector and that is its intention - to be a part of one
// of the C64's external ports.
//
// When a connector connects to another connector, the levels of their pins are equalized.
// If one is an input pin and one is an output pin, then the output pin will take on the
// level from the input pin, transfering whatever signal was in the input pin's side
// instantaneously. If two bidirectional pins connect, then whichever one is in the
// connector that actually called `connect` will be the one whose signal takes precedence.

export default function Connector(pin) {
  let other = null

  const conn = {
    get pin() {
      return pin
    },

    connect(connector, skip = false) {
      if (!other) {
        other = connector
        if (!skip) {
          other.connect(conn, true)

          if (pin.input && other.pin.output) {
            other.pin.level = pin.level
          } else if (pin.output && other.pin.input) {
            pin.level = other.pin.level
          }
        }
      }
    },

    disconnect(skip = false) {
      if (other !== null) {
        const connector = other
        other = null

        if (!skip) {
          connector.disconnect(true)

          pin.float()
          connector.pin.float()
        }
      }
    },
  }

  pin.addListener(p => {
    if (other !== null) {
      other.pin.level = p.level
    }
  })

  return conn
}
