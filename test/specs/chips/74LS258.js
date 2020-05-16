/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect } from "test/helper"

import { create74LS258 } from "chips/74LS258"
import { createTrace, PULL_UP, PULL_DOWN } from "circuits/trace"
import { LOW, HIGH, HI_Z } from "circuits/state"

describe("74LS258 3-State Quad 2-Data Multiplexers", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = create74LS258()
    for (const name in chip.pins) {
      if (!(chip.pins[name].hiZ && chip.pins[name].input)) {
        traces[name] = createTrace(chip.pins[name])
      }
    }

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
      expect(traces._Y1.state).to.equal(HIGH)

      traces.A1.state = HIGH
      expect(traces._Y1.state).to.equal(LOW)
    })

    it("selects B when SEL is high", () => {
      traces.SEL.state = HIGH
      expect(traces._Y1.state).to.equal(LOW)

      traces.B1.state = LOW
      expect(traces._Y1.state).to.equal(HIGH)
    })

    it("is off when OE is high, no matter the value of SEL", () => {
      traces.SEL.state = HIGH
      expect(traces._Y1.state).to.equal(LOW)

      traces._OE.state = HIGH
      expect(traces._Y1.state).to.equal(HI_Z)

      traces.SEL.state = LOW
      expect(traces._Y1.state).to.equal(HI_Z)
    })
  })

  describe("group 2", () => {
    beforeEach(() => {
      traces.A2.state = LOW
      traces.B2.state = HIGH
    })

    it("selects A when SEL is low", () => {
      traces.SEL.state = LOW
      expect(traces._Y2.state).to.equal(HIGH)

      traces.A2.state = HIGH
      expect(traces._Y2.state).to.equal(LOW)
    })

    it("selects B when SEL is high", () => {
      traces.SEL.state = HIGH
      expect(traces._Y2.state).to.equal(LOW)

      traces.B2.state = LOW
      expect(traces._Y2.state).to.equal(HIGH)
    })

    it("is off when OE is high, no matter the value of SEL", () => {
      traces.SEL.state = HIGH
      expect(traces._Y2.state).to.equal(LOW)

      traces._OE.state = HIGH
      expect(traces._Y2.state).to.equal(HI_Z)

      traces.SEL.state = LOW
      expect(traces._Y2.state).to.equal(HI_Z)
    })
  })

  describe("group 3", () => {
    beforeEach(() => {
      traces.A3.state = LOW
      traces.B3.state = HIGH
    })

    it("selects A when SEL is low", () => {
      traces.SEL.state = LOW
      expect(traces._Y3.state).to.equal(HIGH)

      traces.A3.state = HIGH
      expect(traces._Y3.state).to.equal(LOW)
    })

    it("selects B when SEL is high", () => {
      traces.SEL.state = HIGH
      expect(traces._Y3.state).to.equal(LOW)

      traces.B3.state = LOW
      expect(traces._Y3.state).to.equal(HIGH)
    })

    it("is off when OE is high, no matter the value of SEL", () => {
      traces.SEL.state = HIGH
      expect(traces._Y3.state).to.equal(LOW)

      traces._OE.state = HIGH
      expect(traces._Y3.state).to.equal(HI_Z)

      traces.SEL.state = LOW
      expect(traces._Y3.state).to.equal(HI_Z)
    })
  })

  describe("group 4", () => {
    beforeEach(() => {
      traces.A4.state = LOW
      traces.B4.state = HIGH
    })

    it("selects A when SEL is low", () => {
      traces.SEL.state = LOW
      expect(traces._Y4.state).to.equal(HIGH)

      traces.A4.state = HIGH
      expect(traces._Y4.state).to.equal(LOW)
    })

    it("selects B when SEL is high", () => {
      traces.SEL.state = HIGH
      expect(traces._Y4.state).to.equal(LOW)

      traces.B4.state = LOW
      expect(traces._Y4.state).to.equal(HIGH)
    })

    it("is off when OE is high, no matter the value of SEL", () => {
      traces.SEL.state = HIGH
      expect(traces._Y4.state).to.equal(LOW)

      traces._OE.state = HIGH
      expect(traces._Y4.state).to.equal(HI_Z)

      traces.SEL.state = LOW
      expect(traces._Y4.state).to.equal(HI_Z)
    })
  })
})
