/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect } from "test/helper"

import { newConnector } from "components/connector"
import { newPin, INPUT, OUTPUT, BIDIRECTIONAL } from "components/pin"
import { newTrace, PULL_DOWN } from "components/trace"

describe("Connector", () => {
  it("sets an output pin's value to an input's when connecting to it", () => {
    const pin1 = newPin(1, "A", INPUT, 1)
    const pin2 = newPin(1, "B", OUTPUT, 0)

    const con1 = newConnector(pin1)
    const con2 = newConnector(pin2)

    con2.connect(con1)
    expect(pin2.value).to.equal(1)
  })

  it("sets an input pin's value to an output's when it connects", () => {
    const pin1 = newPin(1, "A", INPUT, 1)
    const pin2 = newPin(1, "B", OUTPUT, 0)

    const con1 = newConnector(pin1)
    const con2 = newConnector(pin2)

    con1.connect(con2)
    expect(pin2.value).to.equal(1)
  })

  it("passes value changes from input to output", () => {
    const pin1 = newPin(1, "A", INPUT)
    const pin2 = newPin(1, "B", OUTPUT, 0)

    const trace1 = newTrace(pin1)
    trace1.value = 1
    const trace2 = newTrace(pin2)

    const con1 = newConnector(pin1)
    const con2 = newConnector(pin2)

    con1.connect(con2)
    expect(trace2.value).to.equal(1)

    trace1.value = 0
    expect(trace2.value).to.equal(0)
  })

  it("reverts the output pin's value to null after disconnect", () => {
    const pin1 = newPin(1, "A", INPUT)
    const pin2 = newPin(1, "B", OUTPUT, 0)

    const trace1 = newTrace(pin1)
    const trace2 = newTrace(pin2, PULL_DOWN)

    const con1 = newConnector(pin1)
    const con2 = newConnector(pin2)

    con1.connect(con2)

    trace1.value = 1
    expect(trace2.value).to.equal(1)

    con1.disconnect()
    con2.disconnect() // unnecessary, check to make sure it doesn't do bad things

    expect(trace1.value).to.equal(1) // trace's value overrides that of input pin
    expect(trace2.value).to.equal(0) // because of PULL_DOWN
  })

  it("doesn't do anything if two input pins with traces connect", () => {
    const pin1 = newPin(1, "A", INPUT)
    const pin2 = newPin(1, "A", INPUT)

    const trace1 = newTrace(pin1)
    trace1.value = 1
    const trace2 = newTrace(pin2)
    trace2.value = 0

    const con1 = newConnector(pin1)
    const con2 = newConnector(pin2)

    con1.connect(con2)

    expect(trace1.value).to.equal(1)
    expect(trace2.value).to.equal(0)

    trace1.value = 0
    trace1.value = 1

    expect(trace1.value).to.equal(1)
    expect(trace2.value).to.equal(0)
  })

  it("doesn't do anything if two output pins with traces connect", () => {
    const pin1 = newPin(1, "A", OUTPUT, 1)
    const pin2 = newPin(1, "A", OUTPUT, 0)

    const trace1 = newTrace(pin1)
    const trace2 = newTrace(pin2)

    const con1 = newConnector(pin1)
    const con2 = newConnector(pin2)

    con1.connect(con2)

    expect(trace1.value).to.equal(1)
    expect(trace2.value).to.equal(0)

    pin1.value = 0
    pin1.value = 1

    expect(trace1.value).to.equal(1)
    expect(trace2.value).to.equal(0)
  })

  it("favors the value of the connecting pin when two bidirectional pins connect", () => {
    const pin1 = newPin(1, "A", BIDIRECTIONAL)
    const pin2 = newPin(1, "A", BIDIRECTIONAL)

    const trace1 = newTrace(pin1)
    trace1.value = 1
    const trace2 = newTrace(pin2)
    trace2.value = 0

    const con1 = newConnector(pin1)
    const con2 = newConnector(pin2)

    con1.connect(con2)

    expect(trace2.value).to.equal(1)

    con1.disconnect()

    trace1.value = 1
    trace2.value = 0

    con2.connect(con1)

    expect(trace1.value).to.equal(0)
  })

  it("passes data both ways with two connected bidirectional pins", () => {
    const pin1 = newPin(1, "A", BIDIRECTIONAL)
    const pin2 = newPin(1, "A", BIDIRECTIONAL)

    const trace1 = newTrace(pin1)
    trace1.value = 0
    const trace2 = newTrace(pin2)
    trace2.value = 0

    const con1 = newConnector(pin1)
    const con2 = newConnector(pin2)

    con1.connect(con2)

    trace1.value = 1
    expect(trace2.value).to.equal(1)

    trace2.value = 0
    expect(trace1.value).to.equal(0)
  })

  it("cannot connect to more than one other connector", () => {
    const pin1 = newPin(1, "A", BIDIRECTIONAL)
    const pin2 = newPin(1, "A", BIDIRECTIONAL)
    const pin3 = newPin(1, "A", BIDIRECTIONAL)

    const trace1 = newTrace(pin1)
    trace1.value = 0
    const trace2 = newTrace(pin2)
    trace2.value = 0
    const trace3 = newTrace(pin3)
    trace3.value = 0

    const con1 = newConnector(pin1)
    const con2 = newConnector(pin2)
    const con3 = newConnector(pin3)

    con1.connect(con2)
    con1.connect(con3)
    con2.connect(con3)

    trace1.value = 1
    expect(trace2.value).to.equal(1)
    expect(trace3.value).to.equal(0)
  })
})
