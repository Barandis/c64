/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect } from "test/helper"

import { createTrace, PULL_DOWN, PULL_UP } from "circuits/trace"
import { createPin, INPUT, OUTPUT, INPUT_OUTPUT } from "circuits/pin"
import { LOW, HIGH, HI_Z } from "circuits/state"

describe("Trace", () => {
  describe("initial value", () => {
    it("is low with no output pins", () => {
      const pin = createPin(1, "A")
      const trace = createTrace(pin)
      expect(trace.value).to.equal(LOW)
    })

    it("is high if any connnected output pin is high", () => {
      const pin1 = createPin(1, "A", OUTPUT, LOW)
      const pin2 = createPin(2, "B", OUTPUT, HIGH)
      const trace = createTrace(pin1, pin2)
      expect(trace.value).to.equal(HIGH)
    })

    it("is low if any connected output pin is low and none are high", () => {
      const pin1 = createPin(1, "A", OUTPUT, HI_Z)
      const pin2 = createPin(2, "B", OUTPUT, LOW)
      const trace = createTrace(pin1, pin2)
      expect(trace.value).to.equal(LOW)
    })

    it("is hi-z from FLOAT if all connected output pins are hi-z", () => {
      const pin1 = createPin(1, "A", OUTPUT, HI_Z)
      const pin2 = createPin(2, "B", OUTPUT, HI_Z)
      const pin3 = createPin(3, "C", INPUT)
      const trace = createTrace(pin1, pin2, pin3)
      expect(trace.hiZ).to.be.true
    })

    it("is low if PULL_DOWN is specified and all connected output pins are hi-z", () => {
      const pin1 = createPin(1, "A", OUTPUT, HI_Z)
      const pin2 = createPin(2, "B", OUTPUT, HI_Z)
      const pin3 = createPin(3, "C", INPUT)
      const trace = createTrace(pin1, pin2, pin3, PULL_DOWN)
      expect(trace.low).to.be.true
    })

    it("is high if PULL_UP is specified and all connected output pins are hi-z", () => {
      const pin1 = createPin(1, "A", OUTPUT, HI_Z)
      const pin2 = createPin(2, "B", OUTPUT, HI_Z)
      const pin3 = createPin(3, "C", INPUT)
      const trace = createTrace(pin1, pin2, pin3, PULL_UP)
      expect(trace.high).to.be.true
    })
  })

  describe("setting value directly", () => {
    let pin1
    let pin2
    let pin3
    let trace

    beforeEach(() => {
      pin1 = createPin(1, "A", INPUT)
      pin2 = createPin(2, "B", INPUT_OUTPUT)
      pin3 = createPin(3, "C", OUTPUT)
      trace = createTrace(pin1, pin2, pin3)
    })

    it("can be set to low or high, in turn setting its connected input pins", () => {
      trace.value = HIGH
      expect(trace.value).to.equal(HIGH)
      expect(pin1.value).to.equal(HIGH)
      expect(pin2.value).to.equal(HIGH)

      trace.value = LOW
      expect(trace.value).to.equal(LOW)
      expect(pin1.value).to.equal(LOW)
      expect(pin2.value).to.equal(LOW)

      trace.value = HI_Z // Actually set to LOW because the output pin is low
      expect(trace.value).to.equal(LOW)
      expect(pin1.value).to.equal(LOW)
      expect(pin2.value).to.equal(LOW)
    })

    it("can be set the same way by boolean value", () => {
      trace.state = true
      expect(trace.state).to.be.true
      expect(pin1.state).to.be.true
      expect(pin2.state).to.be.true

      trace.state = false
      expect(trace.state).to.be.false
      expect(pin1.state).to.be.false
      expect(pin2.state).to.be.false

      trace.state = null // Actually set to false because the output pin is false
      expect(trace.state).to.be.false
      expect(pin1.state).to.be.false
      expect(pin2.state).to.be.false
    })

    it("can be set low or high via an output pin", () => {
      pin3.value = HIGH
      expect(trace.value).to.equal(HIGH)
      expect(pin1.value).to.equal(HIGH)
      expect(pin2.value).to.equal(HIGH)

      pin3.value = LOW
      expect(trace.value).to.equal(LOW)
      expect(pin1.value).to.equal(LOW)
      expect(pin2.value).to.equal(LOW)

      pin2.mode = OUTPUT
      pin3.value = HI_Z // Actually set to LOW because the other output pin is LOW
      expect(trace.value).to.equal(LOW)
      expect(pin1.value).to.equal(LOW)
      expect(pin2.value).to.equal(LOW)

      pin2.value = HI_Z // Actually gets set to HI_Z because all output pins are HI_Z
      expect(trace.value).to.equal(HI_Z)
      expect(pin1.value).to.equal(HI_Z)
      expect(pin2.value).to.equal(HI_Z)
    })

    it("can be set by boolean value via an output pin", () => {
      pin3.value = true
      expect(trace.state).to.be.true
      expect(pin1.state).to.be.true
      expect(pin2.state).to.be.true

      pin3.value = false
      expect(trace.state).to.be.false
      expect(pin1.state).to.be.false
      expect(pin2.state).to.be.false

      pin2.mode = OUTPUT
      pin3.value = null // Actually set to false because the other output pin is false
      expect(trace.state).to.false
      expect(pin1.state).to.false
      expect(pin2.state).to.false

      pin2.value = null // Actually get set to null because all output pins are null
      expect(trace.state).to.be.null
      expect(pin1.state).to.be.null
      expect(pin2.state).to.be.null
    })

    it("can be configured to become high when all output pins are hi-z", () => {
      pin1 = createPin(1, "A", INPUT)
      pin2 = createPin(2, "B", INPUT_OUTPUT)
      pin3 = createPin(3, "C", OUTPUT)
      trace = createTrace(pin1, pin2, pin3, PULL_UP)

      pin2.mode = OUTPUT

      pin3.value = HI_Z // Actually set to LOW because the other output pin is LOW
      expect(trace.value).to.equal(LOW)
      expect(pin1.value).to.equal(LOW)
      expect(pin2.value).to.equal(LOW)
      expect(pin3.value).to.equal(HI_Z)

      pin2.value = HI_Z // Actually gets set to HIGH because of PULL_UP
      expect(trace.value).to.equal(HIGH)
      expect(pin1.value).to.equal(HIGH)
      expect(pin2.value).to.equal(HI_Z)
      expect(pin3.value).to.equal(HI_Z)
    })

    it("can be configured to become low when all output pins are hi-z", () => {
      pin1 = createPin(1, "A", INPUT)
      pin2 = createPin(2, "B", INPUT_OUTPUT)
      pin3 = createPin(3, "C", OUTPUT)
      trace = createTrace(pin1, pin2, pin3, PULL_DOWN)

      pin2.mode = OUTPUT

      pin3.value = HI_Z // Actually set to LOW because the other output pin is LOW
      expect(trace.value).to.equal(LOW)
      expect(pin1.value).to.equal(LOW)
      expect(pin2.value).to.equal(LOW)
      expect(pin3.value).to.equal(HI_Z)

      pin2.value = HI_Z // Actually gets set to LOW because of PULL_DOWN
      expect(trace.value).to.equal(LOW)
      expect(pin1.value).to.equal(LOW)
      expect(pin2.value).to.equal(HI_Z)
      expect(pin3.value).to.equal(HI_Z)
    })
  })
})
