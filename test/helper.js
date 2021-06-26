// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import chai from 'chai'

import Pin from 'components/pin'
import Pins from 'components/pins'
import Port from 'components/port'
import Trace from 'components/trace'
import { range } from 'utils'

const { UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL } = Pin

function modeName(mode) {
  switch (mode) {
    case UNCONNECTED:
      return 'UNCONNECTED'
    case INPUT:
      return 'INPUT'
    case OUTPUT:
      return 'OUTPUT'
    case BIDIRECTIONAL:
      return 'BIDIRECTIONAL'
    default:
      return 'Huh?'
  }
}

chai.assert.isHigh = function isHigh(tested, message) {
  const name = tested.name ? `pin '${tested.name}'` : 'trace'
  const test = new chai.Assertion(tested.high, message, chai.assert, true)
  test.assert(
    chai.util.flag(test, 'object'),
    `expected ${name} to be high`,
    `expected ${name} not to be high`,
    true,
    tested.high,
    false,
  )
}

chai.assert.isLow = function isLow(tested, message) {
  const name = tested.name ? `pin '${tested.name}'` : 'trace'
  const test = new chai.Assertion(tested.low, message, chai.assert, true)
  test.assert(
    chai.util.flag(test, 'object'),
    `expected ${name} to be low`,
    `expected ${name} not to be low`,
    true,
    tested.low,
    false,
  )
}

chai.assert.isFloating = function isFloating(tested, message) {
  const name = tested.name ? `pin '${tested.name}'` : 'trace'
  const test = new chai.Assertion(tested.floating, message, chai.assert, true)
  test.assert(
    chai.util.flag(test, 'object'),
    `expected ${name} to be floating`,
    `expected ${name} not to be floating`,
    true,
    tested.floating,
    false,
  )
}

chai.assert.level = function level(tested, expected, message) {
  const name = tested.name ? `pin '${tested.name}'` : 'trace'
  const test = new chai.Assertion(tested.level, message, chai.assert.equal, true)
  test.assert(
    expected === chai.util.flag(test, 'object'),
    `expected level of ${name} to be ${expected}, found ${chai.util.flag(test, 'object')}`,
    `expected level of ${name} not to be ${expected}`,
    expected,
    tested.level,
    true,
  )
}

chai.assert.mode = function mode(tested, expected, message) {
  const name = tested.name ? `pin '${tested.name}'` : 'trace'
  const test = new chai.Assertion(tested.mode, message, chai.assert.equal, true)
  test.assert(
    expected === chai.util.flag(test, 'object'),
    `expected level of ${name} to be ${modeName(expected)}, found ${modeName(
      chai.util.flag(test, 'object'),
    )}`,
    `expected level of ${name} not to be ${modeName(expected)}`,
    expected,
    tested.level,
    true,
  )
}

export const { assert } = chai

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
    assert(actual[i] === expected[i], `Expected: ${expected[i]}, Actual: ${actual[i]}`)
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
  return `0000000000000000${value.toString(16).toLowerCase()}`.substr(-digits)
}

/**
 * @param {number} value
 * @param {number} digits
 */
export function bin(value, digits = 8) {
  if (value === null) {
    return 'null'
  }
  return `0000000000000000${value.toString(2)}`.substr(-digits)
}

/**
 * @param {[]} chip
 * @param {string} name
 */
export function chipState(chip, name) {
  const terms = []
  for (const pin of Object.values(chip.pins).sort((a, b) => a.num - b.num)) {
    terms.push(`${pin.name}: ${pin.level === null ? 'z' : pin.level}`)
  }
  return `${name}: [${terms.join(', ')}]`
}

export function deviceTraces(device) {
  const traces = []

  for (const pin of device.pins) {
    if (pin) {
      const trace = Trace(pin)
      traces[pin.number] = trace
      traces[pin.name] = trace
    }
  }

  return traces
}

export function portCable(port) {
  const pins = []

  for (const pin of port.pins) {
    if (pin) {
      const mode = pin.mode === INPUT ? OUTPUT : pin.mode === OUTPUT ? INPUT : pin.mode
      pins[pin.number] = Pin(pin.number, pin.name, mode)
    }
  }

  return Port(Pins(...pins))
}

export function portMessage(name) {
  return `Port ${name} should change when cable ${name} does`
}

export function cableMessage(name) {
  return `Cable ${name} should change when port ${name} does`
}
