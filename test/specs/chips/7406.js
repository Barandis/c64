/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces } from "test/helper"

import { create7406 } from "chips/7406"
import { createTrace, PULL_UP, PULL_DOWN } from "circuits/trace"
import { LOW, HIGH } from "circuits/state"

describe("7406 hex inverter", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = create7406()
    setupTraces(traces, chip)
    traces.VCC = createTrace(chip.VCC, PULL_UP)
    traces.GND = createTrace(chip.GND, PULL_DOWN)
  })

  it("sets outputs to the inverse of inputs", () => {
    for (let i = 1; i <= 6; i++) {
      traces[`A${i}`].state = HIGH
      expect(traces[`Y${i}`].state).to.equal(LOW)
    }

    for (let i = 1; i <= 6; i++) {
      traces[`A${i}`].state = LOW
      expect(traces[`Y${i}`].state).to.equal(HIGH)
    }
  })
})
