/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import chai from "chai"
import sinonChai from "sinon-chai"

chai.use(sinonChai)

export const expect = chai.expect

export const DEBUG = process.env.DEBUG || false

export function rand(min, max = null) {
  const [lo, hi] = max === null ? [0, min] : [min, max]
  return Math.floor(Math.random() * (hi - lo)) + lo
}

export function chipState(chip, name) {
  const terms = []
  for (const name in chip.pins) {
    const pin = chip.pins[name]
    terms.push(`${name}: ${pin.value === null ? "z" : pin.value}`)
  }
  return `${name}: [${terms.join(", ")}]`
}
