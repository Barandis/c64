/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces } from "test/helper"

import { create74LS257 } from "chips/74LS257"
import { createTrace, PULL_UP, PULL_DOWN } from "circuits/trace"
import { LOW, HIGH, HI_Z } from "circuits/state"

describe("74LS257 3-State Quad 2-Data Multiplexers", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = create74LS257()
    setupTraces(traces, chip)
    traces.VCC = createTrace(chip.pins.VCC, PULL_UP)
    traces.GND = createTrace(chip.pins.GND, PULL_DOWN)
  })

  describe("group 1", () => {
    beforeEach(() => {
      traces.A1.state = LOW
      traces.B1.state = HIGH
    })

    it("selects A when SEL is low", () => {
      traces.SEL.state = LOW
      expect(traces.Y1.state).to.equal(LOW)

      traces.A1.state = HIGH
      expect(traces.Y1.state).to.equal(HIGH)
    })

    it("selects B when SEL is high", () => {
      traces.SEL.state = HIGH
      expect(traces.Y1.state).to.equal(HIGH)

      traces.B1.state = LOW
      expect(traces.Y1.state).to.equal(LOW)
    })

    it("is off when OE is high, no matter the value of SEL", () => {
      traces.SEL.state = HIGH
      expect(traces.Y1.state).to.equal(HIGH)

      traces._OE.state = HIGH
      expect(traces.Y1.state).to.equal(HI_Z)

      traces.SEL.state = LOW
      expect(traces.Y1.state).to.equal(HI_Z)
    })
  })

  describe("group 2", () => {
    beforeEach(() => {
      traces.A2.state = LOW
      traces.B2.state = HIGH
    })

    it("selects A when SEL is low", () => {
      traces.SEL.state = LOW
      expect(traces.Y2.state).to.equal(LOW)

      traces.A2.state = HIGH
      expect(traces.Y2.state).to.equal(HIGH)
    })

    it("selects B when SEL is high", () => {
      traces.SEL.state = HIGH
      expect(traces.Y2.state).to.equal(HIGH)

      traces.B2.state = LOW
      expect(traces.Y2.state).to.equal(LOW)
    })

    it("is off when OE is high, no matter the value of SEL", () => {
      traces.SEL.state = HIGH
      expect(traces.Y2.state).to.equal(HIGH)

      traces._OE.state = HIGH
      expect(traces.Y2.state).to.equal(HI_Z)

      traces.SEL.state = LOW
      expect(traces.Y2.state).to.equal(HI_Z)
    })
  })

  describe("group 3", () => {
    beforeEach(() => {
      traces.A3.state = LOW
      traces.B3.state = HIGH
    })

    it("selects A when SEL is low", () => {
      traces.SEL.state = LOW
      expect(traces.Y3.state).to.equal(LOW)

      traces.A3.state = HIGH
      expect(traces.Y3.state).to.equal(HIGH)
    })

    it("selects B when SEL is high", () => {
      traces.SEL.state = HIGH
      expect(traces.Y3.state).to.equal(HIGH)

      traces.B3.state = LOW
      expect(traces.Y3.state).to.equal(LOW)
    })

    it("is off when OE is high, no matter the value of SEL", () => {
      traces.SEL.state = HIGH
      expect(traces.Y3.state).to.equal(HIGH)

      traces._OE.state = HIGH
      expect(traces.Y3.state).to.equal(HI_Z)

      traces.SEL.state = LOW
      expect(traces.Y3.state).to.equal(HI_Z)
    })
  })

  describe("group 4", () => {
    beforeEach(() => {
      traces.A4.state = LOW
      traces.B4.state = HIGH
    })

    it("selects A when SEL is low", () => {
      traces.SEL.state = LOW
      expect(traces.Y4.state).to.equal(LOW)

      traces.A4.state = HIGH
      expect(traces.Y4.state).to.equal(HIGH)
    })

    it("selects B when SEL is high", () => {
      traces.SEL.state = HIGH
      expect(traces.Y4.state).to.equal(HIGH)

      traces.B4.state = LOW
      expect(traces.Y4.state).to.equal(LOW)
    })

    it("is off when OE is high, no matter the value of SEL", () => {
      traces.SEL.state = HIGH
      expect(traces.Y4.state).to.equal(HIGH)

      traces._OE.state = HIGH
      expect(traces.Y4.state).to.equal(HI_Z)

      traces.SEL.state = LOW
      expect(traces.Y4.state).to.equal(HI_Z)
    })
  })
})
