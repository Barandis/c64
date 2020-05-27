/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { new4066 } from "chips/4066"

describe("4066 quad bilateral switch", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = new4066()
    traces = deviceTraces(chip)
  })

  it("passes signals from X to Y", () => {
    traces.A1.clear()
    traces.X1.level = 0.5
    expect(traces.Y1.level).to.equal(0.5)

    traces.A2.clear()
    traces.X2.level = 0.75
    expect(traces.Y2.level).to.equal(0.75)

    traces.A3.clear()
    traces.X3.level = 0.25
    expect(traces.Y3.level).to.equal(0.25)

    traces.A4.clear()
    traces.X4.level = 1
    expect(traces.Y4.level).to.equal(1)
  })

  it("passes signals from Y to X", () => {
    traces.A1.clear()
    traces.Y1.level = 0.5
    expect(traces.X1.level).to.equal(0.5)

    traces.A2.clear()
    traces.Y2.level = 0.75
    expect(traces.X2.level).to.equal(0.75)

    traces.A3.clear()
    traces.Y3.level = 0.25
    expect(traces.X3.level).to.equal(0.25)

    traces.A4.clear()
    traces.Y4.level = 1
    expect(traces.X4.level).to.equal(1)
  })

  it("disconnects X and Y when A is high", () => {
    traces.A1.set()
    expect(traces.X1.level).to.be.null
    expect(traces.Y1.level).to.be.null

    traces.A2.set()
    expect(traces.X2.level).to.be.null
    expect(traces.Y2.level).to.be.null

    traces.A3.set()
    expect(traces.X3.level).to.be.null
    expect(traces.Y3.level).to.be.null

    traces.A4.set()
    expect(traces.X4.level).to.be.null
    expect(traces.Y4.level).to.be.null
  })

  it("does not pass signals from X to Y when A is high", () => {
    traces.A1.set()
    traces.X1.level = 0.5
    expect(traces.Y1.level).to.be.null

    traces.A2.set()
    traces.X2.level = 0.75
    expect(traces.Y2.level).to.be.null

    traces.A3.set()
    traces.X3.level = 0.25
    expect(traces.Y3.level).to.be.null

    traces.A4.set()
    traces.X4.level = 1
    expect(traces.Y4.level).to.be.null
  })

  it("does not pass signals from Y to X when A is high", () => {
    traces.A1.set()
    traces.Y1.level = 0.5
    expect(traces.X1.level).to.be.null

    traces.A2.set()
    traces.Y2.level = 0.75
    expect(traces.X2.level).to.be.null

    traces.A3.set()
    traces.Y3.level = 0.25
    expect(traces.X3.level).to.be.null

    traces.A4.set()
    traces.Y4.level = 1
    expect(traces.X4.level).to.be.null
  })

  it("sets Y to X's value after A goes low if X was last set", () => {
    traces.A1.set()
    traces.Y1.level = 1.5
    traces.X1.level = 0.5
    traces.A1.clear()
    expect(traces.Y1.level).to.equal(0.5)

    traces.A2.set()
    traces.Y2.level = 1.5
    traces.X2.level = 0.75
    traces.A2.clear()
    expect(traces.Y2.level).to.equal(0.75)

    traces.A3.set()
    traces.Y3.level = 1.5
    traces.X3.level = 0.25
    traces.A3.clear()
    expect(traces.Y3.level).to.equal(0.25)

    traces.A4.set()
    traces.Y4.level = 1.5
    traces.X4.level = 1
    traces.A4.clear()
    expect(traces.Y4.level).to.equal(1)
  })

  it("sets X to Y's value after A goes low if Y was last set", () => {
    traces.A1.set()
    traces.X1.level = 1.5
    traces.Y1.level = 0.5
    traces.A1.clear()
    expect(traces.X1.level).to.equal(0.5)

    traces.A2.set()
    traces.X2.level = 1.5
    traces.Y2.level = 0.75
    traces.A2.clear()
    expect(traces.X2.level).to.equal(0.75)

    traces.A3.set()
    traces.X3.level = 1.5
    traces.Y3.level = 0.25
    traces.A3.clear()
    expect(traces.X3.level).to.equal(0.25)

    traces.A4.set()
    traces.X4.level = 1.5
    traces.Y4.level = 1
    traces.A4.clear()
    expect(traces.X4.level).to.equal(1)
  })

  it("sets both I/O pins to 0 if neither was set before A goes low", () => {
    traces.A1.set()
    traces.A1.clear()
    expect(traces.X1.level).to.equal(0)
    expect(traces.Y1.level).to.equal(0)

    traces.A2.set()
    traces.A2.clear()
    expect(traces.X2.level).to.equal(0)
    expect(traces.Y2.level).to.equal(0)

    traces.A3.set()
    traces.A3.clear()
    expect(traces.X3.level).to.equal(0)
    expect(traces.Y3.level).to.equal(0)

    traces.A4.set()
    traces.A4.clear()
    expect(traces.X4.level).to.equal(0)
    expect(traces.Y4.level).to.equal(0)
  })
})
