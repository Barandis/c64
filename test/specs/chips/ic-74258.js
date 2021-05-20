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
const oeMessage = mux => `Y${mux} should float when _OE is high`

describe('74258 3-State Quad 2-Data Multiplexers', () => {
  let chip
  let traces

  beforeEach(() => {
    chip = new Ic74258()
    traces = deviceTraces(chip)
  })

  describe('group 1', () => {
    beforeEach(() => {
      traces.A1.clear()
      traces.B1.set()
    })

    it('selects A when SEL is false', () => {
      traces.SEL.clear()
      assert(traces._Y1.high, selLowMessage(1, 'high'))

      traces.A1.set()
      assert(traces._Y1.low, selLowMessage(1, 'low'))
    })

    it('selects B when SEL is true', () => {
      traces.SEL.set()
      assert(traces._Y1.low, selHighMessage(1, 'low'))

      traces.B1.clear()
      assert(traces._Y1.high, selHighMessage(1, 'high'))
    })

    it('is off when OE is true, no matter the value of SEL', () => {
      traces.SEL.set()
      assert(traces._Y1.low, selHighMessage(1, 'low'))

      traces._OE.set()
      assert(traces._Y1.floating, oeMessage(1))

      traces.SEL.clear()
      assert(traces._Y1.floating, oeMessage(1))
    })
  })

  describe('group 2', () => {
    beforeEach(() => {
      traces.A2.clear()
      traces.B2.set()
    })

    it('selects A when SEL is false', () => {
      traces.SEL.clear()
      assert(traces._Y2.high, selLowMessage(2, 'high'))

      traces.A2.set()
      assert(traces._Y2.low, selLowMessage(2, 'low'))
    })

    it('selects B when SEL is true', () => {
      traces.SEL.set()
      assert(traces._Y2.low, selHighMessage(2, 'low'))

      traces.B2.clear()
      assert(traces._Y2.high, selHighMessage(2, 'high'))
    })

    it('is off when OE is true, no matter the value of SEL', () => {
      traces.SEL.set()
      assert(traces._Y2.low, selHighMessage(2, 'low'))

      traces._OE.set()
      assert(traces._Y2.floating, oeMessage(2))

      traces.SEL.clear()
      assert(traces._Y2.floating, oeMessage(2))
    })
  })

  describe('group 3', () => {
    beforeEach(() => {
      traces.A3.clear()
      traces.B3.set()
    })

    it('selects A when SEL is false', () => {
      traces.SEL.clear()
      assert(traces._Y3.high, selLowMessage(3, 'high'))

      traces.A3.set()
      assert(traces._Y3.low, selLowMessage(3, 'low'))
    })

    it('selects B when SEL is true', () => {
      traces.SEL.set()
      assert(traces._Y3.low, selHighMessage(3, 'low'))

      traces.B3.clear()
      assert(traces._Y3.high, selHighMessage(3, 'high'))
    })

    it('is off when OE is true, no matter the value of SEL', () => {
      traces.SEL.set()
      assert(traces._Y3.low, selHighMessage(3, 'low'))

      traces._OE.set()
      assert(traces._Y3.floating, oeMessage(3))

      traces.SEL.clear()
      assert(traces._Y3.floating, oeMessage(3))
    })
  })

  describe('group 4', () => {
    beforeEach(() => {
      traces.A4.clear()
      traces.B4.set()
    })

    it('selects A when SEL is false', () => {
      traces.SEL.clear()
      assert(traces._Y4.high, selLowMessage(4, 'high'))

      traces.A4.set()
      assert(traces._Y4.low, selLowMessage(4, 'low'))
    })

    it('selects B when SEL is true', () => {
      traces.SEL.set()
      assert(traces._Y4.low, selHighMessage(4, 'low'))

      traces.B4.clear()
      assert(traces._Y4.high, selHighMessage(4, 'high'))
    })

    it('is off when OE is true, no matter the value of SEL', () => {
      traces.SEL.set()
      assert(traces._Y4.low, selHighMessage(4, 'low'))

      traces._OE.set()
      assert(traces._Y4.floating, oeMessage(4))

      traces.SEL.clear()
      assert(traces._Y4.floating, oeMessage(4))
    })
  })
})
