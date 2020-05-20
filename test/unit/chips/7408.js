// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect, deviceTraces } from "test/helper"
import { new7408 } from "chips/7408"

describe("7408 quad 2-input AND gate", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = new7408()
    traces = deviceTraces(chip)
  })

  it("properly ANDs on gate 1", () => {
    traces.A1.state = false
    traces.B1.state = false
    expect(traces.Y1.state).to.be.false

    traces.A1.state = false
    traces.B1.state = true
    expect(traces.Y1.state).to.be.false

    traces.A1.state = true
    traces.B1.state = false
    expect(traces.Y1.state).to.be.false

    traces.A1.state = true
    traces.B1.state = true
    expect(traces.Y1.state).to.be.true
  })

  it("properly ANDs on gate 2", () => {
    traces.A2.state = false
    traces.B2.state = false
    expect(traces.Y2.state).to.be.false

    traces.A2.state = false
    traces.B2.state = true
    expect(traces.Y2.state).to.be.false

    traces.A2.state = true
    traces.B2.state = false
    expect(traces.Y2.state).to.be.false

    traces.A2.state = true
    traces.B2.state = true
    expect(traces.Y2.state).to.be.true
  })

  it("properly ANDs on gate 3", () => {
    traces.A3.state = false
    traces.B3.state = false
    expect(traces.Y3.state).to.be.false

    traces.A3.state = false
    traces.B3.state = true
    expect(traces.Y3.state).to.be.false

    traces.A3.state = true
    traces.B3.state = false
    expect(traces.Y3.state).to.be.false

    traces.A3.state = true
    traces.B3.state = true
    expect(traces.Y3.state).to.be.true
  })

  it("properly ANDs on gate 4", () => {
    traces.A4.state = false
    traces.B4.state = false
    expect(traces.Y4.state).to.be.false

    traces.A4.state = false
    traces.B4.state = true
    expect(traces.Y4.state).to.be.false

    traces.A4.state = true
    traces.B4.state = false
    expect(traces.Y4.state).to.be.false

    traces.A4.state = true
    traces.B4.state = true
    expect(traces.Y4.state).to.be.true
  })
})
