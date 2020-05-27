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
      traces[`A${i}`].raise()
      expect(traces[`Y${i}`].low).to.be.true
    }
  })

  it("sets output to true when the input is false", () => {
    for (let i = 1; i <= 6; i++) {
      traces[`A${i}`].lower()
      expect(traces[`Y${i}`].high).to.be.true
    }
  })
})
