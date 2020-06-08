// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from "test/helper"
import { Ic74258 } from "chips"

describe("74258 3-State Quad 2-Data Multiplexers", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic74258()
    traces = deviceTraces(chip)
  })

  describe("group 1", () => {
    beforeEach(() => {
      traces.A1.clear()
      traces.B1.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      assert(traces._Y1.high)

      traces.A1.set()
      assert(traces._Y1.low)
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      assert(traces._Y1.low)

      traces.B1.clear()
      assert(traces._Y1.high)
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      assert(traces._Y1.low)

      traces._OE.set()
      assert(traces._Y1.floating)

      traces.SEL.clear()
      assert(traces._Y1.floating)
    })
  })

  describe("group 2", () => {
    beforeEach(() => {
      traces.A2.clear()
      traces.B2.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      assert(traces._Y2.high)

      traces.A2.set()
      assert(traces._Y2.low)
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      assert(traces._Y2.low)

      traces.B2.clear()
      assert(traces._Y2.high)
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      assert(traces._Y2.low)

      traces._OE.set()
      assert(traces._Y2.floating)

      traces.SEL.clear()
      assert(traces._Y2.floating)
    })
  })

  describe("group 3", () => {
    beforeEach(() => {
      traces.A3.clear()
      traces.B3.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      assert(traces._Y3.high)

      traces.A3.set()
      assert(traces._Y3.low)
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      assert(traces._Y3.low)

      traces.B3.clear()
      assert(traces._Y3.high)
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      assert(traces._Y3.low)

      traces._OE.set()
      assert(traces._Y3.floating)

      traces.SEL.clear()
      assert(traces._Y3.floating)
    })
  })

  describe("group 4", () => {
    beforeEach(() => {
      traces.A4.clear()
      traces.B4.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      assert(traces._Y4.high)

      traces.A4.set()
      assert(traces._Y4.low)
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      assert(traces._Y4.low)

      traces.B4.clear()
      assert(traces._Y4.high)
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      assert(traces._Y4.low)

      traces._OE.set()
      assert(traces._Y4.floating)

      traces.SEL.clear()
      assert(traces._Y4.floating)
    })
  })
})
