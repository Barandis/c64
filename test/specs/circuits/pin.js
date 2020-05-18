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
import { LOW, HIGH, HI_Z } from "circuits/state"

describe("Pin", () => {
  it("has a number and a name", () => {
    const rw = createPin(38, "R/W", OUTPUT, HIGH)
    expect(rw.num).to.equal(38)
    expect(rw.name).to.equal("R/W")
  })

  it("will only be attached to the first trace that refers to it", () => {
    const pin = createPin(1, "A", INPUT)
    const trace1 = createTrace(pin)
    const trace2 = createTrace(pin)

    trace1.value = HIGH
    trace2.value = LOW

    expect(pin.value).to.equal(HIGH)
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
  })

  describe("state", () => {
    it("can be set to HIGH, LOW, or HI_Z at initialization", () => {
      const rdy = createPin(2, "RDY", INPUT, HIGH)
      expect(rdy.value).to.equal(HIGH)
      expect(rdy.high).to.be.true
      expect(rdy.low).to.be.false
      expect(rdy.hiZ).to.be.false

      const a0 = createPin(7, "A0", OUTPUT, LOW)
      expect(a0.value).to.equal(LOW)
      expect(a0.high).to.be.false
      expect(a0.low).to.be.true
      expect(a0.hiZ).to.be.false

      const d0 = createPin(37, "D0", BIDIRECTIONAL, HI_Z)
      expect(d0.value).to.equal(HI_Z)
      expect(d0.high).to.be.false
      expect(d0.low).to.be.false
      expect(d0.hiZ).to.be.true
    })

    it("defaults to LOW", () => {
      const d0 = createPin(27, "D0", BIDIRECTIONAL)
      expect(d0.value).to.equal(LOW)
    })

    it("can be set with a numeric value", () => {
      const pin1 = createPin(1, "A", INPUT, HIGH)
      const pin2 = createPin(2, "B", BIDIRECTIONAL, HIGH)
      expect(pin1.value).to.equal(HIGH)
      expect(pin2.value).to.equal(HIGH)

      pin1.value = LOW
      pin2.value = LOW
      expect(pin1.value).to.equal(0)
      expect(pin2.value).to.equal(0)

      pin1.value = HI_Z
      pin2.value = HI_Z
      expect(pin1.value).to.be.null
      expect(pin2.value).to.be.null

      pin1.value = HIGH
      pin2.value = HIGH
      expect(pin1.value).to.equal(1)
      expect(pin2.value).to.equal(1)
    })

    it("can be set with a boolean value", () => {
      const pin1 = createPin(1, "A", INPUT, true)
      const pin2 = createPin(2, "B", BIDIRECTIONAL, true)
      expect(pin1.value).to.equal(HIGH)
      expect(pin2.value).to.equal(HIGH)

      pin1.state = false
      pin2.state = false
      expect(pin1.state).to.be.false
      expect(pin2.state).to.be.false

      pin1.state = null
      pin2.state = null
      expect(pin1.state).to.be.null
      expect(pin2.state).to.be.null

      pin1.state = true
      pin2.state = true
      expect(pin1.state).to.be.true
      expect(pin2.state).to.be.true
    })

    it("will be unchanged when set from setFromTrace with no trace", () => {
      const pin = createPin(1, "A", INPUT, HIGH)
      pin.setFromTrace()
      expect(pin.value).to.equal(HIGH)
    })

    it("can be toggled to the opposite state", () => {
      const pin = createPin(2, "RDY", INPUT, HIGH)
      pin.toggle()
      expect(pin.low).to.be.true

      pin.toggle()
      expect(pin.high).to.be.true
    })

    it("does not change when toggling an HI_Z pin", () => {
      const pin = createPin(2, "RDY", INPUT, HI_Z)
      pin.toggle()
      expect(pin.hiZ).to.be.true

      pin.toggle()
      expect(pin.hiZ).to.be.true
    })

    it("sets input pin's value to trace's value", () => {
      const pin = createPin(2, "RDY", INPUT)
      const trace = createTrace(pin)

      trace.value = HIGH
      pin.value = LOW
      expect(pin.value).to.equal(HIGH)

      pin.value = HI_Z
      expect(pin.value).to.equal(HIGH)
    })

    it("sets bidirectional pin's value to its trace's value when it changes", () => {
      const pin = createPin(37, "D0", BIDIRECTIONAL)
      const trace = createTrace(pin)

      trace.value = HIGH
      expect(pin.value).to.equal(HIGH)
    })

    it("sets its trace's value if it is an bidirectional pin set directly", () => {
      const pin = createPin(38, "RW", BIDIRECTIONAL)
      const trace = createTrace(pin)

      pin.value = HIGH
      expect(trace.value).to.equal(HIGH)
    })

    it("sets its trace's value if it is an output pin", () => {
      const pin = createPin(38, "RW", OUTPUT)
      const trace = createTrace(pin)

      pin.value = HIGH
      expect(trace.value).to.equal(HIGH)
    })

    it("can be changed from HI_Z by a trace's value change", () => {
      const pin = createPin(2, "RDY", BIDIRECTIONAL, HI_Z)
      const trace = createTrace(pin)

      trace.value = HIGH
      expect(pin.value).to.equal(HIGH)
    })
  })

  describe("mode", () => {
    it("changes the mode of a bidirectional pin", () => {
      const pin = createPin(1, "A", BIDIRECTIONAL)
      expect(pin.mode).to.equal(BIDIRECTIONAL)
      expect(pin.input).to.be.true
      expect(pin.output).to.be.true

      pin.mode = OUTPUT
      expect(pin.mode).to.equal(OUTPUT)
      expect(pin.input).to.be.false
      expect(pin.output).to.be.true
    })

    it("changes the modes of input or output pins", () => {
      const pin1 = createPin(1, "A", INPUT)
      const pin2 = createPin(2, "B", OUTPUT)

      pin1.mode = OUTPUT
      pin2.mode = INPUT

      expect(pin1.mode).to.equal(OUTPUT)
      expect(pin2.mode).to.equal(INPUT)
    })

    it("does nothing if the value set is neither INPUT nor OUTPUT", () => {
      const pin1 = createPin(1, "A", INPUT)
      pin1.mode = false
      expect(pin1.mode).to.equal(INPUT)
      pin1.mode = OUTPUT
      expect(pin1.mode).to.equal(OUTPUT)
    })

    it("gives the mode that a pin is currently in", () => {
      expect(createPin(1, "A", INPUT).mode).to.equal(INPUT)
      expect(createPin(2, "B", OUTPUT).mode).to.equal(OUTPUT)

      const pin = createPin(3, "C", BIDIRECTIONAL)
      expect(pin.mode).to.equal(BIDIRECTIONAL)
      pin.mode = INPUT
      expect(pin.mode).to.equal(INPUT)
      pin.mode = OUTPUT
      expect(pin.mode).to.equal(OUTPUT)
    })

    it("interacts with the input and output properties", () => {
      const pin1 = createPin(1, "A", INPUT)
      const pin2 = createPin(2, "B", OUTPUT)
      const pin3 = createPin(3, "C", BIDIRECTIONAL)

      expect(pin1.mode).to.equal(INPUT)
      expect(pin1.input).to.be.true
      expect(pin1.output).to.be.false

      expect(pin2.mode).to.equal(OUTPUT)
      expect(pin2.input).to.be.false
      expect(pin2.output).to.be.true

      expect(pin3.mode).to.equal(BIDIRECTIONAL)
      expect(pin3.input).to.be.true
      expect(pin3.output).to.be.true
      pin3.mode = OUTPUT
      expect(pin3.input).to.be.false
      expect(pin3.output).to.be.true
    })

    it("retains the same value when switching modes", () => {
      const pin = createPin(1, "A", BIDIRECTIONAL)
      const trace = createTrace(pin)
      trace.value = HIGH

      expect(pin.value).to.equal(HIGH)
      pin.mode = OUTPUT
      expect(pin.value).to.equal(HIGH)
      expect(trace.value).to.equal(HIGH)
      pin.value = LOW
      expect(trace.value).to.equal(LOW)
    })
  })

  describe("reset", () => {
    it("sets the trace to the value of the pin if it's not an input pin", () => {
      const pin1 = createPin(1, "A", OUTPUT, LOW)
      const pin2 = createPin(2, "B", BIDIRECTIONAL, HIGH)
      const trace = createTrace(pin1, pin2)
      expect(trace.value).to.equal(HIGH)
      pin1.reset()
      expect(trace.value).to.equal(LOW)
    })

    it("forces the trace to recalculate its value if the pin is an input pin", () => {
      const pin1 = createPin(1, "A", OUTPUT, LOW)
      const pin2 = createPin(2, "B", BIDIRECTIONAL, HIGH)
      const trace = createTrace(pin1, pin2)
      expect(trace.value).to.equal(HIGH)
      pin2.mode = INPUT
      pin2.reset()
      expect(trace.value).to.equal(LOW) // because pin2 is no longer output and pin1 is low
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
      pin1 = createPin(2, "RDY", INPUT)
      pin2 = createPin(37, "D0", BIDIRECTIONAL)
      pin3 = createPin(38, "R/W", OUTPUT)

      spy1 = sinon.spy()
      spy2 = sinon.spy()
      spy3 = sinon.spy()

      pin1.addListener(spy1)
      pin2.addListener(spy2)
      pin3.addListener(spy3)
    })

    it("does not fire if value is set", () => {
      pin2.value = HIGH
      pin3.value = HIGH
      expect(spy2).not.to.be.called
      expect(spy3).not.to.be.called
    })

    it("fires on input pins if their trace's value is set", () => {
      const trace = createTrace(pin1, pin2, pin3)
      trace.value = HIGH
      expect(spy1).to.be.called
      expect(spy2).to.be.called
      expect(spy3).not.to.be.called
    })

    it("does not fire if the trace's value is set to what it was", () => {
      const trace = createTrace(pin1, pin2, pin3)
      trace.value = LOW
      expect(spy1).not.to.be.called
      expect(spy2).not.to.be.called
      expect(spy3).not.to.be.called
    })

    it("fires only once even if the pin has been connected to the trace more than once", () => {
      const trace = createTrace(pin1, pin2, pin3, pin1)
      trace.value = HIGH
      expect(spy1).to.be.calledOnce
      expect(spy2).to.be.calledOnce
      expect(spy3).not.to.be.called
    })

    it("fires only once even if the same listener has been added more than once", () => {
      const trace = createTrace(pin1, pin2, pin3)
      pin1.addListener(spy1)
      trace.value = HIGH
      expect(spy1).to.be.calledOnce
      expect(spy2).to.be.calledOnce
      expect(spy3).not.to.be.called
    })

    it("ceases to fire after the listener has been removed", () => {
      const trace = createTrace(pin1, pin2, pin3)
      trace.value = HIGH
      expect(spy1).to.be.calledOnce

      pin1.removeListener(spy1)
      trace.value = LOW
      expect(spy1).to.be.calledOnce
    })

    it("will ignore calls to remove listeners that have not been added", () => {
      const trace = createTrace(pin1, pin2, pin3)
      pin1.removeListener(spy2)
      trace.value = HIGH
      expect(spy1).to.be.calledOnce
      expect(spy2).to.be.calledOnce
      expect(spy3).not.to.be.called
    })
  })
})
