// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from 'test/helper'
import { Ic7408 } from 'chips'

const llMessage = num =>
  `Y${num} should be low when A${num} and B${num} are both low`
const lhMessage = num =>
  `Y${num} should be low when A${num} is low and B${num} is high`
const hlMessage = num =>
  `Y${num} should be low when A${num} is high and B${num} is low`
const hhMessage = num =>
  `Y${num} should be high when A${num} and B${num} are both high`

describe('7408 quad 2-input AND gate', () => {
  let chip, traces

  beforeEach(() => {
    chip = Ic7408()
    traces = deviceTraces(chip)
  })

  it('properly ANDs on gate 1', () => {
    traces.A1.clear()
    traces.B1.clear()
    assert(traces.Y1.low, llMessage(1))

    traces.A1.clear()
    traces.B1.set()
    assert(traces.Y1.low, lhMessage(1))

    traces.A1.set()
    traces.B1.clear()
    assert(traces.Y1.low, hlMessage(1))

    traces.A1.set()
    traces.B1.set()
    assert(traces.Y1.high, hhMessage(1))
  })

  it('properly ANDs on gate 2', () => {
    traces.A2.clear()
    traces.B2.clear()
    assert(traces.Y2.low, llMessage(2))

    traces.A2.clear()
    traces.B2.set()
    assert(traces.Y2.low, lhMessage(2))

    traces.A2.set()
    traces.B2.clear()
    assert(traces.Y2.low, hlMessage(2))

    traces.A2.set()
    traces.B2.set()
    assert(traces.Y2.high, hhMessage(2))
  })

  it('properly ANDs on gate 3', () => {
    traces.A3.clear()
    traces.B3.clear()
    assert(traces.Y3.low, llMessage(3))

    traces.A3.clear()
    traces.B3.set()
    assert(traces.Y3.low, lhMessage(3))

    traces.A3.set()
    traces.B3.clear()
    assert(traces.Y3.low, hlMessage(3))

    traces.A3.set()
    traces.B3.set()
    assert(traces.Y3.high, hhMessage(3))
  })

  it('properly ANDs on gate 4', () => {
    traces.A4.clear()
    traces.B4.clear()
    assert(traces.Y4.low, llMessage(4))

    traces.A4.clear()
    traces.B4.set()
    assert(traces.Y4.low, lhMessage(4))

    traces.A4.set()
    traces.B4.clear()
    assert(traces.Y4.low, hlMessage(4))

    traces.A4.set()
    traces.B4.set()
    assert(traces.Y4.high, hhMessage(4))
  })
})
