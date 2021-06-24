// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from 'test/helper'
import { Ic74258 } from 'chips'

const selLowMessage = (mux, state) =>
  `Y${mux} should be ${state} when A${mux} is ${state === 'high' ? 'low' : 'high'} and SEL is low`
const selHighMessage = (mux, state) =>
  `Y${mux} should be ${state} when B${mux} is ${state === 'high' ? 'low' : 'high'} and SEL is high`
const oeMessage = mux => `Y${mux} should float when OE is high`

describe('74258 3-State Quad 2-Data Multiplexers', () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic74258()
    traces = deviceTraces(chip)
  })

  describe('group 1', () => {
    beforeEach(() => {
      traces.A1.clear()
      traces.B1.set()
    })

    it('selects A when SEL is low', () => {
      traces.SEL.clear()
      assert.isHigh(traces.Y1, selLowMessage(1, 'high'))

      traces.A1.set()
      assert.isLow(traces.Y1, selLowMessage(1, 'low'))
    })

    it('selects B when SEL is high', () => {
      traces.SEL.set()
      assert.isLow(traces.Y1, selHighMessage(1, 'low'))

      traces.B1.clear()
      assert.isHigh(traces.Y1, selHighMessage(1, 'high'))
    })

    it('is off when OE is high, no matter the value of SEL', () => {
      traces.SEL.set()
      assert.isLow(traces.Y1, selHighMessage(1, 'low'))

      traces.OE.set()
      assert.isFloating(traces.Y1, oeMessage(1))

      traces.SEL.clear()
      assert.isFloating(traces.Y1, oeMessage(1))
    })
  })

  describe('group 2', () => {
    beforeEach(() => {
      traces.A2.clear()
      traces.B2.set()
    })

    it('selects A when SEL is low', () => {
      traces.SEL.clear()
      assert.isHigh(traces.Y2, selLowMessage(2, 'high'))

      traces.A2.set()
      assert.isLow(traces.Y2, selLowMessage(2, 'low'))
    })

    it('selects B when SEL is high', () => {
      traces.SEL.set()
      assert.isLow(traces.Y2, selHighMessage(2, 'low'))

      traces.B2.clear()
      assert.isHigh(traces.Y2, selHighMessage(2, 'high'))
    })

    it('is off when OE is high, no matter the value of SEL', () => {
      traces.SEL.set()
      assert.isLow(traces.Y2, selHighMessage(2, 'low'))

      traces.OE.set()
      assert.isFloating(traces.Y2, oeMessage(2))

      traces.SEL.clear()
      assert.isFloating(traces.Y2, oeMessage(2))
    })
  })

  describe('group 3', () => {
    beforeEach(() => {
      traces.A3.clear()
      traces.B3.set()
    })

    it('selects A when SEL is low', () => {
      traces.SEL.clear()
      assert.isHigh(traces.Y3, selLowMessage(3, 'high'))

      traces.A3.set()
      assert.isLow(traces.Y3, selLowMessage(3, 'low'))
    })

    it('selects B when SEL is high', () => {
      traces.SEL.set()
      assert.isLow(traces.Y3, selHighMessage(3, 'low'))

      traces.B3.clear()
      assert.isHigh(traces.Y3, selHighMessage(3, 'high'))
    })

    it('is off when OE is high, no matter the value of SEL', () => {
      traces.SEL.set()
      assert.isLow(traces.Y3, selHighMessage(3, 'low'))

      traces.OE.set()
      assert.isFloating(traces.Y3, oeMessage(3))

      traces.SEL.clear()
      assert.isFloating(traces.Y3, oeMessage(3))
    })
  })

  describe('group 4', () => {
    beforeEach(() => {
      traces.A4.clear()
      traces.B4.set()
    })

    it('selects A when SEL is low', () => {
      traces.SEL.clear()
      assert.isHigh(traces.Y4, selLowMessage(4, 'high'))

      traces.A4.set()
      assert.isLow(traces.Y4, selLowMessage(4, 'low'))
    })

    it('selects B when SEL is high', () => {
      traces.SEL.set()
      assert.isLow(traces.Y4, selHighMessage(4, 'low'))

      traces.B4.clear()
      assert.isHigh(traces.Y4, selHighMessage(4, 'high'))
    })

    it('is off when OE is high, no matter the value of SEL', () => {
      traces.SEL.set()
      assert.isLow(traces.Y4, selHighMessage(4, 'low'))

      traces.OE.set()
      assert.isFloating(traces.Y4, oeMessage(4))

      traces.SEL.clear()
      assert.isFloating(traces.Y4, oeMessage(4))
    })
  })
})
