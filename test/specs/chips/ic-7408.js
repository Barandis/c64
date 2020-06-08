// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect, deviceTraces } from "test/helper"
import { Ic7408 } from "chips/ic-7408"

describe("7408 quad 2-input AND gate", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic7408()
    traces = deviceTraces(chip)
  })

  it("properly ANDs on gate 1", () => {
    traces.A1.clear()
    traces.B1.clear()
    expect(traces.Y1.low).to.be.true

    traces.A1.clear()
    traces.B1.set()
    expect(traces.Y1.low).to.be.true

    traces.A1.set()
    traces.B1.clear()
    expect(traces.Y1.low).to.be.true

    traces.A1.set()
    traces.B1.set()
    expect(traces.Y1.high).to.be.true
  })

  it("properly ANDs on gate 2", () => {
    traces.A2.clear()
    traces.B2.clear()
    expect(traces.Y2.low).to.be.true

    traces.A2.clear()
    traces.B2.set()
    expect(traces.Y2.low).to.be.true

    traces.A2.set()
    traces.B2.clear()
    expect(traces.Y2.low).to.be.true

    traces.A2.set()
    traces.B2.set()
    expect(traces.Y2.high).to.be.true
  })

  it("properly ANDs on gate 3", () => {
    traces.A3.clear()
    traces.B3.clear()
    expect(traces.Y3.low).to.be.true

    traces.A3.clear()
    traces.B3.set()
    expect(traces.Y3.low).to.be.true

    traces.A3.set()
    traces.B3.clear()
    expect(traces.Y3.low).to.be.true

    traces.A3.set()
    traces.B3.set()
    expect(traces.Y3.high).to.be.true
  })

  it("properly ANDs on gate 4", () => {
    traces.A4.clear()
    traces.B4.clear()
    expect(traces.Y4.low).to.be.true

    traces.A4.clear()
    traces.B4.set()
    expect(traces.Y4.low).to.be.true

    traces.A4.set()
    traces.B4.clear()
    expect(traces.Y4.low).to.be.true

    traces.A4.set()
    traces.B4.set()
    expect(traces.Y4.high).to.be.true
  })
})
