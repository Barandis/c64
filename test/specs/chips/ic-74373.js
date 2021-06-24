// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from 'test/helper'
import { Ic74373 } from 'chips'
import { range } from 'utils'

const highLeMessage = (latch, state) =>
  `Q${latch} should be ${state} when LE is high and D${latch} is ${state}`
const lowLeMessage = (latch, state) => `Q${latch} should remain ${state} when LE is low`
const oeMessage = latch => `Q${latch} should float when OE is high`

describe('74373 Octal tri-state transparent latch', () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic74373()
    traces = deviceTraces(chip)
    traces.OE.clear()
  })

  it('allows data to pass through when LE is high', () => {
    traces.LE.set()

    for (const i of range(8)) {
      traces[`D${i}`].set()
      assert.isHigh(traces[`Q${i}`], highLeMessage(i, 'high'))
    }

    for (const i of range(8)) {
      traces[`D${i}`].clear()
      assert.isLow(traces[`Q${i}`], highLeMessage(i, 'low'))
    }
  })

  it('latches the data when LE goes low', () => {
    traces.LE.set()

    // Sets output, from 7 to 0, to 01010101
    for (const i of range(0, 8)) {
      traces[`D${i}`].level = (i + 1) % 2
    }

    traces.LE.clear()

    for (const i of range(8)) {
      // Odd outputs remain low even when inputs are all set high
      traces[`D${i}`].set()
      assert.level(traces[`Q${i}`], (i + 1) % 2, lowLeMessage(i, i % 2 === 0 ? 'high' : 'low'))
    }
    for (const i of range(8)) {
      // Even outputs remain high even when inputs are all set low
      traces[`D${i}`].clear()
      assert.level(traces[`Q${i}`], (i + 1) % 2, lowLeMessage(i, i % 2 === 0 ? 'high' : 'low'))
    }
  })

  it('returns to input levels when LE returns to high', () => {
    traces.LE.set()

    for (const i of range(0, 8)) {
      traces[`D${i}`].level = (i + 1) % 2
    }

    traces.LE.clear()

    for (const i of range(8)) {
      // All inputs set high here
      traces[`D${i}`].set()
      assert.level(traces[`Q${i}`], (i + 1) % 2, lowLeMessage(i, i % 2 === 0 ? 'high' : 'low'))
    }

    traces.LE.set()

    // Outputs now match inputs, which are still all high
    for (const i of range(8)) {
      assert.isHigh(traces[`Q${i}`], highLeMessage(i, 'high'))
    }
  })

  it('sets all outputs to floating when OE is high', () => {
    traces.LE.set()

    for (const i of range(8)) {
      traces[`D${i}`].set()
    }

    traces.OE.set()

    for (const i of range(8)) {
      assert.isFloating(traces[`Q${i}`], oeMessage(i))
    }

    traces.OE.clear()

    for (const i of range(8)) {
      assert.isHigh(traces[`Q${i}`], highLeMessage(i, 'high'))
    }
  })

  it('remembers levels latched when OE is high', () => {
    traces.LE.set()

    for (const i of range(8)) {
      traces[`D${i}`].set()
    }

    traces.OE.set()

    for (const i of range(0, 8, 2)) {
      traces[`D${i}`].clear()
    }
    traces.LE.clear()

    traces.OE.clear()

    for (const i of range(8)) {
      assert.level(traces[`Q${i}`], i % 2, lowLeMessage(i, i % 2 === 0 ? 'low' : 'high'))
    }
  })
})
