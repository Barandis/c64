/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { new74257 } from "chips/74257"

describe("74257 3-State Quad 2-Data Multiplexers", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = new74257()
    traces = deviceTraces(chip)
  })

  describe("group 1", () => {
    beforeEach(() => {
      traces.A1.lower()
      traces.B1.raise()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.lower()
      expect(traces.Y1.low).to.be.true

      traces.A1.raise()
      expect(traces.Y1.high).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.raise()
      expect(traces.Y1.high).to.be.true

      traces.B1.lower()
      expect(traces.Y1.low).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.raise()
      expect(traces.Y1.high).to.be.true

      traces._OE.raise()
      expect(traces.Y1.null).to.be.true

      traces.SEL.lower()
      expect(traces.Y1.null).to.be.true
    })
  })

  describe("group 2", () => {
    beforeEach(() => {
      traces.A2.lower()
      traces.B2.raise()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.lower()
      expect(traces.Y2.low).to.be.true

      traces.A2.raise()
      expect(traces.Y2.high).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.raise()
      expect(traces.Y2.high).to.be.true

      traces.B2.lower()
      expect(traces.Y2.low).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.raise()
      expect(traces.Y2.high).to.be.true

      traces._OE.raise()
      expect(traces.Y2.null).to.be.true

      traces.SEL.lower()
      expect(traces.Y2.null).to.be.true
    })
  })

  describe("group 3", () => {
    beforeEach(() => {
      traces.A3.lower()
      traces.B3.raise()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.lower()
      expect(traces.Y3.low).to.be.true

      traces.A3.raise()
      expect(traces.Y3.high).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.raise()
      expect(traces.Y3.high).to.be.true

      traces.B3.lower()
      expect(traces.Y3.low).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.raise()
      expect(traces.Y3.high).to.be.true

      traces._OE.raise()
      expect(traces.Y3.null).to.be.true

      traces.SEL.lower()
      expect(traces.Y3.null).to.be.true
    })
  })

  describe("group 4", () => {
    beforeEach(() => {
      traces.A4.lower()
      traces.B4.raise()
    })

    it("selects A when SEL is false", () => {
      traces.SEL.lower()
      expect(traces.Y4.low).to.be.true

      traces.A4.raise()
      expect(traces.Y4.high).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.raise()
      expect(traces.Y4.high).to.be.true

      traces.B4.lower()
      expect(traces.Y4.low).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.raise()
      expect(traces.Y4.high).to.be.true

      traces._OE.raise()
      expect(traces.Y4.null).to.be.true

      traces.SEL.lower()
      expect(traces.Y4.null).to.be.true
    })
  })
})
