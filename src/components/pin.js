// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/** @typedef {import('./trace').default} Trace */

// A pin on an IC package or a port.
//
// This is the sole interface between these devices and the outside
// world. Pins have a direction, which indicates whether they're used by
// their chip/port for input, output, both, or neither; and a level,
// which is the signal present on them. In digital circuits, this is
// generally 0 or 1, though there's no reason a pin can't work with
// analog signals (and thus have any level at all).
//
// Pins may also be pulled up or down, which defines what level they
// have if a level isn't given to them. This emulates the internal
// pull-ups and pull-downs that some chips have (such as the port pins
// on a 6526 CIA). If no level is given to them and they have no pull-up
// or pull-down, then their level will be `null`, or no level at all,
// which is different from 0. This can be used to represent, e.g., a
// high-impedance state that cuts the pin off from its circuit.
//
// Pins and traces are intimately linked. A pin can be associated with
// exactly one trace, and unless the pin's level is `null` and it is an
// output pin, the pin and the trace will have the same level. (It
// follows then that all of the other pins connected to that trace will
// also have that level.) If their levels do not match, then one is
// changed to match the other. If the pin is an output pin, it will
// define the mutual level. If it's an input pin, the trace will define
// the level. If the pin is bidirectional, the level will be the level
// of the trace if it is connected to other non-bidirectional, non-null
// output pins; otherwise, whatever was set last will prevail.
//
// A pin may also have one or more listeners registered to it. The
// listener(s) will be invoked if the level of the pin changes *because
// of a change to its trace's level.* No listener will be invoked if the
// level of the pin is merely set programmatically. This means that only
// input and bidirectional pins will invoke listeners, though output
// pins may also register them, since it is possible that the output pin
// will become a different kind of pin later.

// The possible directions that a pin can have. These are chosen so that
// bit 0 of the constant determines whether it's an input and bit 1
// whether it's an output (hence bidrectional pins have both bits set).
const UNCONNECTED = 0b00
const INPUT = 0b01
const OUTPUT = 0b10
const BIDIRECTIONAL = 0b11

export default class Pin {
  /** @type {0} */
  static get UNCONNECTED() { return UNCONNECTED }
  /** @type {1} */
  static get INPUT() { return INPUT }
  /** @type {2} */
  static get OUTPUT() { return OUTPUT }
  /** @type {3} */
  static get BIDIRECTIONAL() { return BIDIRECTIONAL }

  /** @type {function(Pin):void} */
  #listeners = []
  /** @type {number} */
  #number = 0
  /** @type {string} */
  #name = ''
  /** @type {Trace} */
  #trace = null
  /** @type {null|0|1} */
  #float = null
  /** @type {number|null} */
  #level = null
  /** @type {0|1|2|3} */
  #mode = UNCONNECTED

  /**
   * @param {number} number
   * @param {string} name
   * @param {0|1|2|3} mode
   */
  constructor(number, name, mode = UNCONNECTED) {
    this.#number = number
    this.#name = name
    this.#mode = mode
    this.#level = this.#normalize(null)
  }

  /**
   * @param {number|null} level
   */
  #normalize (level) {
    return level === null ? this.#float : Number(level)
  }

  get number() { return this.#number }

  get name() { return this.#name }

  get level() { return this.#level }

  set level(value) {
    if (this.#trace) {
      if (this.#mode !== INPUT) {
        this.#level = this.#normalize(value)
        if (this.#mode !== UNCONNECTED) {
          this.#trace.updateLevel(this.#level)
        }
      }
    } else {
      this.#level = this.#normalize(value)
    }
  }

  get high() { return this.#level >= 0.5 }

  get low() { return this.#level < 0.5 && this.#level !== null }

  get floating() { return this.#level === null }

  get mode() { return this.#mode }

  set mode(value) {
    if ([UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL].includes(value)) {
      const oldMode = this.#mode
      const oldLevel = this.#level
      this.#mode = value

      if (this.#trace) {
        if (this.#mode & OUTPUT) {
          this.#trace.updateLevel(this.#level)
        } else {
          if (this.#mode === INPUT) {
            this.#level = this.#normalize(this.#trace.level)
          }
          if (oldMode & OUTPUT && oldLevel !== null) {
            this.#trace.updateLevel(null)
          }
        }
      }
    }
  }

  get input() { return (this.#mode & INPUT) !== 0 }

  get output() { return (this.#mode & OUTPUT) !== 0 }

  /** @param {Trace} value */
  set trace(value) {
    this.#trace = value
    if (this.#mode === INPUT
      || this.#mode === BIDIRECTIONAL && this.#level === null) {
      this.#level = value.level
    } else if (this.#mode & OUTPUT) {
      value.updateLevel()
    }
  }

  get connected() { return this.#trace !== null }

  updateLevel() {
    if (this.#trace) {
      const newLevel = this.#normalize(this.#trace.level)
      if (this.#mode & INPUT && this.#level !== newLevel) {
        this.#level = newLevel
        this.#listeners.forEach(listener => listener(this))
      }
    }
  }

  set() {
    this.level = 1
    return this
  }

  clear() {
    this.level = 0
    return this
  }

  float() {
    this.level = null
    return this
  }

  toggle() {
    this.level = this.level === null ? null : 1 - this.level
    return this
  }

  /** @param {function(Pin):void} listener */
  addListener(listener) {
    if (!this.#listeners.includes(listener)) {
      this.#listeners.push(listener)
    }
    return this
  }

  /** @param {function(Pin):void} listener */
  removeListener(listener) {
    const index = this.#listeners.indexOf(listener)
    if (index !== -1) {
      this.#listeners.splice(index, 1)
    }
    return this
  }

  pullUp() {
    this.#float = 1
    this.#level = this.#normalize(this.#level)
    return this
  }

  pullDown() {
    this.#float = 0
    this.#level = this.#normalize(this.#level)
    return this
  }

  noPull() {
    this.#float = null
    this.#level = this.#normalize(this.#level)
    return this
  }
}
