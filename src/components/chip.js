// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/** @typedef {import('./pin').default} Pin */

// Represents a generic semiconductor chip. In this scheme, a chip is defined by its
// connections to the outside world, which provide its only interface, just like in the real
// thing. Anything that the chip actually does must be defined individually, often as a part
// of listeners that respond to changing levels on its pins.
//
// Pins are accessible in three ways. The first two are the `pins` property, which exposes
// the pins both with numeric indices (1-indexed, so the index matches the pin number in
// diagrams) and with string keys matching the pins' names. Thirdly, the names of the pins
// are turned into properties on the chip itself, which has little chance of conflict since
// a chip isn't meant to have any properties other than the pins themselves.

export default class Chip extends Array {
  /**
   * @param {...Pin} pins
   */
  constructor(...pins) {
    super()

    for (const pin of pins) {
      if (pin) {
        this[pin.number] = pin
        Object.defineProperty(this, pin.name, {
          get: () => pin,
          enumerable: true,
        })
      }
    }

    Object.freeze(this)
  }

  dump() {
    const status = ['Pins:']
    this.forEach(pin => {
      const prefix = `  ${pin.number} (${pin.name}): `
      status.push(
        `${prefix}${' '.repeat(16 - prefix.length)}${pin.high ? '1' : pin.low ? '0' : 'x'}`,
      )
    })
    return status.join('\n')
  }
}
