/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces } from "test/helper"

import { create74LS258 } from "chips/74LS258"
import { createTrace, PULL_UP, PULL_DOWN } from "circuits/trace"

describe("74LS258 3-State Quad 2-Data Multiplexers", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = create74LS258()
    setupTraces(traces, chip)
    traces.VCC = createTrace(chip.pins.VCC, PULL_UP)
    traces.GND = createTrace(chip.pins.GND, PULL_DOWN)
  })

  describe("group 1", () => {
    beforeEach(() => {
      traces.A1.state = false
      traces.B1.state = true
    })

    it("selects A when SEL is false", () => {
      traces.SEL.state = false
      expect(traces._Y1.state).to.be.true

      traces.A1.state = true
      expect(traces._Y1.state).to.be.false
    })

    it("selects B when SEL is true", () => {
      traces.SEL.state = true
      expect(traces._Y1.state).to.be.false

      traces.B1.state = false
      expect(traces._Y1.state).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.state = true
      expect(traces._Y1.state).to.be.false

      traces._OE.state = true
      expect(traces._Y1.state).to.be.null

      traces.SEL.state = false
      expect(traces._Y1.state).to.be.null
    })
  })

  describe("group 2", () => {
    beforeEach(() => {
      traces.A2.state = false
      traces.B2.state = true
    })

    it("selects A when SEL is false", () => {
      traces.SEL.state = false
      expect(traces._Y2.state).to.be.true

      traces.A2.state = true
      expect(traces._Y2.state).to.be.false
    })

    it("selects B when SEL is true", () => {
      traces.SEL.state = true
      expect(traces._Y2.state).to.be.false

      traces.B2.state = false
      expect(traces._Y2.state).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.state = true
      expect(traces._Y2.state).to.be.false

      traces._OE.state = true
      expect(traces._Y2.state).to.be.null

      traces.SEL.state = false
      expect(traces._Y2.state).to.be.null
    })
  })

  describe("group 3", () => {
    beforeEach(() => {
      traces.A3.state = false
      traces.B3.state = true
    })

    it("selects A when SEL is false", () => {
      traces.SEL.state = false
      expect(traces._Y3.state).to.be.true

      traces.A3.state = true
      expect(traces._Y3.state).to.be.false
    })

    it("selects B when SEL is true", () => {
      traces.SEL.state = true
      expect(traces._Y3.state).to.be.false

      traces.B3.state = false
      expect(traces._Y3.state).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.state = true
      expect(traces._Y3.state).to.be.false

      traces._OE.state = true
      expect(traces._Y3.state).to.be.null

      traces.SEL.state = false
      expect(traces._Y3.state).to.be.null
    })
  })

  describe("group 4", () => {
    beforeEach(() => {
      traces.A4.state = false
      traces.B4.state = true
    })

    it("selects A when SEL is false", () => {
      traces.SEL.state = false
      expect(traces._Y4.state).to.be.true

      traces.A4.state = true
      expect(traces._Y4.state).to.be.false
    })

    it("selects B when SEL is true", () => {
      traces.SEL.state = true
      expect(traces._Y4.state).to.be.false

      traces.B4.state = false
      expect(traces._Y4.state).to.be.true
    })

    it("is off when OE is true, no matter the value of SEL", () => {
      traces.SEL.state = true
      expect(traces._Y4.state).to.be.false

      traces._OE.state = true
      expect(traces._Y4.state).to.be.null

      traces.SEL.state = false
      expect(traces._Y4.state).to.be.null
    })
  })
})
