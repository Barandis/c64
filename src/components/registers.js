// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default class Registers extends Uint8Array {
  #names

  constructor(...names) {
    super(names.length)
    this.#names = names

    for (const [index, name] of names.entries()) {
      if (name) {
        Object.defineProperty(this, name, {
          get: () => this[index],
          set: value => (this[index] = value),
          enumerable: true,
        })
      }
    }
  }

  get names() {
    return Object.freeze(this.#names)
  }
}
