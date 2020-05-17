// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect, setupTraces } from "test/helper"

import { create74LS08 } from "chips/74LS08"
import { createTrace, PULL_UP, PULL_DOWN } from "circuits/trace"
import { LOW, HIGH } from "circuits/state"

describe("74LS08 quad 2-input AND gate", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = create74LS08()
    setupTraces(traces, chip)
    traces.VCC = createTrace(chip.VCC, PULL_UP)
    traces.GND = createTrace(chip.GND, PULL_DOWN)
  })

  it("properly ANDs on gate 1", () => {
    traces.A1.state = LOW
    traces.B1.state = LOW
    expect(traces.Y1.state).to.equal(LOW)

    traces.A1.state = LOW
    traces.B1.state = HIGH
    expect(traces.Y1.state).to.equal(LOW)

    traces.A1.state = HIGH
    traces.B1.state = LOW
    expect(traces.Y1.state).to.equal(LOW)

    traces.A1.state = HIGH
    traces.B1.state = HIGH
    expect(traces.Y1.state).to.equal(HIGH)
  })

  it("properly ANDs on gate 2", () => {
    traces.A2.state = LOW
    traces.B2.state = LOW
    expect(traces.Y2.state).to.equal(LOW)

    traces.A2.state = LOW
    traces.B2.state = HIGH
    expect(traces.Y2.state).to.equal(LOW)

    traces.A2.state = HIGH
    traces.B2.state = LOW
    expect(traces.Y2.state).to.equal(LOW)

    traces.A2.state = HIGH
    traces.B2.state = HIGH
    expect(traces.Y2.state).to.equal(HIGH)
  })

  it("properly ANDs on gate 3", () => {
    traces.A3.state = LOW
    traces.B3.state = LOW
    expect(traces.Y3.state).to.equal(LOW)

    traces.A3.state = LOW
    traces.B3.state = HIGH
    expect(traces.Y3.state).to.equal(LOW)

    traces.A3.state = HIGH
    traces.B3.state = LOW
    expect(traces.Y3.state).to.equal(LOW)

    traces.A3.state = HIGH
    traces.B3.state = HIGH
    expect(traces.Y3.state).to.equal(HIGH)
  })

  it("properly ANDs on gate 4", () => {
    traces.A4.state = LOW
    traces.B4.state = LOW
    expect(traces.Y4.state).to.equal(LOW)

    traces.A4.state = LOW
    traces.B4.state = HIGH
    expect(traces.Y4.state).to.equal(LOW)

    traces.A4.state = HIGH
    traces.B4.state = LOW
    expect(traces.Y4.state).to.equal(LOW)

    traces.A4.state = HIGH
    traces.B4.state = HIGH
    expect(traces.Y4.state).to.equal(HIGH)
  })
})
