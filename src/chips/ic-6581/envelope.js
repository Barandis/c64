// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default class Envelope {
  // The Ic6581 object itself, though it's used only for access to its pins.
  /** @type {Ic6581} */
  #pins

  // A function used to read any of the registers of the chip. This is necessary because
  // there is some special behavior when trying to read a write-only register, and we ensure
  // that gets (sorta) emulated.
  /** @type {function(number):number} */
  #readRegister

  // The actual address of the VCREG register for this envelope generator. This is derived
  // from the base address, allowing multiple envelope generator to use different registers.
  /** @type {number} */
  #vcreg

  // The actual address of the ATDCY register for this envelope generator. This is derived
  // from the base address, allowing multiple envelope generator to use different registers.
  /** @type {number} */
  #atdcy

  // The actual address of the SUREL register for this envelope generator. This is derived
  // from the base address, allowing multiple envelope generator to use different registers.
  /** @type {number} */
  #surel

  constructor(pins, base, readRegister) {
    this.#vcreg = base + 4
    this.#atdcy = base + 5
    this.#surel = base + 6

    this.#pins = pins
    this.#readRegister = readRegister
  }
}
