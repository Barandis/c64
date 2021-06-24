// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from 'test/helper'
import { Ic4066 } from 'chips'

const passMessage = (input, output) => `${output}'s level should match ${input}'s`

const noPassMessage = (input, output) => `${output}'s level should not be affected by ${input}`

const discMessage = pin => `${pin} should be disconnected`

const lastSetMessage = (target, last) =>
  `${target}'s level should match ${last}'s since it was last set`

const noSetMessage = target => `${target} should be low since nothing was last set`

describe('4066 quad bilateral switch', () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic4066()
    traces = deviceTraces(chip)
  })

  it('passes signals from A to B', () => {
    traces.X1.clear()
    traces.A1.level = 0.5
    assert.level(traces.B1, 0.5, passMessage('A1', 'B1'))

    traces.X2.clear()
    traces.A2.level = 0.75
    assert.level(traces.B2, 0.75, passMessage('A2', 'B2'))

    traces.X3.clear()
    traces.A3.level = 0.25
    assert.level(traces.B3, 0.25, passMessage('A3', 'B3'))

    traces.X4.clear()
    traces.A4.level = 1
    assert.level(traces.B4, 1, passMessage('A4', 'B4'))
  })

  it('passes signals from B to A', () => {
    traces.X1.clear()
    traces.B1.level = 0.5
    assert.level(traces.A1, 0.5, passMessage('B1', 'A1'))

    traces.X2.clear()
    traces.B2.level = 0.75
    assert.level(traces.A2, 0.75, passMessage('B2', 'A2'))

    traces.X3.clear()
    traces.B3.level = 0.25
    assert.level(traces.A3, 0.25, passMessage('B3', 'A3'))

    traces.X4.clear()
    traces.B4.level = 1
    assert.level(traces.A4, 1, passMessage('B4', 'A4'))
  })

  it('disconnects A and B when X is high', () => {
    traces.X1.set()
    assert.isFloating(traces.A1, discMessage('A1'))
    assert.isFloating(traces.B1, discMessage('B1'))

    traces.X2.set()
    assert.isFloating(traces.A2, discMessage('A2'))
    assert.isFloating(traces.B2, discMessage('B2'))

    traces.X3.set()
    assert.isFloating(traces.A3, discMessage('A3'))
    assert.isFloating(traces.B3, discMessage('B3'))

    traces.X4.set()
    assert.isFloating(traces.A4, discMessage('A4'))
    assert.isFloating(traces.B4, discMessage('B4'))
  })

  it('does not pass signals from A to B when X is high', () => {
    traces.X1.set()
    traces.A1.level = 0.5
    assert.isFloating(traces.B1, noPassMessage('A1', 'B1'))

    traces.X2.set()
    traces.A2.level = 0.75
    assert.isFloating(traces.B2, noPassMessage('A2', 'B2'))

    traces.X3.set()
    traces.A3.level = 0.25
    assert.isFloating(traces.B3, noPassMessage('A3', 'B3'))

    traces.X4.set()
    traces.A4.level = 1
    assert.isFloating(traces.B4, noPassMessage('A4', 'B4'))
  })

  it('does not pass signals from B to A when X is high', () => {
    traces.X1.set()
    traces.B1.level = 0.5
    assert.isFloating(traces.A1, noPassMessage('B1', 'A1'))

    traces.X2.set()
    traces.B2.level = 0.75
    assert.isFloating(traces.A2, noPassMessage('B2', 'A2'))

    traces.X3.set()
    traces.B3.level = 0.25
    assert.isFloating(traces.A3, noPassMessage('B3', 'A3'))

    traces.X4.set()
    traces.B4.level = 1
    assert.isFloating(traces.A4, noPassMessage('B4', 'A4'))
  })

  it("sets B to A's level after X goes low if A was last set", () => {
    traces.X1.set()
    traces.B1.level = 1.5
    traces.A1.level = 0.5
    traces.X1.clear()
    assert.level(traces.B1, 0.5, lastSetMessage('B1', 'A1'))

    traces.X2.set()
    traces.B2.level = 1.5
    traces.A2.level = 0.75
    traces.X2.clear()
    assert.level(traces.B2, 0.75, lastSetMessage('B2', 'A2'))

    traces.X3.set()
    traces.B3.level = 1.5
    traces.A3.level = 0.25
    traces.X3.clear()
    assert.level(traces.B3, 0.25, lastSetMessage('B3', 'A3'))

    traces.X4.set()
    traces.B4.level = 1.5
    traces.A4.level = 1
    traces.X4.clear()
    assert.level(traces.B4, 1, lastSetMessage('B4', 'A4'))
  })

  it("sets A to B's level after X goes low if B was last set", () => {
    traces.X1.set()
    traces.A1.level = 1.5
    traces.B1.level = 0.5
    traces.X1.clear()
    assert.level(traces.A1, 0.5, lastSetMessage('A1', 'B1'))

    traces.X2.set()
    traces.A2.level = 1.5
    traces.B2.level = 0.75
    traces.X2.clear()
    assert.level(traces.A2, 0.75, lastSetMessage('A2', 'B2'))

    traces.X3.set()
    traces.A3.level = 1.5
    traces.B3.level = 0.25
    traces.X3.clear()
    assert.level(traces.A3, 0.25, lastSetMessage('A3', 'B3'))

    traces.X4.set()
    traces.A4.level = 1.5
    traces.B4.level = 1
    traces.X4.clear()
    assert.level(traces.A4, 1, lastSetMessage('A4', 'B4'))
  })

  it('sets both data pins to 0 if neither was set before X goes low', () => {
    traces.X1.set().clear()
    assert.isLow(traces.A1, noSetMessage('A1'))
    assert.isLow(traces.B1, noSetMessage('B1'))

    traces.X2.set().clear()
    assert.isLow(traces.A2, noSetMessage('A2'))
    assert.isLow(traces.B2, noSetMessage('B2'))

    traces.X3.set().clear()
    assert.isLow(traces.A3, noSetMessage('A3'))
    assert.isLow(traces.B3, noSetMessage('B3'))

    traces.X4.set().clear()
    assert.isLow(traces.A4, noSetMessage('A4'))
    assert.isLow(traces.B4, noSetMessage('B4'))
  })
})
