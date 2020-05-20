/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces } from "test/helper"

import { new7406 } from "chips/7406"
import { newTrace, PULL_UP, PULL_DOWN } from "components/trace"

describe("7406 hex inverter", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = new7406()
    setupTraces(traces, chip)
    traces.VCC = newTrace(chip.VCC, PULL_UP)
    traces.GND = newTrace(chip.GND, PULL_DOWN)
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
