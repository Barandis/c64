// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Connector from 'components/connector'

/** @typedef {import('./pin').default} Pin */

// Represents an external port on a computer, consisting of a number of
// pins to connect to the electronics behind it and a matching number of
// connectors to allow connection to external devices.

export default class Port extends Array {
  /** @type {Connector[]} */
  #connectors = []

  /**
   * @param {...Pin} pins
   */
  constructor(...pins) {
    super()

    for (const pin of pins) {
      if (pin) {
        this.#connectors[pin.number] = new Connector(pin)
        this[pin.name] = pin
        this[pin.number] = pin
      }
    }
    Object.freeze(this.#connectors)
    Object.freeze(this)
  }

  get connectors() { return this.#connectors }

  /**
   * @param {Port} port
   */
  connect(port) {
    for (const [i, connector] of this.#connectors.entries()) {
      const other = port.connectors[i]
      if (connector && other) {
        connector.connect(other)
      }
    }
  }

  disconnect() {
    for (const connector of this.#connectors) {
      if (connector) connector.disconnect()
    }
  }
}
