// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/** @typedef {import('./pin').default} Pin */

// Wraps a pin to connect to another connector, allowing pins to
// directly interface. This is essentially a single pin in a connector
// and that is its intention - to be a part of one of the C64's external
// ports.
//
// When a connector connects to another connector, the levels of their
// pins are equalized. If one is an input pin and one is an output pin,
// then the output pin will take on the level from the input pin,
// transfering whatever signal was in the input pin's side
// instantaneously. If two bidirectional pins connect, then whichever
// one is in the connector that actually called `connect` will be the
// one whose signal takes precedence.
export default class Connector {
  /** @type {Connector} */
  #other = null
  /** @type {Pin} */
  #pin = null

  /**
   * @param {Pin} pin
   */
  constructor(pin) {
    this.#pin = pin
    pin.addListener(p => {
      if (this.#other !== null) {
        this.#other.pin.level = p.level
      }
    })
  }

  get pin() { return this.#pin }

  /**
   * @param {Connector} connector
   * @param {boolean} skip
   */
  connect(connector, skip = false) {
    if (!this.#other) {
      this.#other = connector
      if (!skip) {
        this.#other.connect(this, true)

        if (this.#pin.input && this.#other.pin.output) {
          this.#other.pin.level = this.#pin.level
        } else if (this.#pin.output && this.#other.pin.input) {
          this.#pin.level = this.#other.pin.level
        }
      }
    }
  }

  /**
   * @param {boolean} skip
   */
  disconnect(skip = false) {
    if (this.#other !== null) {
      const connector = this.#other
      this.#other = null

      if (!skip) {
        connector.disconnect(true)

        this.#pin.float()
        connector.pin.float()
      }
    }
  }
}
