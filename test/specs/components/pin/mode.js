// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import Pin from 'components/pin'
import Trace from 'components/trace'

const { UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL } = Pin

export function modeInitial() {
  const p1 = Pin(1, 'A', UNCONNECTED)
  const p2 = Pin(2, 'B', INPUT)
  const p3 = Pin(3, 'C', OUTPUT)
  const p4 = Pin(4, 'D', BIDIRECTIONAL)

  assert.equal(p1.mode, Pin.UNCONNECTED)
  assert.isTrue(!p1.input)
  assert.isTrue(!p1.output)

  assert.equal(p2.mode, Pin.INPUT)
  assert.isTrue(p2.input)
  assert.isTrue(!p2.output)

  assert.equal(p3.mode, Pin.OUTPUT)
  assert.isTrue(!p3.input)
  assert.isTrue(p3.output)

  assert.equal(p4.mode, Pin.BIDIRECTIONAL)
  assert.isTrue(p4.input)
  assert.isTrue(p4.output)
}

export function modeChange() {
  const p = Pin(1, 'A', UNCONNECTED)
  assert.mode(p, UNCONNECTED)
  p.mode = INPUT
  assert.mode(p, INPUT)
  p.mode = OUTPUT
  assert.mode(p, OUTPUT)
  p.mode = BIDIRECTIONAL
  assert.mode(p, BIDIRECTIONAL)
}

export function modeOutToIn() {
  const p = Pin(1, 'A', OUTPUT)
  const t = Trace(p, Pin(2, 'B', INPUT))
  p.level = 1
  assert.isHigh(t)
  p.mode = INPUT
  assert.isFloating(t)
}

export function modeBidiToIn() {
  const p = Pin(1, 'A', BIDIRECTIONAL)
  const t = Trace(p, Pin(2, 'B', INPUT))
  p.level = 1
  assert.isHigh(t)
  p.mode = INPUT
  assert.isFloating(t)
}

export function modeUncToIn() {
  const p = Pin(1, 'A', UNCONNECTED)
  const t = Trace(p, Pin(2, 'B', INPUT))
  p.level = 1
  assert.isFloating(t)
  p.mode = INPUT
  assert.isFloating(t)
}

export function modeBidiToOut() {
  const p = Pin(1, 'A', BIDIRECTIONAL)
  const t = Trace(p)
  p.level = 1
  assert.isHigh(t)
  p.mode = OUTPUT
  assert.isHigh(t)
}

export function modeUncToOut() {
  const p = Pin(1, 'A', UNCONNECTED)
  const t = Trace(p)
  p.level = 1
  assert.isFloating(t)
  p.mode = OUTPUT
  assert.isHigh(t)
}

export function modeInToUnc() {
  const p = Pin(1, 'A', INPUT)
  const t = Trace(p)
  t.level = 1
  assert.isHigh(p)
  p.mode = UNCONNECTED
  assert.isHigh(t)
  assert.isHigh(p)
}

export function incorrectMode() {
  const p = Pin(1, 'A', INPUT)
  p.mode = 1729
  assert.mode(p, INPUT)
}
