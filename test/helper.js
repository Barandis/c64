/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import chai from "chai"
import sinonChai from "sinon-chai"

import { newTrace } from "components/trace"
import { OUTPUT, INPUT, newPin } from "components/pin"
import { newPort } from "components/port"

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
    terms.push(`${pin.name}: ${pin.level === null ? "z" : pin.level}`)
  }
  return `${name}: [${terms.join(", ")}]`
}

export function deviceTraces(device) {
  const traces = []

  for (const pin of device.pins) {
    if (pin) {
      const trace = newTrace(pin)
      traces[pin.number] = trace
      traces[pin.name] = trace
    }
  }

  return traces
}

export function portConnector(port) {
  const pins = []

  for (const pin of port.pins) {
    if (pin) {
      const mode = pin.mode === INPUT ? OUTPUT : pin.mode === OUTPUT ? INPUT : pin.mode
      pins[pin.num] = newPin(pin.num, pin.name, mode)
    }
  }

  return newPort(...pins)
}
