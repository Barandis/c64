/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces } from "test/helper"

import { create74139 } from "chips/74139"
import { createTrace, PULL_UP, PULL_DOWN } from "components/trace"

describe("74139 dual 2-line to 4-line demultiplexer", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = create74139()
    setupTraces(traces, chip)
    traces.VCC = createTrace(chip.VCC, PULL_UP)
    traces.GND = createTrace(chip.GND, PULL_DOWN)
  })

  it("pulls all demux 1 outputs high when _G1 is high", () => {
    traces._G1.state = 1
    traces.A1.state = 0
    traces.B1.state = 0
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true

    traces.A1.state = 1
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true

    traces.B1.state = 1
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true

    traces.A1.state = 0
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true
  })

  it("selects the correct line for L/L in demux 1", () => {
    traces._G1.state = 0
    traces.A1.state = 0
    traces.B1.state = 0
    expect(traces._Y10.low).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true
  })

  it("selects the correct line for H/L in demux 1", () => {
    traces._G1.state = 0
    traces.A1.state = 1
    traces.B1.state = 0
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.low).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true
  })

  it("selects the correct line for L/H in demux 1", () => {
    traces._G1.state = 0
    traces.A1.state = 0
    traces.B1.state = 1
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.low).to.be.true
    expect(traces._Y13.high).to.be.true
  })

  it("selects the correct line for H/H in demux 1", () => {
    traces._G1.state = 0
    traces.A1.state = 1
    traces.B1.state = 1
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.low).to.be.true
  })

  it("pulls all demux 2 outputs high when _G2 is high", () => {
    traces._G2.state = 1
    traces.A2.state = 0
    traces.B2.state = 0
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true

    traces.A2.state = 1
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true

    traces.B2.state = 1
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true

    traces.A2.state = 0
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true
  })

  it("selects the correct line for L/L in demux 2", () => {
    traces._G2.state = 0
    traces.A2.state = 0
    traces.B2.state = 0
    expect(traces._Y20.low).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true
  })

  it("selects the correct line for H/L in demux 2", () => {
    traces._G2.state = 0
    traces.A2.state = 1
    traces.B2.state = 0
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.low).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true
  })

  it("selects the correct line for L/H in demux 2", () => {
    traces._G2.state = 0
    traces.A2.state = 0
    traces.B2.state = 1
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.low).to.be.true
    expect(traces._Y23.high).to.be.true
  })

  it("selects the correct line for H/H in demux 2", () => {
    traces._G2.state = 0
    traces.A2.state = 1
    traces.B2.state = 1
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.low).to.be.true
  })
})
