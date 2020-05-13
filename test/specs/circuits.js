/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect } from "test/helper"
import sinon from "sinon"

import { createPin, IN, OUT, IN_OUT } from "circuits/pin"
import { createTrace } from "circuits/trace"
import { LOW, HIGH, HIGH_Z } from "circuits/state"

describe("Circuit components", () => {
  describe("pin", () => {
    it("has a number and a name", () => {
      const rw = createPin(38, "R/W", OUT, HIGH)
      expect(rw.num).to.equal(38)
      expect(rw.name).to.equal("R/W")
    })

    describe("direction", () => {
      it("can be set to in, out, or in/out", () => {
        const rdy = createPin(2, "RDY", IN, HIGH)
        expect(rdy.in).to.be.true
        expect(rdy.out).to.be.false

        const rw = createPin(38, "R/W", OUT, HIGH)
        expect(rw.in).to.be.false
        expect(rw.out).to.be.true

        const d0 = createPin(37, "D0", IN_OUT)
        expect(d0.in).to.be.true
        expect(d0.out).to.be.true
      })

      it("defaults to in", () => {
        const rdy = createPin(2, "RDY")
        expect(rdy.in).to.be.true
        expect(rdy.out).to.be.false
      })
    })

    describe("state", () => {
      it("can be set to HIGH, LOW, or HIGH_Z", () => {
        const rdy = createPin(2, "RDY", IN, HIGH)
        expect(rdy.state).to.equal(HIGH)
        expect(rdy.high).to.be.true
        expect(rdy.low).to.be.false
        expect(rdy.highZ).to.be.false

        const a0 = createPin(7, "A0", OUT, LOW)
        expect(a0.state).to.equal(LOW)
        expect(a0.high).to.be.false
        expect(a0.low).to.be.true
        expect(a0.highZ).to.be.false

        const d0 = createPin(37, "D0", IN_OUT, HIGH_Z)
        expect(d0.state).to.equal(HIGH_Z)
        expect(d0.high).to.be.false
        expect(d0.low).to.be.false
        expect(d0.highZ).to.be.true
      })

      it("defaults to LOW", () => {
        const d0 = createPin(27, "D0", IN_OUT)
        expect(d0.state).to.equal(LOW)
      })

      it("does not fire listeners if not set from a trace", () => {
        const pin = createPin(2, "RDY", IN, HIGH)
        pin.addListener(() => expect.fail())
        pin.set(LOW)
      })

      it("allows listeners to be removed at any time", () => {
        const spy = sinon.spy()

        const pin = createPin(2, "RDY", IN, HIGH)
        pin.addListener(spy)
        pin.setFromTrace(LOW)
        expect(spy).to.have.been.calledOnce

        pin.removeListener(spy)
        pin.setFromTrace(HIGH)
        expect(spy).to.have.been.calledOnce
      })

      it("can be toggled to the opposite state", () => {
        const pin = createPin(2, "RDY", IN, HIGH)
        pin.toggle()
        expect(pin.low).to.be.true

        pin.toggle()
        expect(pin.high).to.be.true
      })

      it("does not change when toggling a HIGH_Z pin", () => {
        const pin = createPin(2, "RDY", IN, HIGH_Z)
        pin.toggle()
        expect(pin.highZ).to.be.true

        pin.toggle()
        expect(pin.highZ).to.be.true
      })
    })
  })

  describe("trace", () => {
    describe("initial state", () => {
      it("defaults to LOW", () => {
        const trace = createTrace()
        expect(trace.state).to.equal(LOW)
        expect(trace.low).to.be.true
      })

      it("is HIGH if an out pin is HIGH", () => {
        const pin = createPin(38, "R/W", OUT, HIGH)
        const trace = createTrace(pin)
        expect(trace.state).to.equal(HIGH)
        expect(trace.high).to.be.true
      })

      it("is LOW if a HIGH pin is not an out pin", () => {
        const pin = createPin(3, "/IRQ", IN, HIGH)
        const trace = createTrace(pin)
        expect(trace.state).to.equal(LOW)
      })
    })

    it("cannot be set to HIGH_Z", () => {
      const trace = createTrace()
      trace.set(HIGH_Z)
      expect(trace.state).to.equal(LOW)
    })
  })

  describe("pin and trace states", () => {
    let pin1 = null
    let pin2 = null
    let pin3 = null
    let trace = null

    beforeEach(() => {
      pin1 = createPin(2, "RDY", IN, HIGH)
      pin2 = createPin(30, "D7", IN_OUT)
      pin3 = createPin(38, "R/W", OUT, HIGH)
      trace = createTrace(pin1, pin2, pin3)
    })

    it("sets pin states to HIGH if the initial state of trace is HIGH", () => {
      expect(pin2.state).to.equal(HIGH)
    })

    it("sets all pins states when the trace state changes", () => {
      trace.set(LOW)
      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(LOW)
      expect(pin3.state).to.equal(LOW)
    })

    it("fires in pins when the trace state changes", () => {
      const rdy = sinon.spy()
      const d7 = sinon.spy()
      const rw = sinon.spy()

      pin1.addListener(rdy)
      pin2.addListener(d7)
      pin3.addListener(rw)

      trace.set(LOW)

      expect(rdy).to.have.been.called
      expect(d7).to.have.been.called
      expect(rw).not.to.have.been.called
    })

    it("changes the trace state when an out pin changes state", () => {
      pin3.set(LOW)
      expect(trace.state).to.equal(LOW)
      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(LOW)

      pin2.set(HIGH)
      expect(trace.state).to.equal(HIGH)
      expect(pin1.state).to.equal(HIGH)
      expect(pin3.state).to.equal(HIGH)
    })

    it("does not change the trace state when a non-out pin changes state", () => {
      trace.set(LOW)

      pin1.set(HIGH)
      expect(trace.state).to.equal(LOW)
      expect(pin2.state).to.equal(LOW)
      expect(pin3.state).to.equal(LOW)
    })

    it("does not change the trace state when an out pin changes to HIGH_Z", () => {
      trace.set(LOW)

      pin2.set(HIGH_Z)
      expect(trace.state).to.equal(LOW)
      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(HIGH_Z)
      expect(pin3.state).to.equal(LOW)
    })

    it("does not change the state of a pin that was already HIGH_Z", () => {
      pin2.set(HIGH_Z)
      trace.set(LOW)

      expect(pin1.state).to.equal(LOW)
      expect(pin2.state).to.equal(HIGH_Z)
      expect(pin3.state).to.equal(LOW)
    })

    describe("notifications", () => {
      let spy1 = null
      let spy2 = null
      let spy3 = null

      beforeEach(() => {
        spy1 = sinon.spy()
        spy2 = sinon.spy()
        spy3 = sinon.spy()

        pin1.addListener(spy1)
        pin2.addListener(spy2)
        pin3.addListener(spy3)
      })

      it("fires on in pins when an out pin changes state", () => {
        pin3.set(LOW)

        expect(spy1).to.be.called
        expect(spy2).to.be.called
        expect(spy3).not.to.be.called
      })

      it("does not fire on in pins when no change happens", () => {
        pin3.set(HIGH)

        expect(spy1).not.to.be.called
        expect(spy2).not.to.be.called
        expect(spy3).not.to.be.called
      })

      it("does not fire on in/out pins that initiated the state change", () => {
        pin2.set(LOW)

        expect(spy1).to.be.called
        expect(spy2).not.to.be.called
        expect(spy3).not.to.be.called
      })

      it("does not fire pins twice if they were added twice", () => {
        trace = createTrace(pin1, pin2, pin3, pin1)
        trace.set(LOW)

        expect(spy1).to.be.calledOnce
      })
    })
  })
})
