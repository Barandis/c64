/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

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
