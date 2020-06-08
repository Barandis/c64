// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from "test/helper"
import { Ic74139 } from "chips/ic-74139"

describe("74139 dual 2-line to 4-line demultiplexer", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic74139()
    traces = deviceTraces(chip)
  })

  it("pulls all demux 1 outputs high when _G1 is high", () => {
    traces._G1.set()
    traces.A1.clear()
    traces.B1.clear()
    assert(traces._Y10.high)
    assert(traces._Y11.high)
    assert(traces._Y12.high)
    assert(traces._Y13.high)

    traces.A1.set()
    assert(traces._Y10.high)
    assert(traces._Y11.high)
    assert(traces._Y12.high)
    assert(traces._Y13.high)

    traces.B1.set()
    assert(traces._Y10.high)
    assert(traces._Y11.high)
    assert(traces._Y12.high)
    assert(traces._Y13.high)

    traces.A1.clear()
    assert(traces._Y10.high)
    assert(traces._Y11.high)
    assert(traces._Y12.high)
    assert(traces._Y13.high)
  })

  it("selects the correct line for L/L in demux 1", () => {
    traces._G1.clear()
    traces.A1.clear()
    traces.B1.clear()
    assert(traces._Y10.low)
    assert(traces._Y11.high)
    assert(traces._Y12.high)
    assert(traces._Y13.high)
  })

  it("selects the correct line for H/L in demux 1", () => {
    traces._G1.clear()
    traces.A1.set()
    traces.B1.clear()
    assert(traces._Y10.high)
    assert(traces._Y11.low)
    assert(traces._Y12.high)
    assert(traces._Y13.high)
  })

  it("selects the correct line for L/H in demux 1", () => {
    traces._G1.clear()
    traces.A1.clear()
    traces.B1.set()
    assert(traces._Y10.high)
    assert(traces._Y11.high)
    assert(traces._Y12.low)
    assert(traces._Y13.high)
  })

  it("selects the correct line for H/H in demux 1", () => {
    traces._G1.clear()
    traces.A1.set()
    traces.B1.set()
    assert(traces._Y10.high)
    assert(traces._Y11.high)
    assert(traces._Y12.high)
    assert(traces._Y13.low)
  })

  it("pulls all demux 2 outputs high when _G2 is high", () => {
    traces._G2.set()
    traces.A2.clear()
    traces.B2.clear()
    assert(traces._Y20.high)
    assert(traces._Y21.high)
    assert(traces._Y22.high)
    assert(traces._Y23.high)

    traces.A2.set()
    assert(traces._Y20.high)
    assert(traces._Y21.high)
    assert(traces._Y22.high)
    assert(traces._Y23.high)

    traces.B2.set()
    assert(traces._Y20.high)
    assert(traces._Y21.high)
    assert(traces._Y22.high)
    assert(traces._Y23.high)

    traces.A2.clear()
    assert(traces._Y20.high)
    assert(traces._Y21.high)
    assert(traces._Y22.high)
    assert(traces._Y23.high)
  })

  it("selects the correct line for L/L in demux 2", () => {
    traces._G2.clear()
    traces.A2.clear()
    traces.B2.clear()
    assert(traces._Y20.low)
    assert(traces._Y21.high)
    assert(traces._Y22.high)
    assert(traces._Y23.high)
  })

  it("selects the correct line for H/L in demux 2", () => {
    traces._G2.clear()
    traces.A2.set()
    traces.B2.clear()
    assert(traces._Y20.high)
    assert(traces._Y21.low)
    assert(traces._Y22.high)
    assert(traces._Y23.high)
  })

  it("selects the correct line for L/H in demux 2", () => {
    traces._G2.clear()
    traces.A2.clear()
    traces.B2.set()
    assert(traces._Y20.high)
    assert(traces._Y21.high)
    assert(traces._Y22.low)
    assert(traces._Y23.high)
  })

  it("selects the correct line for H/H in demux 2", () => {
    traces._G2.clear()
    traces.A2.set()
    traces.B2.set()
    assert(traces._Y20.high)
    assert(traces._Y21.high)
    assert(traces._Y22.high)
    assert(traces._Y23.low)
  })
})
