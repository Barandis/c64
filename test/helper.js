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

export function chipState(chip) {
  const terms = []
  for (const pin of chip.pins
    .filter(pin => pin !== null)
    .sort((p1, p2) => (p1.name < p2.name ? -1 : p1.name > p2.name ? 1 : 0))) {
    terms.push(`${pin.name}: ${pin.value === null ? "z" : pin.value}`)
  }
  return `[${terms.join(", ")}]`
}
