/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect } from "test/helper"
import sinon from "sinon"

import { createPin, INPUT, OUTPUT, BIDIRECTIONAL } from "circuits/pin"
import { createTrace } from "circuits/trace"
import { LOW, HIGH, TRI } from "circuits/state"

describe("Pin", () => {
  it("has a number and a name", () => {
    const rw = createPin(38, "R/W", OUTPUT, HIGH)
    expect(rw.num).to.equal(38)
    expect(rw.name).to.equal("R/W")
  })

  describe("direction", () => {
    it("can be set to input, output, or bidirectional", () => {
      const rdy = createPin(2, "RDY", INPUT, HIGH)
      expect(rdy.input).to.be.true
      expect(rdy.output).to.be.false

      const rw = createPin(38, "R/W", OUTPUT, HIGH)
      expect(rw.input).to.be.false
      expect(rw.output).to.be.true

      const d0 = createPin(37, "D0", BIDIRECTIONAL)
      expect(d0.input).to.be.true
      expect(d0.output).to.be.true
    })

    it("defaults to input", () => {
      const rdy = createPin(2, "RDY")
      expect(rdy.input).to.be.true
      expect(rdy.output).to.be.false
    })
  })

  describe("state", () => {
    it("can be set to HIGH, LOW, or TRI at initialization", () => {
      const rdy = createPin(2, "RDY", INPUT, HIGH)
      expect(rdy.state).to.equal(HIGH)
      expect(rdy.value).to.equal(1)
      expect(rdy.high).to.be.true
      expect(rdy.low).to.be.false
      expect(rdy.tri).to.be.false

      const a0 = createPin(7, "A0", OUTPUT, LOW)
      expect(a0.state).to.equal(LOW)
      expect(a0.value).to.equal(0)
      expect(a0.high).to.be.false
      expect(a0.low).to.be.true
      expect(a0.tri).to.be.false

      const d0 = createPin(37, "D0", BIDIRECTIONAL, TRI)
      expect(d0.state).to.equal(TRI)
      expect(d0.value).to.be.null
      expect(d0.high).to.be.false
      expect(d0.low).to.be.false
      expect(d0.tri).to.be.true
    })

    it("defaults to LOW", () => {
      const d0 = createPin(27, "D0", BIDIRECTIONAL)
      expect(d0.state).to.equal(LOW)
    })

    it("can be set via state", () => {
      const pin = createPin(2, "RDY", INPUT, HIGH)
      expect(pin.state).to.equal(HIGH)

      pin.state = LOW
      expect(pin.state).to.equal(LOW)

      pin.state = TRI
      expect(pin.state).to.equal(TRI)

      pin.state = HIGH
      expect(pin.state).to.equal(HIGH)
    })

    it("can be set via value", () => {
      const pin = createPin(2, "RDY", INPUT, HIGH)
      expect(pin.state).to.equal(HIGH)

      pin.value = 0
      expect(pin.state).to.equal(LOW)

      pin.value = null
      expect(pin.state).to.equal(TRI)

      pin.value = 1
      expect(pin.state).to.equal(HIGH)
    })

    it("can be toggled to the opposite state", () => {
      const pin = createPin(2, "RDY", INPUT, HIGH)
      pin.toggle()
      expect(pin.low).to.be.true

      pin.toggle()
      expect(pin.high).to.be.true
    })

    it("does not change when toggling an TRI pin", () => {
      const pin = createPin(2, "RDY", INPUT, TRI)
      pin.toggle()
      expect(pin.tri).to.be.true

      pin.toggle()
      expect(pin.tri).to.be.true
    })

    it("sets input pin's state to trace's state", () => {
      const pin = createPin(2, "RDY")
      const trace = createTrace(pin)

      trace.state = HIGH
      pin.state = LOW
      expect(pin.state).to.equal(HIGH)

      pin.state = TRI
      expect(pin.state).to.equal(HIGH)
    })

    it("sets its trace's state if it is an output pin", () => {
      const pin = createPin(37, "D0", BIDIRECTIONAL)
      const trace = createTrace(pin)

      pin.state = HIGH
      expect(trace.state).to.equal(HIGH)
    })

    it("can be changed from TRI by a trace's state change", () => {
      const pin = createPin(2, "RDY", BIDIRECTIONAL, TRI)
      const trace = createTrace(pin)

      trace.state = HIGH
      expect(pin.state).to.equal(HIGH)
    })
  })

  describe("notifications", () => {
    let pin1
    let pin2
    let pin3
    let spy1
    let spy2
    let spy3

    beforeEach(() => {
      pin1 = createPin(2, "RDY")
      pin2 = createPin(37, "D0", BIDIRECTIONAL)
      pin3 = createPin(38, "R/W", OUTPUT)

      spy1 = sinon.spy()
      spy2 = sinon.spy()
      spy3 = sinon.spy()

      pin1.addListener(spy1)
      pin2.addListener(spy2)
      pin3.addListener(spy3)
    })

    it("does not fire if state is set", () => {
      pin2.state = HIGH
      pin3.state = HIGH
      expect(spy2).not.to.be.called
      expect(spy3).not.to.be.called
    })

    it("does not fire if value is set", () => {
      pin2.value = 1
      pin3.value = 1
      expect(spy2).not.to.be.called
      expect(spy3).not.to.be.called
    })

    it("fires on input pins if their trace's state is set", () => {
      const trace = createTrace(pin1, pin2, pin3)
      trace.state = HIGH
      expect(spy1).to.be.called
      expect(spy2).to.be.called
      expect(spy3).not.to.be.called
    })

    it("does not fire if the trace's state is set to what it was", () => {
      const trace = createTrace(pin1, pin2, pin3)
      trace.state = LOW
      expect(spy1).not.to.be.called
      expect(spy2).not.to.be.called
      expect(spy3).not.to.be.called
    })

    it("fires only once even if the pin has been connected to the trace more than once", () => {
      const trace = createTrace(pin1, pin2, pin3, pin1)
      trace.state = HIGH
      expect(spy1).to.be.calledOnce
      expect(spy2).to.be.calledOnce
      expect(spy3).not.to.be.called
    })

    it("ceases to fire after the listener has been removed", () => {
      const trace = createTrace(pin1, pin2, pin3, pin1)
      trace.state = HIGH
      expect(spy1).to.be.calledOnce

      pin1.removeListener(spy1)
      trace.state = LOW
      expect(spy1).to.be.calledOnce
    })
  })
})
