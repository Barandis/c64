/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import chai from "chai"
import sinonChai from "sinon-chai"

import { newTrace } from "components/trace"

chai.use(sinonChai)

export const expect = chai.expect

export const DEBUG = process.env.DEBUG || false

export function rand(min, max = null) {
  const [lo, hi] = max === null ? [0, min] : [min, max]
  return Math.floor(Math.random() * (hi - lo)) + lo
}

export function hex(value, digits) {
  if (value === null) {
    return "null"
  }
  return "$" + ("0000000000000000" + value.toString(16).toUpperCase()).substr(-digits)
}

export function bin(value, digits) {
  if (value === null) {
    return "null"
  }
  return ("0000000000000000" + value.toString(2)).substr(-digits)
}

export function chipState(chip, name) {
  const terms = []
  for (const pin of Object.values(chip.pins).sort((a, b) => a.num - b.num)) {
    terms.push(`${pin.name}: ${pin.value === null ? "z" : pin.value}`)
  }
  return `${name}: [${terms.join(", ")}]`
}

export function setupTraces(traces, chip) {
  for (const pin of chip.pins) {
    if (pin && (pin.input || pin.output)) {
      traces[pin.name] = newTrace(pin)
    }
  }
}
