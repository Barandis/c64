// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from "test/helper"
import { Ic74257 } from "chips"

const selLowMessage = (mux, state) =>
  `Y${mux} should be ${state} when A${mux} is ${state} and SEL is low`
const selHighMessage = (mux, state) =>
  `Y${mux} should be ${state} when B${mux} is ${state} and SEL is high`
const oeMessage = mux => `Y${mux} should float when _OE is high`

describe("74257 3-State Quad 2-to-1 Multiplexers", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic74257()
    traces = deviceTraces(chip)
  })

  describe("group 1", () => {
    beforeEach(() => {
      traces.A1.clear()
      traces.B1.set()
    })

    it("selects A when SEL is low", () => {
      traces.SEL.clear()
      assert(traces.Y1.low, selLowMessage(1, "low"))

      traces.A1.set()
      assert(traces.Y1.high, selLowMessage(1, "high"))
    })

    it("selects B when SEL is high", () => {
      traces.SEL.set()
      assert(traces.Y1.high, selHighMessage(1, "high"))

      traces.B1.clear()
      assert(traces.Y1.low, selHighMessage(1, "low"))
    })

    it("is off when OE is high, no matter the value of SEL", () => {
      traces.SEL.set()
      assert(traces.Y1.high, selHighMessage(1, "high"))

      traces._OE.set()
      assert(traces.Y1.floating, oeMessage(1))

      traces.SEL.clear()
      assert(traces.Y1.floating, oeMessage(1))
    })
  })

  describe("group 2", () => {
    beforeEach(() => {
      traces.A2.clear()
      traces.B2.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      assert(traces.Y2.low, selLowMessage(2, "low"))

      traces.A2.set()
      assert(traces.Y2.high, selLowMessage(2, "high"))
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      assert(traces.Y2.high, selHighMessage(2, "high"))

      traces.B2.clear()
      assert(traces.Y2.low, selHighMessage(2, "low"))
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      assert(traces.Y2.high, selHighMessage(2, "high"))

      traces._OE.set()
      assert(traces.Y2.floating, oeMessage(2))

      traces.SEL.clear()
      assert(traces.Y2.floating, oeMessage(2))
    })
  })

  describe("group 3", () => {
    beforeEach(() => {
      traces.A3.clear()
      traces.B3.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      assert(traces.Y3.low, selLowMessage(3, "low"))

      traces.A3.set()
      assert(traces.Y3.high, selLowMessage(3, "high"))
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      assert(traces.Y3.high, selHighMessage(3, "high"))

      traces.B3.clear()
      assert(traces.Y3.low, selHighMessage(3, "low"))
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      assert(traces.Y3.high, selHighMessage(3, "high"))

      traces._OE.set()
      assert(traces.Y3.floating, oeMessage(3))

      traces.SEL.clear()
      assert(traces.Y3.floating, oeMessage(3))
    })
  })

  describe("group 4", () => {
    beforeEach(() => {
      traces.A4.clear()
      traces.B4.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      assert(traces.Y4.low, selLowMessage(4, "low"))

      traces.A4.set()
      assert(traces.Y4.high, selLowMessage(4, "high"))
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      assert(traces.Y4.high, selHighMessage(4, "high"))

      traces.B4.clear()
      assert(traces.Y4.low, selHighMessage(4, "low"))
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      assert(traces.Y4.high, selHighMessage(4, "high"))

      traces._OE.set()
      assert(traces.Y4.floating, oeMessage(4))

      traces.SEL.clear()
      assert(traces.Y4.floating, oeMessage(4))
    })
  })
})
