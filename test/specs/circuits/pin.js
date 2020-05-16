/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect } from "test/helper"
import sinon from "sinon"

import { createPin, INPUT, OUTPUT, INPUT_OUTPUT } from "circuits/pin"
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

    trace1.state = HIGH
    trace2.state = LOW

    expect(pin.state).to.equal(HIGH)
  })

  describe("direction", () => {
    it("can be set to input, output, or input/output", () => {
      const rdy = createPin(2, "RDY", INPUT, HIGH)
      expect(rdy.input).to.be.true
      expect(rdy.output).to.be.false

      const rw = createPin(38, "R/W", OUTPUT, HIGH)
      expect(rw.input).to.be.false
      expect(rw.output).to.be.true

      const d0 = createPin(37, "D0", INPUT_OUTPUT)
      expect(d0.input).to.be.true
      expect(d0.output).to.be.false
    })
  })

  describe("state", () => {
    it("can be set to HIGH, LOW, or HI_Z at initialization", () => {
      const rdy = createPin(2, "RDY", INPUT, HIGH)
      expect(rdy.state).to.equal(HIGH)
      expect(rdy.value).to.equal(1)
      expect(rdy.high).to.be.true
      expect(rdy.low).to.be.false
      expect(rdy.hiZ).to.be.false

      const a0 = createPin(7, "A0", OUTPUT, LOW)
      expect(a0.state).to.equal(LOW)
      expect(a0.value).to.equal(0)
      expect(a0.high).to.be.false
      expect(a0.low).to.be.true
      expect(a0.hiZ).to.be.false

      const d0 = createPin(37, "D0", INPUT_OUTPUT, HI_Z)
      expect(d0.state).to.equal(HI_Z)
      expect(d0.value).to.be.null
      expect(d0.high).to.be.false
      expect(d0.low).to.be.false
      expect(d0.hiZ).to.be.true
    })

    it("defaults to LOW", () => {
      const d0 = createPin(27, "D0", INPUT_OUTPUT)
      expect(d0.state).to.equal(LOW)
    })

    it("can be set via state", () => {
      const pin = createPin(2, "RDY", INPUT, HIGH)
      expect(pin.state).to.equal(HIGH)

      pin.state = LOW
      expect(pin.state).to.equal(LOW)

      pin.state = HI_Z
      expect(pin.state).to.equal(HI_Z)

      pin.state = HIGH
      expect(pin.state).to.equal(HIGH)
    })

    it("can be set via value", () => {
      const pin = createPin(2, "RDY", INPUT, HIGH)
      expect(pin.state).to.equal(HIGH)

      pin.value = 0
      expect(pin.state).to.equal(LOW)

      pin.value = null
      expect(pin.state).to.equal(HI_Z)

      pin.value = 1
      expect(pin.state).to.equal(HIGH)
    })

    it("will be unchanged when set from setFromTrace with no trace", () => {
      const pin = createPin(1, "A", INPUT, HIGH)
      pin.setFromTrace()
      expect(pin.state).to.equal(HIGH)
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

    it("sets input pin's state to trace's state", () => {
      const pin = createPin(2, "RDY", INPUT)
      const trace = createTrace(pin)

      trace.state = HIGH
      pin.state = LOW
      expect(pin.state).to.equal(HIGH)

      pin.state = HI_Z
      expect(pin.state).to.equal(HIGH)
    })

    it("sets input/output pin's state in input mode to trace's state", () => {
      const pin = createPin(37, "D0", INPUT_OUTPUT)
      pin.mode = INPUT
      const trace = createTrace(pin)

      trace.state = HIGH
      pin.state = LOW
      expect(pin.state).to.equal(HIGH)
    })

    it("sets its trace's state if it is an output pin", () => {
      const pin = createPin(38, "RW", OUTPUT)
      const trace = createTrace(pin)

      pin.state = HIGH
      expect(trace.state).to.equal(HIGH)
    })

    it("sets its trace's state if it is an input/output pin in output mode", () => {
      const pin = createPin(37, "D0", INPUT_OUTPUT)
      pin.mode = OUTPUT
      const trace = createTrace(pin)

      pin.state = HIGH
      expect(trace.state).to.equal(HIGH)
    })

    it("can be changed from HI_Z by a trace's state change", () => {
      const pin = createPin(2, "RDY", INPUT_OUTPUT, HI_Z)
      const trace = createTrace(pin)

      trace.state = HIGH
      expect(pin.state).to.equal(HIGH)
    })
  })

  describe("mode", () => {
    it("changes the mode of an input/output pin", () => {
      const pin = createPin(1, "A", INPUT_OUTPUT)
      expect(pin.mode).to.equal(INPUT) // initializes to INPUT
      pin.mode = OUTPUT
      expect(pin.mode).to.equal(OUTPUT)
    })

    it("does nothing to input or output pins", () => {
      const pin1 = createPin(1, "A", INPUT)
      const pin2 = createPin(2, "B", OUTPUT)

      pin1.mode = OUTPUT
      pin2.mode = INPUT

      expect(pin1.mode).to.equal(INPUT)
      expect(pin2.mode).to.equal(OUTPUT)
    })

    it("does nothing if the value set is neither INPUT nor OUTPUT", () => {
      const pin1 = createPin(1, "A", INPUT_OUTPUT)
      pin1.mode = INPUT_OUTPUT
      expect(pin1.mode).to.equal(INPUT)
      pin1.mode = false
      expect(pin1.mode).to.equal(INPUT)
      pin1.mode = OUTPUT
      expect(pin1.mode).to.equal(OUTPUT)
    })

    it("gives the mode that a pin is currently in", () => {
      expect(createPin(1, "A", INPUT).mode).to.equal(INPUT)
      expect(createPin(2, "B", OUTPUT).mode).to.equal(OUTPUT)

      const pin = createPin(3, "C", INPUT_OUTPUT)
      expect(pin.mode).to.equal(INPUT)
      pin.mode = OUTPUT
      expect(pin.mode).to.equal(OUTPUT)
    })

    it("interacts with the input and output properties", () => {
      const pin1 = createPin(1, "A", INPUT)
      const pin2 = createPin(2, "B", OUTPUT)
      const pin3 = createPin(3, "C", INPUT_OUTPUT)

      expect(pin1.mode).to.equal(INPUT)
      expect(pin1.input).to.be.true
      expect(pin1.output).to.be.false

      expect(pin2.mode).to.equal(OUTPUT)
      expect(pin2.input).to.be.false
      expect(pin2.output).to.be.true

      expect(pin3.mode).to.equal(INPUT)
      expect(pin3.input).to.be.true
      expect(pin3.output).to.be.false
      pin3.mode = OUTPUT
      expect(pin3.input).to.be.false
      expect(pin3.output).to.be.true
    })

    it("retains the same state when switching from input to output mode", () => {
      const pin = createPin(1, "A", INPUT_OUTPUT)
      const trace = createTrace(pin)
      trace.state = HIGH

      expect(pin.state).to.equal(HIGH)
      pin.mode = OUTPUT
      expect(pin.state).to.equal(HIGH)
      expect(trace.state).to.equal(HIGH)
      pin.state = LOW
      expect(trace.state).to.equal(LOW)
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
      pin2 = createPin(37, "D0", INPUT_OUTPUT)
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

    it("does not fire on input/output pins in output mode if their trace's state is set", () => {
      const trace = createTrace(pin1, pin2, pin3)
      pin2.mode = OUTPUT
      trace.state = HIGH
      expect(spy1).to.be.called
      expect(spy2).not.to.be.called
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

    it("will ignore calls to remove listeners that have not been added", () => {
      const trace = createTrace(pin1, pin2, pin3)
      pin1.removeListener(spy2)
      trace.state = HIGH
      expect(spy1).to.be.calledOnce
      expect(spy2).to.be.calledOnce
      expect(spy3).not.to.be.called
    })
  })
})
