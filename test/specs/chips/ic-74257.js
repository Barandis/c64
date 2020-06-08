// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect, deviceTraces } from "test/helper"
import { Ic74257 } from "chips/ic-74257"

describe("74257 3-State Quad 2-Data Multiplexers", () => {
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

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      expect(traces.Y1.low).to.be.true

      traces.A1.set()
      expect(traces.Y1.high).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      expect(traces.Y1.high).to.be.true

      traces.B1.clear()
      expect(traces.Y1.low).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      expect(traces.Y1.high).to.be.true

      traces._OE.set()
      expect(traces.Y1.null).to.be.true

      traces.SEL.clear()
      expect(traces.Y1.null).to.be.true
    })
  })

  describe("group 2", () => {
    beforeEach(() => {
      traces.A2.clear()
      traces.B2.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      expect(traces.Y2.low).to.be.true

      traces.A2.set()
      expect(traces.Y2.high).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      expect(traces.Y2.high).to.be.true

      traces.B2.clear()
      expect(traces.Y2.low).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      expect(traces.Y2.high).to.be.true

      traces._OE.set()
      expect(traces.Y2.null).to.be.true

      traces.SEL.clear()
      expect(traces.Y2.null).to.be.true
    })
  })

  describe("group 3", () => {
    beforeEach(() => {
      traces.A3.clear()
      traces.B3.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      expect(traces.Y3.low).to.be.true

      traces.A3.set()
      expect(traces.Y3.high).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      expect(traces.Y3.high).to.be.true

      traces.B3.clear()
      expect(traces.Y3.low).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      expect(traces.Y3.high).to.be.true

      traces._OE.set()
      expect(traces.Y3.null).to.be.true

      traces.SEL.clear()
      expect(traces.Y3.null).to.be.true
    })
  })

  describe("group 4", () => {
    beforeEach(() => {
      traces.A4.clear()
      traces.B4.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      expect(traces.Y4.low).to.be.true

      traces.A4.set()
      expect(traces.Y4.high).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      expect(traces.Y4.high).to.be.true

      traces.B4.clear()
      expect(traces.Y4.low).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      expect(traces.Y4.high).to.be.true

      traces._OE.set()
      expect(traces.Y4.null).to.be.true

      traces.SEL.clear()
      expect(traces.Y4.null).to.be.true
    })
  })
})
