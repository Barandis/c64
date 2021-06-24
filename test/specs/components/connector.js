// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import Connector from 'components/connector'
import Pin from 'components/pin'
import Trace from 'components/trace'

const { INPUT, OUTPUT, BIDIRECTIONAL } = Pin

describe('Connector', () => {
  it("sets an output pin's level to an input's when connecting to it", () => {
    const pin1 = Pin(1, 'A', INPUT)
    const pin2 = Pin(1, 'B', OUTPUT)
    pin1.level = 1

    const con1 = Connector(pin1)
    const con2 = Connector(pin2)

    con2.connect(con1)
    assert.isHigh(pin2)
  })

  it("sets an input pin's level to an output's when it connects", () => {
    const pin1 = Pin(1, 'A', INPUT)
    const pin2 = Pin(1, 'B', OUTPUT)
    pin1.level = 1

    const con1 = Connector(pin1)
    const con2 = Connector(pin2)

    con1.connect(con2)
    assert.isHigh(pin2)
  })

  it('passes level changes from input to output', () => {
    const pin1 = Pin(1, 'A', INPUT)
    const pin2 = Pin(1, 'B', OUTPUT).clear()

    const trace1 = Trace(pin1)
    trace1.level = 1
    const trace2 = Trace(pin2)

    const con1 = Connector(pin1)
    const con2 = Connector(pin2)

    con1.connect(con2)
    assert.isHigh(trace2)

    trace1.level = 0
    assert.isLow(trace2)
  })

  it("reverts the output pin's level to null after disconnect", () => {
    const pin1 = Pin(1, 'A', INPUT)
    const pin2 = Pin(1, 'B', OUTPUT).clear()

    const trace1 = Trace(pin1)
    const trace2 = Trace(pin2).pullDown()

    const con1 = Connector(pin1)
    const con2 = Connector(pin2)

    con1.connect(con2)

    trace1.level = 1
    assert.isHigh(trace2)

    con1.disconnect()
    con2.disconnect() // unnecessary, check for errors

    assert.isHigh(trace1) // trace overrides input pin
    assert.isLow(trace2) // because of PULL_DOWN
  })

  it("doesn't do anything if two input pins with traces connect", () => {
    const pin1 = Pin(1, 'A', INPUT)
    const pin2 = Pin(1, 'A', INPUT)

    const trace1 = Trace(pin1)
    trace1.level = 1
    const trace2 = Trace(pin2)
    trace2.level = 0

    const con1 = Connector(pin1)
    const con2 = Connector(pin2)

    con1.connect(con2)

    assert.isHigh(trace1)
    assert.isLow(trace2)

    trace1.level = 0
    trace1.level = 1

    assert.isHigh(trace1)
    assert.isLow(trace2)
  })

  it("doesn't do anything if two output pins with traces connect", () => {
    const pin1 = Pin(1, 'A', OUTPUT).set()
    const pin2 = Pin(1, 'A', OUTPUT).clear()

    const trace1 = Trace(pin1)
    const trace2 = Trace(pin2)

    const con1 = Connector(pin1)
    const con2 = Connector(pin2)

    con1.connect(con2)

    assert.isHigh(trace1)
    assert.isLow(trace2)

    pin1.level = 0
    pin1.level = 1

    assert.isHigh(trace1)
    assert.isLow(trace2)
  })

  it('favors the connecting pin when two bidi pins connect', () => {
    const pin1 = Pin(1, 'A', BIDIRECTIONAL)
    const pin2 = Pin(1, 'A', BIDIRECTIONAL)

    const trace1 = Trace(pin1)
    trace1.level = 1
    const trace2 = Trace(pin2)
    trace2.level = 0

    const con1 = Connector(pin1)
    const con2 = Connector(pin2)

    con1.connect(con2)

    assert.isHigh(trace2)

    con1.disconnect()

    trace1.level = 1
    trace2.level = 0

    con2.connect(con1)

    assert.isLow(trace1)
  })

  it('passes data both ways with two connected bidirectional pins', () => {
    const pin1 = Pin(1, 'A', BIDIRECTIONAL)
    const pin2 = Pin(1, 'A', BIDIRECTIONAL)

    const trace1 = Trace(pin1)
    trace1.level = 0
    const trace2 = Trace(pin2)
    trace2.level = 0

    const con1 = Connector(pin1)
    const con2 = Connector(pin2)

    con1.connect(con2)

    trace1.level = 1
    assert.isHigh(trace2)

    trace2.level = 0
    assert.isLow(trace1)
  })

  it('cannot connect to more than one other connector', () => {
    const pin1 = Pin(1, 'A', BIDIRECTIONAL)
    const pin2 = Pin(1, 'A', BIDIRECTIONAL)
    const pin3 = Pin(1, 'A', BIDIRECTIONAL)

    const trace1 = Trace(pin1)
    trace1.level = 0
    const trace2 = Trace(pin2)
    trace2.level = 0
    const trace3 = Trace(pin3)
    trace3.level = 0

    const con1 = Connector(pin1)
    const con2 = Connector(pin2)
    const con3 = Connector(pin3)

    con1.connect(con2)
    con1.connect(con3)
    con2.connect(con3)

    trace1.level = 1
    assert.isHigh(trace2)
    assert.isLow(trace3)
  })
})
