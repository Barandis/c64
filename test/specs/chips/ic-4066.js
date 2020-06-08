// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from "test/helper"
import { Ic4066 } from "chips/ic-4066"

describe("4066 quad bilateral switch", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic4066()
    traces = deviceTraces(chip)
  })

  it("passes signals from X to Y", () => {
    traces.A1.clear()
    traces.X1.level = 0.5
    assert(traces.Y1.level === 0.5)

    traces.A2.clear()
    traces.X2.level = 0.75
    assert(traces.Y2.level === 0.75)

    traces.A3.clear()
    traces.X3.level = 0.25
    assert(traces.Y3.level === 0.25)

    traces.A4.clear()
    traces.X4.level = 1
    assert(traces.Y4.level === 1)
  })

  it("passes signals from Y to X", () => {
    traces.A1.clear()
    traces.Y1.level = 0.5
    assert(traces.X1.level === 0.5)

    traces.A2.clear()
    traces.Y2.level = 0.75
    assert(traces.X2.level === 0.75)

    traces.A3.clear()
    traces.Y3.level = 0.25
    assert(traces.X3.level === 0.25)

    traces.A4.clear()
    traces.Y4.level = 1
    assert(traces.X4.level === 1)
  })

  it("disconnects X and Y when A is high", () => {
    traces.A1.set()
    assert(traces.X1.floating)
    assert(traces.Y1.floating)

    traces.A2.set()
    assert(traces.X2.floating)
    assert(traces.Y2.floating)

    traces.A3.set()
    assert(traces.X3.floating)
    assert(traces.Y3.floating)

    traces.A4.set()
    assert(traces.X4.floating)
    assert(traces.Y4.floating)
  })

  it("does not pass signals from X to Y when A is high", () => {
    traces.A1.set()
    traces.X1.level = 0.5
    assert(traces.Y1.floating)

    traces.A2.set()
    traces.X2.level = 0.75
    assert(traces.Y2.floating)

    traces.A3.set()
    traces.X3.level = 0.25
    assert(traces.Y3.floating)

    traces.A4.set()
    traces.X4.level = 1
    assert(traces.Y4.floating)
  })

  it("does not pass signals from Y to X when A is high", () => {
    traces.A1.set()
    traces.Y1.level = 0.5
    assert(traces.X1.floating)

    traces.A2.set()
    traces.Y2.level = 0.75
    assert(traces.X2.floating)

    traces.A3.set()
    traces.Y3.level = 0.25
    assert(traces.X3.floating)

    traces.A4.set()
    traces.Y4.level = 1
    assert(traces.X4.floating)
  })

  it("sets Y to X's value after A goes low if X was last set", () => {
    traces.A1.set()
    traces.Y1.level = 1.5
    traces.X1.level = 0.5
    traces.A1.clear()
    assert(traces.Y1.level === 0.5)

    traces.A2.set()
    traces.Y2.level = 1.5
    traces.X2.level = 0.75
    traces.A2.clear()
    assert(traces.Y2.level === 0.75)

    traces.A3.set()
    traces.Y3.level = 1.5
    traces.X3.level = 0.25
    traces.A3.clear()
    assert(traces.Y3.level === 0.25)

    traces.A4.set()
    traces.Y4.level = 1.5
    traces.X4.level = 1
    traces.A4.clear()
    assert(traces.Y4.level === 1)
  })

  it("sets X to Y's value after A goes low if Y was last set", () => {
    traces.A1.set()
    traces.X1.level = 1.5
    traces.Y1.level = 0.5
    traces.A1.clear()
    assert(traces.X1.level === 0.5)

    traces.A2.set()
    traces.X2.level = 1.5
    traces.Y2.level = 0.75
    traces.A2.clear()
    assert(traces.X2.level === 0.75)

    traces.A3.set()
    traces.X3.level = 1.5
    traces.Y3.level = 0.25
    traces.A3.clear()
    assert(traces.X3.level === 0.25)

    traces.A4.set()
    traces.X4.level = 1.5
    traces.Y4.level = 1
    traces.A4.clear()
    assert(traces.X4.level === 1)
  })

  it("sets both I/O pins to 0 if neither was set before A goes low", () => {
    traces.A1.set()
    traces.A1.clear()
    assert(traces.X1.low)
    assert(traces.Y1.low)

    traces.A2.set()
    traces.A2.clear()
    assert(traces.X2.low)
    assert(traces.Y2.low)

    traces.A3.set()
    traces.A3.clear()
    assert(traces.X3.low)
    assert(traces.Y3.low)

    traces.A4.set()
    traces.A4.clear()
    assert(traces.X4.low)
    assert(traces.Y4.low)
  })
})
