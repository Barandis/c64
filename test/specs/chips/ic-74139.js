// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from 'test/helper'
import { Ic74139 } from 'chips'

const disableMessage = (pin, demux) => `${pin} should be high when _G${demux} is high`
const llMessage = (pin, state, demux) =>
  `${pin} should be ${state} when A${demux} and B${demux} are both low`
const hlMessage = (pin, state, demux) =>
  `${pin} should be ${state} when A${demux} is high and B${demux} is low`
const lhMessage = (pin, state, demux) =>
  `${pin} should be ${state} when A${demux} is low and B${demux} is high`
const hhMessage = (pin, state, demux) =>
  `${pin} should be ${state} when A${demux} and B${demux} are both high`

describe('74139 dual 2-line to 4-line demultiplexer', () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic74139()
    traces = deviceTraces(chip)
  })

  it('pulls all demux 1 outputs high when G1 is high', () => {
    traces.G1.set()
    traces.A1.clear()
    traces.B1.clear()
    assert.isHigh(traces.Y10, disableMessage('Y10', 1))
    assert.isHigh(traces.Y11, disableMessage('Y11', 1))
    assert.isHigh(traces.Y12, disableMessage('Y12', 1))
    assert.isHigh(traces.Y13, disableMessage('Y13', 1))

    traces.A1.set()
    assert.isHigh(traces.Y10, disableMessage('Y10', 1))
    assert.isHigh(traces.Y11, disableMessage('Y11', 1))
    assert.isHigh(traces.Y12, disableMessage('Y12', 1))
    assert.isHigh(traces.Y13, disableMessage('Y13', 1))

    traces.B1.set()
    assert.isHigh(traces.Y10, disableMessage('Y10', 1))
    assert.isHigh(traces.Y11, disableMessage('Y11', 1))
    assert.isHigh(traces.Y12, disableMessage('Y12', 1))
    assert.isHigh(traces.Y13, disableMessage('Y13', 1))

    traces.A1.clear()
    assert.isHigh(traces.Y10, disableMessage('Y10', 1))
    assert.isHigh(traces.Y11, disableMessage('Y11', 1))
    assert.isHigh(traces.Y12, disableMessage('Y12', 1))
    assert.isHigh(traces.Y13, disableMessage('Y13', 1))
  })

  it('selects the correct line for L/L in demux 1', () => {
    traces.G1.clear()
    traces.A1.clear()
    traces.B1.clear()
    assert.isLow(traces.Y10, llMessage('Y10', 'low', 1))
    assert.isHigh(traces.Y11, llMessage('Y11', 'high', 1))
    assert.isHigh(traces.Y12, llMessage('Y12', 'high', 1))
    assert.isHigh(traces.Y13, llMessage('Y13', 'high', 1))
  })

  it('selects the correct line for H/L in demux 1', () => {
    traces.G1.clear()
    traces.A1.set()
    traces.B1.clear()
    assert.isHigh(traces.Y10, hlMessage('Y10', 'high', 1))
    assert.isLow(traces.Y11, hlMessage('Y11', 'low', 1))
    assert.isHigh(traces.Y12, hlMessage('Y12', 'high', 1))
    assert.isHigh(traces.Y13, hlMessage('Y13', 'high', 1))
  })

  it('selects the correct line for L/H in demux 1', () => {
    traces.G1.clear()
    traces.A1.clear()
    traces.B1.set()
    assert.isHigh(traces.Y10, lhMessage('Y10', 'high', 1))
    assert.isHigh(traces.Y11, lhMessage('Y11', 'high', 1))
    assert.isLow(traces.Y12, lhMessage('Y12', 'low', 1))
    assert.isHigh(traces.Y13, lhMessage('Y13', 'high', 1))
  })

  it('selects the correct line for H/H in demux 1', () => {
    traces.G1.clear()
    traces.A1.set()
    traces.B1.set()
    assert.isHigh(traces.Y10, hhMessage('Y10', 'high', 1))
    assert.isHigh(traces.Y11, hhMessage('Y11', 'high', 1))
    assert.isHigh(traces.Y12, hhMessage('Y12', 'high', 1))
    assert.isLow(traces.Y13, hhMessage('Y13', 'low', 1))
  })

  it('pulls all demux 2 outputs high when G2 is high', () => {
    traces.G2.set()
    traces.A2.clear()
    traces.B2.clear()
    assert.isHigh(traces.Y20, disableMessage('Y20', 2))
    assert.isHigh(traces.Y21, disableMessage('Y21', 2))
    assert.isHigh(traces.Y22, disableMessage('Y22', 2))
    assert.isHigh(traces.Y23, disableMessage('Y23', 2))

    traces.A2.set()
    assert.isHigh(traces.Y20, disableMessage('Y20', 2))
    assert.isHigh(traces.Y21, disableMessage('Y21', 2))
    assert.isHigh(traces.Y22, disableMessage('Y22', 2))
    assert.isHigh(traces.Y23, disableMessage('Y23', 2))

    traces.B2.set()
    assert.isHigh(traces.Y20, disableMessage('Y20', 2))
    assert.isHigh(traces.Y21, disableMessage('Y21', 2))
    assert.isHigh(traces.Y22, disableMessage('Y22', 2))
    assert.isHigh(traces.Y23, disableMessage('Y23', 2))

    traces.A2.clear()
    assert.isHigh(traces.Y20, disableMessage('Y20', 2))
    assert.isHigh(traces.Y21, disableMessage('Y21', 2))
    assert.isHigh(traces.Y22, disableMessage('Y22', 2))
    assert.isHigh(traces.Y23, disableMessage('Y23', 2))
  })

  it('selects the correct line for L/L in demux 2', () => {
    traces.G2.clear()
    traces.A2.clear()
    traces.B2.clear()
    assert.isLow(traces.Y20, llMessage('Y20', 'low', 2))
    assert.isHigh(traces.Y21, llMessage('Y21', 'high', 2))
    assert.isHigh(traces.Y22, llMessage('Y22', 'high', 2))
    assert.isHigh(traces.Y23, llMessage('Y23', 'high', 2))
  })

  it('selects the correct line for H/L in demux 2', () => {
    traces.G2.clear()
    traces.A2.set()
    traces.B2.clear()
    assert.isHigh(traces.Y20, hlMessage('Y20', 'high', 2))
    assert.isLow(traces.Y21, hlMessage('Y21', 'low', 2))
    assert.isHigh(traces.Y22, hlMessage('Y22', 'high', 2))
    assert.isHigh(traces.Y23, hlMessage('Y23', 'high', 2))
  })

  it('selects the correct line for L/H in demux 2', () => {
    traces.G2.clear()
    traces.A2.clear()
    traces.B2.set()
    assert.isHigh(traces.Y20, lhMessage('Y20', 'high', 2))
    assert.isHigh(traces.Y21, lhMessage('Y21', 'high', 2))
    assert.isLow(traces.Y22, lhMessage('Y22', 'low', 2))
    assert.isHigh(traces.Y23, lhMessage('Y23', 'high', 2))
  })

  it('selects the correct line for H/H in demux 2', () => {
    traces.G2.clear()
    traces.A2.set()
    traces.B2.set()
    assert.isHigh(traces.Y20, hhMessage('Y20', 'high', 2))
    assert.isHigh(traces.Y21, hhMessage('Y21', 'high', 2))
    assert.isHigh(traces.Y22, hhMessage('Y22', 'high', 2))
    assert.isLow(traces.Y23, hhMessage('Y23', 'low', 2))
  })
})
