/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { new7406 } from "chips/7406"

describe("7406 hex inverter", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = new7406()
    traces = deviceTraces(chip)
  })

  it("sets output to false when the input is true", () => {
    for (let i = 1; i <= 6; i++) {
      traces[`A${i}`].state = true
      expect(traces[`Y${i}`].state).to.be.false
    }
  })

  it("sets output to true when the input is false", () => {
    for (let i = 1; i <= 6; i++) {
      traces[`A${i}`].state = false
      expect(traces[`Y${i}`].state).to.be.true
    }
  })
})
