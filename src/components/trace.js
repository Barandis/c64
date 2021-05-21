// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'

const { OUTPUT } = Pin

// When a trace's level is set directly, its actual value is chosen according to the
// following rules:
//
// 1. If the trace has an output pin connected to it that is high, the trace takes on that
//    pin's value.
// 2. If the trace has an output pin connected to it that is low, the trace takes on that
//    pin's value.
// 3. If the value being set is `null`: a. If the trace has been pulled up, its value is 1.
//    b. If the trace has been pulled down, its value is 0. c. Its value is `null`.
// 4. The trace takes on the set value.
//
// If a trace is set by a pin (either by an output pin changing values or by an unconnected
// pin mode-changing into an output pin), then the value is simply set *unless* the value
// it's being set to is `null`. In that case the same rules as direct setting apply.

/** @param {number|null} level */
function normalize(level) {
  return level === null ? null : Number(level)
}
export default class Trace {
  /** @type {Pin[]} */
  #pins = []

  /** @type {null|0|1} */
  #float = null

  /** @type {number|null} */
  #level = null

  /** @param {number|null} level */
  #calculate(level) {
    const hi = this.#pins.find(p => p.mode === OUTPUT && p.high)
    if (hi) return hi.level

    const lo = this.#pins.find(p => p.mode === OUTPUT && p.low)
    if (lo) return lo.level

    if (level === null) return this.#float

    return level
  }

  /**
   * @param {...Pin} pins
   */
  constructor(...pins) {
    this.addPins(...pins)
    this.updateLevel(null)
  }

  get level() {
    return this.#level
  }

  set level(value) {
    this.#level = this.#calculate(normalize(value))
    this.#pins.forEach(p => p.updateLevel())
  }

  get high() {
    return this.#level >= 0.5
  }

  get low() {
    return this.#level < 0.5 && this.level !== null
  }

  get floating() {
    return this.#level === null
  }

  /**
   * @param {...Pin} pins
   */
  addPins(...pins) {
    for (const p of pins) {
      if (!p.connected) {
        this.#pins.push(p)
        p.trace = this
      }
    }
    return this
  }

  /** @param {number} level */
  updateLevel(level) {
    const normalized = normalize(level)
    this.#level = normalized === null ? this.#calculate(null) : normalized
    this.#pins.forEach(p => p.updateLevel())
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

  pullUp() {
    this.#float = 1
    this.level = this.#level
    return this
  }

  pullDown() {
    this.#float = 0
    this.level = this.#level
    return this
  }

  noPull() {
    this.#float = null
    this.level = this.#level
    return this
  }
}
