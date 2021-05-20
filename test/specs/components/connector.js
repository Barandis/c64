// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import Connector from 'components/connector'
import Pin from 'components/pin'
import Trace from 'components/trace'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT
const BIDIRECTIONAL = Pin.BIDIRECTIONAL

describe('Connector', () => {
  it("sets an output pin's level to an input's when connecting to it", () => {
    const pin1 = new Pin(1, 'A', INPUT)
    const pin2 = new Pin(1, 'B', OUTPUT)
    pin1.level = 1

    const con1 = new Connector(pin1)
    const con2 = new Connector(pin2)

    con2.connect(con1)
    assert(pin2.high)
  })

  it("sets an input pin's level to an output's when it connects", () => {
    const pin1 = new Pin(1, 'A', INPUT)
    const pin2 = new Pin(1, 'B', OUTPUT)
    pin1.level = 1

    const con1 = new Connector(pin1)
    const con2 = new Connector(pin2)

    con1.connect(con2)
    assert(pin2.high)
  })

  it('passes level changes from input to output', () => {
    const pin1 = new Pin(1, 'A', INPUT)
    const pin2 = new Pin(1, 'B', OUTPUT, 0)

    const trace1 = new Trace(pin1)
    trace1.level = 1
    const trace2 = new Trace(pin2)

    const con1 = new Connector(pin1)
    const con2 = new Connector(pin2)

    con1.connect(con2)
    assert(trace2.high)

    trace1.level = 0
    assert(trace2.low)
  })

  it("reverts the output pin's level to null after disconnect", () => {
    const pin1 = new Pin(1, 'A', INPUT)
    const pin2 = new Pin(1, 'B', OUTPUT, 0)

    const trace1 = new Trace(pin1)
    const trace2 = new Trace(pin2).pullDown()

    const con1 = new Connector(pin1)
    const con2 = new Connector(pin2)

    con1.connect(con2)

    trace1.level = 1
    assert(trace2.high)

    con1.disconnect()
    con2.disconnect() // unnecessary, check for errors

    assert(trace1.high) // trace overrides input pin
    assert(trace2.low) // because of PULL_DOWN
  })

  it("doesn't do anything if two input pins with traces connect", () => {
    const pin1 = new Pin(1, 'A', INPUT)
    const pin2 = new Pin(1, 'A', INPUT)

    const trace1 = new Trace(pin1)
    trace1.level = 1
    const trace2 = new Trace(pin2)
    trace2.level = 0

    const con1 = new Connector(pin1)
    const con2 = new Connector(pin2)

    con1.connect(con2)

    assert(trace1.high)
    assert(trace2.low)

    trace1.level = 0
    trace1.level = 1

    assert(trace1.high)
    assert(trace2.low)
  })

  it("doesn't do anything if two output pins with traces connect", () => {
    const pin1 = new Pin(1, 'A', OUTPUT)
    const pin2 = new Pin(1, 'A', OUTPUT)
    pin1.level = 1
    pin2.level = 0

    const trace1 = new Trace(pin1)
    const trace2 = new Trace(pin2)

    const con1 = new Connector(pin1)
    const con2 = new Connector(pin2)

    con1.connect(con2)

    assert(trace1.high)
    assert(trace2.low)

    pin1.level = 0
    pin1.level = 1

    assert(trace1.high)
    assert(trace2.low)
  })

  it('favors the connecting pin when two bidi pins connect', () => {
    const pin1 = new Pin(1, 'A', BIDIRECTIONAL)
    const pin2 = new Pin(1, 'A', BIDIRECTIONAL)

    const trace1 = new Trace(pin1)
    trace1.level = 1
    const trace2 = new Trace(pin2)
    trace2.level = 0

    const con1 = new Connector(pin1)
    const con2 = new Connector(pin2)

    con1.connect(con2)

    assert(trace2.high)

    con1.disconnect()

    trace1.level = 1
    trace2.level = 0

    con2.connect(con1)

    assert(trace1.low)
  })

  it('passes data both ways with two connected bidirectional pins', () => {
    const pin1 = new Pin(1, 'A', BIDIRECTIONAL)
    const pin2 = new Pin(1, 'A', BIDIRECTIONAL)

    const trace1 = new Trace(pin1)
    trace1.level = 0
    const trace2 = new Trace(pin2)
    trace2.level = 0

    const con1 = new Connector(pin1)
    const con2 = new Connector(pin2)

    con1.connect(con2)

    trace1.level = 1
    assert(trace2.high)

    trace2.level = 0
    assert(trace1.low)
  })

  it('cannot connect to more than one other connector', () => {
    const pin1 = new Pin(1, 'A', BIDIRECTIONAL)
    const pin2 = new Pin(1, 'A', BIDIRECTIONAL)
    const pin3 = new Pin(1, 'A', BIDIRECTIONAL)

    const trace1 = new Trace(pin1)
    trace1.level = 0
    const trace2 = new Trace(pin2)
    trace2.level = 0
    const trace3 = new Trace(pin3)
    trace3.level = 0

    const con1 = new Connector(pin1)
    const con2 = new Connector(pin2)
    const con3 = new Connector(pin3)

    con1.connect(con2)
    con1.connect(con3)
    con2.connect(con3)

    trace1.level = 1
    assert(trace2.high)
    assert(trace3.low)
  })
})
