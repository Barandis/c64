// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import Pin from 'components/pin'
import Trace from 'components/trace'

const { UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL } = Pin

export function levelNoTrace() {
  const p = Pin(1, 'A', INPUT)
  assert.equal(p.level, null)
  assert.isFalse(p.high)
  assert.isFalse(p.low)
  assert.isTrue(p.floating)

  p.level = 1
  assert.equal(p.level, 1)
  assert.isTrue(p.high)
  assert.isFalse(p.low)
  assert.isFalse(p.floating)

  p.level = 0
  assert.equal(p.level, 0)
  assert.isFalse(p.high)
  assert.isTrue(p.low)
  assert.isFalse(p.floating)

  p.level = -0.35
  assert.equal(p.level, -0.35)
  assert.isFalse(p.high)
  assert.isTrue(p.low)
  assert.isFalse(p.floating)
}

export function levelUpdateNoTrace() {
  const p = Pin(1, 'A', INPUT)
  p.level = 1
  p.updateLevel()
  assert.level(p, 1)
}

export function levelUnconnected() {
  const p = Pin(1, 'A', UNCONNECTED)
  const t = Trace(p)

  t.level = 1
  assert.level(p, null)
  assert.level(t, 1)

  p.level = 1
  assert.level(p, 1)
  assert.level(t, 1)

  p.level = 0
  assert.level(p, 0)
  assert.level(t, 1)

  p.level = -0.35
  assert.level(p, -0.35)
  assert.level(t, 1)

  p.level = null
  assert.level(p, null)
  assert.level(t, 1)
}

export function levelInput() {
  const p = Pin(1, 'A', INPUT)
  const t = Trace(p)

  t.level = 1
  assert.level(p, 1)
  assert.level(t, 1)

  p.level = 1
  assert.level(p, 1)
  assert.level(t, 1)

  p.level = 0
  assert.level(p, 1)
  assert.level(t, 1)

  p.level = -0.35
  assert.level(p, 1)
  assert.level(t, 1)

  p.level = null
  assert.level(p, 1)
  assert.level(t, 1)
}

export function levelOutput() {
  const p = Pin(1, 'A', OUTPUT)
  const t = Trace(p)

  t.level = 1
  assert.level(p, null)
  assert.level(t, 1)

  p.level = 1
  assert.level(p, 1)
  assert.level(t, 1)

  p.level = 0
  assert.level(p, 0)
  assert.level(t, 0)

  p.level = -0.35
  assert.level(p, -0.35)
  assert.level(t, -0.35)

  p.level = null
  assert.level(p, null)
  assert.level(t, null)
}

export function levelBidirectional() {
  const p = Pin(1, 'A', BIDIRECTIONAL)
  const t = Trace(p)

  t.level = 1
  assert.level(p, 1)
  assert.level(t, 1)

  p.level = 0
  assert.level(p, 0)
  assert.level(t, 0)

  t.level = -0.35
  assert.level(p, -0.35)
  assert.level(t, -0.35)

  p.level = null
  assert.level(p, null)
  assert.level(t, null)
}

export function levelOptions() {
  const p = Pin(1, 'A', BIDIRECTIONAL)
  const t = Trace(p)

  t.set()
  assert.level(p, 1)
  assert.level(t, 1)

  p.clear()
  assert.level(p, 0)
  assert.level(t, 0)

  t.level = -0.35
  assert.level(p, -0.35)
  assert.level(t, -0.35)

  p.set()
  assert.level(p, 1)
  assert.level(t, 1)

  p.float()
  assert.level(p, null)
  assert.level(t, null)
}

export function levelToggleHigh() {
  const p = Pin(1, 'A')
  p.level = 0
  p.toggle()
  assert.level(p, 1)
}

export function levelToggleLow() {
  const p = Pin(1, 'A')
  p.level = 1
  p.toggle()
  assert.level(p, 0)
}

export function levelToggleNone() {
  const p = Pin(1, 'A')
  p.level = null
  p.toggle()
  assert.level(p, null)
}
