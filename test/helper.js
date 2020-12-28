// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import chai from 'chai'

import { Port } from 'components'
import Pin from 'components/pin'
import Trace from 'components/trace'
import { range } from 'utils'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT

export const assert = chai.assert

export const DEBUG = process.env.DEBUG || false

/**
 * @param {number} min
 * @param {number} max
 */
export function rand(min, max = null) {
  const [lo, hi] = max === null ? [0, min] : [min, max]
  return Math.floor(Math.random() * (hi - lo)) + lo
}

/**
 * @param {[]} actual
 * @param {[]} expected
 */
export function assertArray(actual, expected) {
  assert(actual.length === expected.length)
  for (const i of range(actual.length)) {
    assert(
      actual[i] === expected[i],
      `Expected: ${expected[i]}, Actual: ${actual[i]}`,
    )
  }
}

/**
 * @param {number} value
 * @param {number} digits
 */
export function hex(value, digits = 2) {
  if (value === null) {
    return 'null'
  }
  return ('0000000000000000' + value.toString(16).toLowerCase()).substr(-digits)
}

/**
 * @param {number} value
 * @param {number} digits
 */
export function bin(value, digits = 8) {
  if (value === null) {
    return 'null'
  }
  return ('0000000000000000' + value.toString(2)).substr(-digits)
}

/**
 * @param {[]} chip
 * @param {string} name
 */
export function chipState(chip, name) {
  const terms = []
  for (const pin of Object.values(chip.pins).sort(
    (a, b) => a.num - b.num,
  )) {
    terms.push(`${pin.name}: ${pin.level === null ? 'z' : pin.level}`)
  }
  return `${name}: [${terms.join(', ')}]`
}

export function deviceTraces(device) {
  const traces = []

  for (const pin of device) {
    if (pin) {
      const trace = new Trace(pin)
      traces[pin.number] = trace
      traces[pin.name] = trace
    }
  }

  return traces
}

export function portCable(port) {
  const pins = []

  for (const pin of port) {
    if (pin) {
      const mode = pin.mode === INPUT
        ? OUTPUT
        : pin.mode === OUTPUT
          ? INPUT
          : pin.mode
      pins[pin.number] = new Pin(pin.number, pin.name, mode)
    }
  }

  return Port(...pins)
}

export function portMessage(name) {
  return `Port ${name} should change when cable ${name} does`
}

export function cableMessage(name) {
  return `Cable ${name} should change when port ${name} does`
}
