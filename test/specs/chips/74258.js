// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect, deviceTraces } from "test/helper"
import { new74258 } from "chips/74258"

describe("74258 3-State Quad 2-Data Multiplexers", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = new74258()
    traces = deviceTraces(chip)
  })

  describe("group 1", () => {
    beforeEach(() => {
      traces.A1.clear()
      traces.B1.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      expect(traces._Y1.high).to.be.true

      traces.A1.set()
      expect(traces._Y1.low).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      expect(traces._Y1.low).to.be.true

      traces.B1.clear()
      expect(traces._Y1.high).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      expect(traces._Y1.low).to.be.true

      traces._OE.set()
      expect(traces._Y1.null).to.be.true

      traces.SEL.clear()
      expect(traces._Y1.null).to.be.true
    })
  })

  describe("group 2", () => {
    beforeEach(() => {
      traces.A2.clear()
      traces.B2.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      expect(traces._Y2.high).to.be.true

      traces.A2.set()
      expect(traces._Y2.low).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      expect(traces._Y2.low).to.be.true

      traces.B2.clear()
      expect(traces._Y2.high).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      expect(traces._Y2.low).to.be.true

      traces._OE.set()
      expect(traces._Y2.null).to.be.true

      traces.SEL.clear()
      expect(traces._Y2.null).to.be.true
    })
  })

  describe("group 3", () => {
    beforeEach(() => {
      traces.A3.clear()
      traces.B3.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      expect(traces._Y3.high).to.be.true

      traces.A3.set()
      expect(traces._Y3.low).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      expect(traces._Y3.low).to.be.true

      traces.B3.clear()
      expect(traces._Y3.high).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      expect(traces._Y3.low).to.be.true

      traces._OE.set()
      expect(traces._Y3.null).to.be.true

      traces.SEL.clear()
      expect(traces._Y3.null).to.be.true
    })
  })

  describe("group 4", () => {
    beforeEach(() => {
      traces.A4.clear()
      traces.B4.set()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.clear()
      expect(traces._Y4.high).to.be.true

      traces.A4.set()
      expect(traces._Y4.low).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.set()
      expect(traces._Y4.low).to.be.true

      traces.B4.clear()
      expect(traces._Y4.high).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.set()
      expect(traces._Y4.low).to.be.true

      traces._OE.set()
      expect(traces._Y4.null).to.be.true

      traces.SEL.clear()
      expect(traces._Y4.null).to.be.true
    })
  })
})
