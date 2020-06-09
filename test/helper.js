// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import chai from "chai"

import { OUTPUT, INPUT, Pin, Port, Trace } from "components"
import { range } from "utils"

export const assert = chai.assert

export const DEBUG = process.env.DEBUG || false

export function rand(min, max = null) {
  const [lo, hi] = max === null ? [0, min] : [min, max]
  return Math.floor(Math.random() * (hi - lo)) + lo
}

export function assertArray(actual, expected) {
  assert(actual.length === expected.length)
  for (const i of range(actual.length)) {
    assert(
      actual[i] === expected[i],
      `Expected: ${expected[i]}, Actual: ${actual[i]}`
    )
  }
}

export function hex(value, digits = 2) {
  if (value === null) {
    return "null"
  }
  return ("0000000000000000" + value.toString(16).toLowerCase()).substr(-digits)
}

export function bin(value, digits = 8) {
  if (value === null) {
    return "null"
  }
  return ("0000000000000000" + value.toString(2)).substr(-digits)
}

export function chipState(chip, name) {
  const terms = []
  for (const pin of Object.values(chip.pins).sort(
    (a, b) => a.num - b.num
  )) {
    terms.push(`${pin.name}: ${pin.level === null ? "z" : pin.level}`)
  }
  return `${name}: [${terms.join(", ")}]`
}

export function deviceTraces(device) {
  const traces = []

  for (const pin of device) {
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

  for (const pin of port) {
    if (pin) {
      const mode = pin.mode === INPUT
        ? OUTPUT
        : pin.mode === OUTPUT
          ? INPUT
          : pin.mode
      pins[pin.number] = Pin(pin.number, pin.name, mode)
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
