/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect } from "test/helper"

import { createTrace, PULLDOWN, PULLUP } from "circuits/trace"
import { createPin, INPUT, OUTPUT, INPUT_OUTPUT } from "circuits/pin"
import { LOW, HIGH, TRI } from "circuits/state"

describe("Trace", () => {
  describe("initial state", () => {
    it("is low with no output pins", () => {
      const pin = createPin(1, "A")
      const trace = createTrace(pin)
      expect(trace.state).to.equal(LOW)
    })

    it("is high if any connnected output pin is high", () => {
      const pin1 = createPin(1, "A", OUTPUT, LOW)
      const pin2 = createPin(2, "B", OUTPUT, HIGH)
      const trace = createTrace(pin1, pin2)
      expect(trace.state).to.equal(HIGH)
    })

    it("is low if any connected output pin is low and none are high", () => {
      const pin1 = createPin(1, "A", OUTPUT, TRI)
      const pin2 = createPin(2, "B", OUTPUT, LOW)
      const trace = createTrace(pin1, pin2)
      expect(trace.state).to.equal(LOW)
    })

    it("is tri from FLOAT if all connected output pins are tri", () => {
      const pin1 = createPin(1, "A", OUTPUT, TRI)
      const pin2 = createPin(2, "B", OUTPUT, TRI)
      const pin3 = createPin(3, "C", INPUT)
      const trace = createTrace(pin1, pin2, pin3)
      expect(trace.tri).to.be.true
    })

    it("is low if PULLDOWN is specified and all connected output pins are tri", () => {
      const pin1 = createPin(1, "A", OUTPUT, TRI)
      const pin2 = createPin(2, "B", OUTPUT, TRI)
      const pin3 = createPin(3, "C", INPUT)
      const trace = createTrace(pin1, pin2, pin3, PULLDOWN)
      expect(trace.low).to.be.true
    })

    it("is high if PULLUP is specified and all connected output pins are tri", () => {
      const pin1 = createPin(1, "A", OUTPUT, TRI)
      const pin2 = createPin(2, "B", OUTPUT, TRI)
      const pin3 = createPin(3, "C", INPUT)
      const trace = createTrace(pin1, pin2, pin3, PULLUP)
      expect(trace.high).to.be.true
    })
  })

  describe("setting state directly", () => {
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
      trace.state = HIGH
      expect(trace.state).to.equal(HIGH)
      expect(pin1.state).to.equal(HIGH)
      expect(pin2.state).to.equal(HIGH)

      trace.state = LOW
      expect(trace.state).to.equal(LOW)
      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(LOW)

      trace.state = TRI // Actually set to LOW because the output pin is low
      expect(trace.state).to.equal(LOW)
      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(LOW)
    })

    it("can be set the same way by value", () => {
      trace.value = 1
      expect(trace.value).to.equal(1)
      expect(pin1.value).to.equal(1)
      expect(pin2.value).to.equal(1)

      trace.value = 0
      expect(trace.value).to.equal(0)
      expect(pin1.value).to.equal(0)
      expect(pin2.value).to.equal(0)

      trace.value = null // Actually set to 0 because the output pin is 0
      expect(trace.value).to.equal(0)
      expect(pin1.value).to.equal(0)
      expect(pin2.value).to.equal(0)
    })

    it("can be set low or high via an output pin", () => {
      pin3.state = HIGH
      expect(trace.state).to.equal(HIGH)
      expect(pin1.state).to.equal(HIGH)
      expect(pin2.state).to.equal(HIGH)

      pin3.state = LOW
      expect(trace.state).to.equal(LOW)
      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(LOW)

      pin2.mode = OUTPUT
      pin3.state = TRI // Actually set to LOW because the other output pin is LOW
      expect(trace.state).to.equal(LOW)
      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(LOW)

      pin2.state = TRI // Actually gets set to TRI because all output pins are TRI
      expect(trace.state).to.equal(TRI)
      expect(pin1.state).to.equal(TRI)
      expect(pin2.state).to.equal(TRI)
    })

    it("can be set by value via an output pin", () => {
      pin3.value = 1
      expect(trace.value).to.equal(1)
      expect(pin1.value).to.equal(1)
      expect(pin2.value).to.equal(1)

      pin3.value = 0
      expect(trace.value).to.equal(0)
      expect(pin1.value).to.equal(0)
      expect(pin2.value).to.equal(0)

      pin2.mode = OUTPUT
      pin3.value = null // Actually set to 0 because the other output pin is 0
      expect(trace.value).to.equal(0)
      expect(pin1.value).to.equal(0)
      expect(pin2.value).to.equal(0)

      pin2.value = null // Actually get set to null because all output pins are null
      expect(trace.value).to.be.null
      expect(pin1.value).to.be.null
      expect(pin2.value).to.be.null
    })

    it("can be configured to become high when all output pins are tri", () => {
      pin1 = createPin(1, "A", INPUT)
      pin2 = createPin(2, "B", INPUT_OUTPUT)
      pin3 = createPin(3, "C", OUTPUT)
      trace = createTrace(pin1, pin2, pin3, PULLUP)

      pin2.mode = OUTPUT

      pin3.state = TRI // Actually set to LOW because the other output pin is LOW
      expect(trace.state).to.equal(LOW)
      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(LOW)
      expect(pin3.state).to.equal(TRI)

      pin2.state = TRI // Actually gets set to HIGH because of PULLUP
      expect(trace.state).to.equal(HIGH)
      expect(pin1.state).to.equal(HIGH)
      expect(pin2.state).to.equal(TRI)
      expect(pin3.state).to.equal(TRI)
    })

    it("can be configured to become low when all output pins are tri", () => {
      pin1 = createPin(1, "A", INPUT)
      pin2 = createPin(2, "B", INPUT_OUTPUT)
      pin3 = createPin(3, "C", OUTPUT)
      trace = createTrace(pin1, pin2, pin3, PULLDOWN)

      pin2.mode = OUTPUT

      pin3.state = TRI // Actually set to LOW because the other output pin is LOW
      expect(trace.state).to.equal(LOW)
      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(LOW)
      expect(pin3.state).to.equal(TRI)

      pin2.state = TRI // Actually gets set to LOW because of PULLDOWN
      expect(trace.state).to.equal(LOW)
      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(TRI)
      expect(pin3.state).to.equal(TRI)
    })
  })
})
