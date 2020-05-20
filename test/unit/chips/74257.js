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
      traces.A1.state = false
      traces.B1.state = true
    })

    it("selects A when SEL is false", () => {
      traces.SEL.state = false
      expect(traces.Y1.state).to.be.false

      traces.A1.state = true
      expect(traces.Y1.state).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.state = true
      expect(traces.Y1.state).to.be.true

      traces.B1.state = false
      expect(traces.Y1.state).to.be.false
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.state = true
      expect(traces.Y1.state).to.be.true

      traces._OE.state = true
      expect(traces.Y1.state).to.be.null

      traces.SEL.state = false
      expect(traces.Y1.state).to.be.null
    })
  })

  describe("group 2", () => {
    beforeEach(() => {
      traces.A2.state = false
      traces.B2.state = true
    })

    it("selects A when SEL is false", () => {
      traces.SEL.state = false
      expect(traces.Y2.state).to.be.false

      traces.A2.state = true
      expect(traces.Y2.state).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.state = true
      expect(traces.Y2.state).to.be.true

      traces.B2.state = false
      expect(traces.Y2.state).to.be.false
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.state = true
      expect(traces.Y2.state).to.be.true

      traces._OE.state = true
      expect(traces.Y2.state).to.be.null

      traces.SEL.state = false
      expect(traces.Y2.state).to.be.null
    })
  })

  describe("group 3", () => {
    beforeEach(() => {
      traces.A3.state = false
      traces.B3.state = true
    })

    it("selects A when SEL is false", () => {
      traces.SEL.state = false
      expect(traces.Y3.state).to.be.false

      traces.A3.state = true
      expect(traces.Y3.state).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.state = true
      expect(traces.Y3.state).to.be.true

      traces.B3.state = false
      expect(traces.Y3.state).to.be.false
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.state = true
      expect(traces.Y3.state).to.be.true

      traces._OE.state = true
      expect(traces.Y3.state).to.be.null

      traces.SEL.state = false
      expect(traces.Y3.state).to.be.null
    })
  })

  describe("group 4", () => {
    beforeEach(() => {
      traces.A4.state = false
      traces.B4.state = true
    })

    it("selects A when SEL is false", () => {
      traces.SEL.state = false
      expect(traces.Y4.state).to.be.false

      traces.A4.state = true
      expect(traces.Y4.state).to.be.true
    })

    it("selects B when SEL is true", () => {
      traces.SEL.state = true
      expect(traces.Y4.state).to.be.true

      traces.B4.state = false
      expect(traces.Y4.state).to.be.false
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.state = true
      expect(traces.Y4.state).to.be.true

      traces._OE.state = true
      expect(traces.Y4.state).to.be.null

      traces.SEL.state = false
      expect(traces.Y4.state).to.be.null
    })
  })
})
