// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from 'test/helper'
import Ic7408 from 'chips/ic-7408'

const llMessage = num => `Y${num} should be low when A${num} and B${num} are both low`
const lhMessage = num => `Y${num} should be low when A${num} is low and B${num} is high`
const hlMessage = num => `Y${num} should be low when A${num} is high and B${num} is low`
const hhMessage = num => `Y${num} should be high when A${num} and B${num} are both high`

describe('7408 quad 2-input AND gate', () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic7408()
    traces = deviceTraces(chip)
  })

  it('properly ANDs on gate 1', () => {
    traces.A1.clear()
    traces.B1.clear()
    assert.isLow(traces.Y1, llMessage(1))

    traces.A1.clear()
    traces.B1.set()
    assert.isLow(traces.Y1, lhMessage(1))

    traces.A1.set()
    traces.B1.clear()
    assert.isLow(traces.Y1, hlMessage(1))

    traces.A1.set()
    traces.B1.set()
    assert.isHigh(traces.Y1, hhMessage(1))
  })

  it('properly ANDs on gate 2', () => {
    traces.A2.clear()
    traces.B2.clear()
    assert.isLow(traces.Y2, llMessage(2))

    traces.A2.clear()
    traces.B2.set()
    assert.isLow(traces.Y2, lhMessage(2))

    traces.A2.set()
    traces.B2.clear()
    assert.isLow(traces.Y2, hlMessage(2))

    traces.A2.set()
    traces.B2.set()
    assert.isHigh(traces.Y2, hhMessage(2))
  })

  it('properly ANDs on gate 3', () => {
    traces.A3.clear()
    traces.B3.clear()
    assert.isLow(traces.Y3, llMessage(3))

    traces.A3.clear()
    traces.B3.set()
    assert.isLow(traces.Y3, lhMessage(3))

    traces.A3.set()
    traces.B3.clear()
    assert.isLow(traces.Y3, hlMessage(3))

    traces.A3.set()
    traces.B3.set()
    assert.isHigh(traces.Y3, hhMessage(3))
  })

  it('properly ANDs on gate 4', () => {
    traces.A4.clear()
    traces.B4.clear()
    assert.isLow(traces.Y4, llMessage(4))

    traces.A4.clear()
    traces.B4.set()
    assert.isLow(traces.Y4, lhMessage(4))

    traces.A4.set()
    traces.B4.clear()
    assert.isLow(traces.Y4, hlMessage(4))

    traces.A4.set()
    traces.B4.set()
    assert.isHigh(traces.Y4, hhMessage(4))
  })
})
