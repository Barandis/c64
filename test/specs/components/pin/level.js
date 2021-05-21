// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import Pin from 'components/pin'
import Trace from 'components/trace'

const { UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL } = Pin

export function levelNoTrace() {
  const p = new Pin(1, 'A', INPUT)
  assert(p.level === null)
  assert(!p.high)
  assert(!p.low)
  assert(p.floating)

  p.level = 1
  assert(p.level === 1)
  assert(p.high)
  assert(!p.low)
  assert(!p.floating)

  p.level = 0
  assert(p.level === 0)
  assert(!p.high)
  assert(p.low)
  assert(!p.floating)

  p.level = -0.35
  assert(p.level === -0.35)
  assert(!p.high)
  assert(p.low)
  assert(!p.floating)
}

export function levelUpdateNoTrace() {
  const p = new Pin(1, 'A', INPUT)
  p.level = 1
  p.updateLevel()
  assert(p.level === 1)
}

export function levelUnconnected() {
  const p = new Pin(1, 'A', UNCONNECTED)
  const t = new Trace(p)

  t.level = 1
  assert(p.level === null)
  assert(t.level === 1)

  p.level = 1
  assert(p.level === 1)
  assert(t.level === 1)

  p.level = 0
  assert(p.level === 0)
  assert(t.level === 1)

  p.level = -0.35
  assert(p.level === -0.35)
  assert(t.level === 1)

  p.level = null
  assert(p.level === null)
  assert(t.level === 1)
}

export function levelInput() {
  const p = new Pin(1, 'A', INPUT)
  const t = new Trace(p)

  t.level = 1
  assert(p.level === 1)
  assert(t.level === 1)

  p.level = 1
  assert(p.level === 1)
  assert(t.level === 1)

  p.level = 0
  assert(p.level === 1)
  assert(t.level === 1)

  p.level = -0.35
  assert(p.level === 1)
  assert(t.level === 1)

  p.level = null
  assert(p.level === 1)
  assert(t.level === 1)
}

export function levelOutput() {
  const p = new Pin(1, 'A', OUTPUT)
  const t = new Trace(p)

  t.level = 1
  assert(p.level === null)
  assert(t.level === 1)

  p.level = 1
  assert(p.level === 1)
  assert(t.level === 1)

  p.level = 0
  assert(p.level === 0)
  assert(t.level === 0)

  p.level = -0.35
  assert(p.level === -0.35)
  assert(t.level === -0.35)

  p.level = null
  assert(p.level === null)
  assert(t.level === null)
}

export function levelBidirectional() {
  const p = new Pin(1, 'A', BIDIRECTIONAL)
  const t = new Trace(p)

  t.level = 1
  assert(p.level === 1)
  assert(t.level === 1)

  p.level = 0
  assert(p.level === 0)
  assert(t.level === 0)

  t.level = -0.35
  assert(p.level === -0.35)
  assert(t.level === -0.35)

  p.level = null
  assert(p.level === null)
  assert(t.level === null)
}

export function levelOptions() {
  const p = new Pin(1, 'A', BIDIRECTIONAL)
  const t = new Trace(p)

  t.set()
  assert(p.level === 1)
  assert(t.level === 1)

  p.clear()
  assert(p.level === 0)
  assert(t.level === 0)

  t.level = -0.35
  assert(p.level === -0.35)
  assert(t.level === -0.35)

  p.set()
  assert(p.level === 1)
  assert(t.level === 1)

  p.float()
  assert(p.level === null)
  assert(t.level === null)
}

export function levelToggleHigh() {
  const p = new Pin(1, 'A')
  p.level = 0
  p.toggle()
  assert(p.level === 1)
}

export function levelToggleLow() {
  const p = new Pin(1, 'A')
  p.level = 1
  p.toggle()
  assert(p.level === 0)
}

export function levelToggleNone() {
  const p = new Pin(1, 'A')
  p.level = null
  p.toggle()
  assert(p.level === null)
}
