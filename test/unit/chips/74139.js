/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { new74139 } from "chips/74139"

describe("74139 dual 2-line to 4-line demultiplexer", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = new74139()
    traces = deviceTraces(chip)
  })

  it("pulls all demux 1 outputs high when _G1 is high", () => {
    traces._G1.set()
    traces.A1.clear()
    traces.B1.clear()
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true

    traces.A1.set()
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true

    traces.B1.set()
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true

    traces.A1.clear()
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true
  })

  it("selects the correct line for L/L in demux 1", () => {
    traces._G1.clear()
    traces.A1.clear()
    traces.B1.clear()
    expect(traces._Y10.low).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true
  })

  it("selects the correct line for H/L in demux 1", () => {
    traces._G1.clear()
    traces.A1.set()
    traces.B1.clear()
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.low).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.high).to.be.true
  })

  it("selects the correct line for L/H in demux 1", () => {
    traces._G1.clear()
    traces.A1.clear()
    traces.B1.set()
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.low).to.be.true
    expect(traces._Y13.high).to.be.true
  })

  it("selects the correct line for H/H in demux 1", () => {
    traces._G1.clear()
    traces.A1.set()
    traces.B1.set()
    expect(traces._Y10.high).to.be.true
    expect(traces._Y11.high).to.be.true
    expect(traces._Y12.high).to.be.true
    expect(traces._Y13.low).to.be.true
  })

  it("pulls all demux 2 outputs high when _G2 is high", () => {
    traces._G2.set()
    traces.A2.clear()
    traces.B2.clear()
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true

    traces.A2.set()
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true

    traces.B2.set()
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true

    traces.A2.clear()
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true
  })

  it("selects the correct line for L/L in demux 2", () => {
    traces._G2.clear()
    traces.A2.clear()
    traces.B2.clear()
    expect(traces._Y20.low).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true
  })

  it("selects the correct line for H/L in demux 2", () => {
    traces._G2.clear()
    traces.A2.set()
    traces.B2.clear()
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.low).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.high).to.be.true
  })

  it("selects the correct line for L/H in demux 2", () => {
    traces._G2.clear()
    traces.A2.clear()
    traces.B2.set()
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.low).to.be.true
    expect(traces._Y23.high).to.be.true
  })

  it("selects the correct line for H/H in demux 2", () => {
    traces._G2.clear()
    traces.A2.set()
    traces.B2.set()
    expect(traces._Y20.high).to.be.true
    expect(traces._Y21.high).to.be.true
    expect(traces._Y22.high).to.be.true
    expect(traces._Y23.low).to.be.true
  })
})
