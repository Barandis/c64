// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from 'test/helper'
import { Ic74139 } from 'chips'

const disableMessage = (pin, demux) =>
  `${pin} should be high when _G${demux} is high`
const llMessage = (pin, state, demux) =>
  `${pin} should be ${state} when A${demux} and B${demux} are both low`
const hlMessage = (pin, state, demux) =>
  `${pin} should be ${state} when A${demux} is high and B${demux} is low`
const lhMessage = (pin, state, demux) =>
  `${pin} should be ${state} when A${demux} is low and B${demux} is high`
const hhMessage = (pin, state, demux) =>
  `${pin} should be ${state} when A${demux} and B${demux} are both high`

describe('74139 dual 2-line to 4-line demultiplexer', () => {
  let chip, traces

  beforeEach(() => {
    chip = Ic74139()
    traces = deviceTraces(chip)
  })

  it('pulls all demux 1 outputs high when _G1 is high', () => {
    traces._G1.set()
    traces.A1.clear()
    traces.B1.clear()
    assert(traces._Y10.high, disableMessage('_Y10', 1))
    assert(traces._Y11.high, disableMessage('_Y11', 1))
    assert(traces._Y12.high, disableMessage('_Y12', 1))
    assert(traces._Y13.high, disableMessage('_Y13', 1))

    traces.A1.set()
    assert(traces._Y10.high, disableMessage('_Y10', 1))
    assert(traces._Y11.high, disableMessage('_Y11', 1))
    assert(traces._Y12.high, disableMessage('_Y12', 1))
    assert(traces._Y13.high, disableMessage('_Y13', 1))

    traces.B1.set()
    assert(traces._Y10.high, disableMessage('_Y10', 1))
    assert(traces._Y11.high, disableMessage('_Y11', 1))
    assert(traces._Y12.high, disableMessage('_Y12', 1))
    assert(traces._Y13.high, disableMessage('_Y13', 1))

    traces.A1.clear()
    assert(traces._Y10.high, disableMessage('_Y10', 1))
    assert(traces._Y11.high, disableMessage('_Y11', 1))
    assert(traces._Y12.high, disableMessage('_Y12', 1))
    assert(traces._Y13.high, disableMessage('_Y13', 1))
  })

  it('selects the correct line for L/L in demux 1', () => {
    traces._G1.clear()
    traces.A1.clear()
    traces.B1.clear()
    assert(traces._Y10.low, llMessage('_Y10', 'low', 1))
    assert(traces._Y11.high, llMessage('_Y11', 'high', 1))
    assert(traces._Y12.high, llMessage('_Y12', 'high', 1))
    assert(traces._Y13.high, llMessage('_Y13', 'high', 1))
  })

  it('selects the correct line for H/L in demux 1', () => {
    traces._G1.clear()
    traces.A1.set()
    traces.B1.clear()
    assert(traces._Y10.high, hlMessage('_Y10', 'high', 1))
    assert(traces._Y11.low, hlMessage('_Y11', 'low', 1))
    assert(traces._Y12.high, hlMessage('_Y12', 'high', 1))
    assert(traces._Y13.high, hlMessage('_Y13', 'high', 1))
  })

  it('selects the correct line for L/H in demux 1', () => {
    traces._G1.clear()
    traces.A1.clear()
    traces.B1.set()
    assert(traces._Y10.high, lhMessage('_Y10', 'high', 1))
    assert(traces._Y11.high, lhMessage('_Y11', 'high', 1))
    assert(traces._Y12.low, lhMessage('_Y12', 'low', 1))
    assert(traces._Y13.high, lhMessage('_Y13', 'high', 1))
  })

  it('selects the correct line for H/H in demux 1', () => {
    traces._G1.clear()
    traces.A1.set()
    traces.B1.set()
    assert(traces._Y10.high, hhMessage('_Y10', 'high', 1))
    assert(traces._Y11.high, hhMessage('_Y11', 'high', 1))
    assert(traces._Y12.high, hhMessage('_Y12', 'high', 1))
    assert(traces._Y13.low, hhMessage('_Y13', 'low', 1))
  })

  it('pulls all demux 2 outputs high when _G2 is high', () => {
    traces._G2.set()
    traces.A2.clear()
    traces.B2.clear()
    assert(traces._Y20.high, disableMessage('_Y20', 2))
    assert(traces._Y21.high, disableMessage('_Y21', 2))
    assert(traces._Y22.high, disableMessage('_Y22', 2))
    assert(traces._Y23.high, disableMessage('_Y23', 2))

    traces.A2.set()
    assert(traces._Y20.high, disableMessage('_Y20', 2))
    assert(traces._Y21.high, disableMessage('_Y21', 2))
    assert(traces._Y22.high, disableMessage('_Y22', 2))
    assert(traces._Y23.high, disableMessage('_Y23', 2))

    traces.B2.set()
    assert(traces._Y20.high, disableMessage('_Y20', 2))
    assert(traces._Y21.high, disableMessage('_Y21', 2))
    assert(traces._Y22.high, disableMessage('_Y22', 2))
    assert(traces._Y23.high, disableMessage('_Y23', 2))

    traces.A2.clear()
    assert(traces._Y20.high, disableMessage('_Y20', 2))
    assert(traces._Y21.high, disableMessage('_Y21', 2))
    assert(traces._Y22.high, disableMessage('_Y22', 2))
    assert(traces._Y23.high, disableMessage('_Y23', 2))
  })

  it('selects the correct line for L/L in demux 2', () => {
    traces._G2.clear()
    traces.A2.clear()
    traces.B2.clear()
    assert(traces._Y20.low, llMessage('_Y20', 'low', 2))
    assert(traces._Y21.high, llMessage('_Y21', 'high', 2))
    assert(traces._Y22.high, llMessage('_Y22', 'high', 2))
    assert(traces._Y23.high, llMessage('_Y23', 'high', 2))
  })

  it('selects the correct line for H/L in demux 2', () => {
    traces._G2.clear()
    traces.A2.set()
    traces.B2.clear()
    assert(traces._Y20.high), hlMessage('_Y20', 'high', 2)
    assert(traces._Y21.low, hlMessage('_Y21', 'low', 2))
    assert(traces._Y22.high, hlMessage('_Y22', 'high', 2))
    assert(traces._Y23.high, hlMessage('_Y23', 'high', 2))
  })

  it('selects the correct line for L/H in demux 2', () => {
    traces._G2.clear()
    traces.A2.clear()
    traces.B2.set()
    assert(traces._Y20.high, lhMessage('_Y20', 'high', 2))
    assert(traces._Y21.high, lhMessage('_Y21', 'high', 2))
    assert(traces._Y22.low, lhMessage('_Y22', 'low', 2))
    assert(traces._Y23.high, lhMessage('_Y23', 'high', 2))
  })

  it('selects the correct line for H/H in demux 2', () => {
    traces._G2.clear()
    traces.A2.set()
    traces.B2.set()
    assert(traces._Y20.high, hhMessage('_Y20', 'high', 2))
    assert(traces._Y21.high, hhMessage('_Y21', 'high', 2))
    assert(traces._Y22.high, hhMessage('_Y22', 'high', 2))
    assert(traces._Y23.low, hhMessage('_Y23', 'low', 2))
  })
})
