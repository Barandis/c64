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
    traces.A1.lower()
    traces.B1.lower()
    expect(traces.Y1.low).to.be.true

    traces.A1.lower()
    traces.B1.raise()
    expect(traces.Y1.low).to.be.true

    traces.A1.raise()
    traces.B1.lower()
    expect(traces.Y1.low).to.be.true

    traces.A1.raise()
    traces.B1.raise()
    expect(traces.Y1.high).to.be.true
  })

  it("properly ANDs on gate 2", () => {
    traces.A2.lower()
    traces.B2.lower()
    expect(traces.Y2.low).to.be.true

    traces.A2.lower()
    traces.B2.raise()
    expect(traces.Y2.low).to.be.true

    traces.A2.raise()
    traces.B2.lower()
    expect(traces.Y2.low).to.be.true

    traces.A2.raise()
    traces.B2.raise()
    expect(traces.Y2.high).to.be.true
  })

  it("properly ANDs on gate 3", () => {
    traces.A3.lower()
    traces.B3.lower()
    expect(traces.Y3.low).to.be.true

    traces.A3.lower()
    traces.B3.raise()
    expect(traces.Y3.low).to.be.true

    traces.A3.raise()
    traces.B3.lower()
    expect(traces.Y3.low).to.be.true

    traces.A3.raise()
    traces.B3.raise()
    expect(traces.Y3.high).to.be.true
  })

  it("properly ANDs on gate 4", () => {
    traces.A4.lower()
    traces.B4.lower()
    expect(traces.Y4.low).to.be.true

    traces.A4.lower()
    traces.B4.raise()
    expect(traces.Y4.low).to.be.true

    traces.A4.raise()
    traces.B4.lower()
    expect(traces.Y4.low).to.be.true

    traces.A4.raise()
    traces.B4.raise()
    expect(traces.Y4.high).to.be.true
  })
})
