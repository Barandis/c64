/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces } from "test/helper"

import { new4066 } from "chips/4066"
import { newTrace, PULL_UP, PULL_DOWN } from "components/trace"

describe("4066 quad bilateral switch", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = new4066()
    setupTraces(traces, chip)
    traces.VDD = newTrace(chip.VDD, PULL_UP)
    traces.GND = newTrace(chip.GND, PULL_DOWN)
  })

  it("passes signals from X to Y", () => {
    traces.X1.value = 0.5
    expect(traces.Y1.value).to.equal(0.5)

    traces.X2.value = 0.75
    expect(traces.Y2.value).to.equal(0.75)

    traces.X3.value = 0.25
    expect(traces.Y3.value).to.equal(0.25)

    traces.X4.value = 1
    expect(traces.Y4.value).to.equal(1)
  })

  it("passes signals from Y to X", () => {
    traces.Y1.value = 0.5
    expect(traces.X1.value).to.equal(0.5)

    traces.Y2.value = 0.75
    expect(traces.X2.value).to.equal(0.75)

    traces.Y3.value = 0.25
    expect(traces.X3.value).to.equal(0.25)

    traces.Y4.value = 1
    expect(traces.X4.value).to.equal(1)
  })

  it("disconnects X and Y when A is high", () => {
    traces.A1.state = true
    expect(traces.X1.value).to.equal(0)
    expect(traces.Y1.value).to.equal(0)

    traces.A2.state = true
    expect(traces.X2.value).to.equal(0)
    expect(traces.Y2.value).to.equal(0)

    traces.A3.state = true
    expect(traces.X3.value).to.equal(0)
    expect(traces.Y3.value).to.equal(0)

    traces.A4.state = true
    expect(traces.X4.value).to.equal(0)
    expect(traces.Y4.value).to.equal(0)
  })

  it("does not pass signals from X to Y when A is high", () => {
    traces.A1.state = true
    traces.X1.value = 0.5
    expect(traces.Y1.value).to.equal(0)

    traces.A2.state = true
    traces.X2.value = 0.75
    expect(traces.Y2.value).to.equal(0)

    traces.A3.state = true
    traces.X3.value = 0.25
    expect(traces.Y3.value).to.equal(0)

    traces.A4.state = true
    traces.X4.value = 1
    expect(traces.Y4.value).to.equal(0)
  })

  it("does not pass signals from Y to X when A is high", () => {
    traces.A1.state = true
    traces.Y1.value = 0.5
    expect(traces.X1.value).to.equal(0)

    traces.A2.state = true
    traces.Y2.value = 0.75
    expect(traces.X2.value).to.equal(0)

    traces.A3.state = true
    traces.Y3.value = 0.25
    expect(traces.X3.value).to.equal(0)

    traces.A4.state = true
    traces.Y4.value = 1
    expect(traces.X4.value).to.equal(0)
  })

  it("sets Y to X's value after A goes low if X was last set", () => {
    traces.A1.state = true
    traces.Y1.value = 1.5
    traces.X1.value = 0.5
    traces.A1.state = false
    expect(traces.Y1.value).to.equal(0.5)

    traces.A2.state = true
    traces.Y2.value = 1.5
    traces.X2.value = 0.75
    traces.A2.state = false
    expect(traces.Y2.value).to.equal(0.75)

    traces.A3.state = true
    traces.Y3.value = 1.5
    traces.X3.value = 0.25
    traces.A3.state = false
    expect(traces.Y3.value).to.equal(0.25)

    traces.A4.state = true
    traces.Y4.value = 1.5
    traces.X4.value = 1
    traces.A4.state = false
    expect(traces.Y4.value).to.equal(1)
  })

  it("sets X to Y's value after A goes low if Y was last set", () => {
    traces.A1.state = true
    traces.X1.value = 1.5
    traces.Y1.value = 0.5
    traces.A1.state = false
    expect(traces.X1.value).to.equal(0.5)

    traces.A2.state = true
    traces.X2.value = 1.5
    traces.Y2.value = 0.75
    traces.A2.state = false
    expect(traces.X2.value).to.equal(0.75)

    traces.A3.state = true
    traces.X3.value = 1.5
    traces.Y3.value = 0.25
    traces.A3.state = false
    expect(traces.X3.value).to.equal(0.25)

    traces.A4.state = true
    traces.X4.value = 1.5
    traces.Y4.value = 1
    traces.A4.state = false
    expect(traces.X4.value).to.equal(1)
  })

  it("sets both I/O pins to 0 if neither was set before A goes low", () => {
    traces.A1.state = true
    traces.A1.state = false
    expect(traces.X1.value).to.equal(0)
    expect(traces.Y1.value).to.equal(0)

    traces.A2.state = true
    traces.A2.state = false
    expect(traces.X2.value).to.equal(0)
    expect(traces.Y2.value).to.equal(0)

    traces.A3.state = true
    traces.A3.state = false
    expect(traces.X3.value).to.equal(0)
    expect(traces.Y3.value).to.equal(0)

    traces.A4.state = true
    traces.A4.state = false
    expect(traces.X4.value).to.equal(0)
    expect(traces.Y4.value).to.equal(0)
  })
})
