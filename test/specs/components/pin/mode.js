// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import Pin from 'components/pin'
import Trace from 'components/trace'

const { UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL } = Pin

export function modeInitial() {
  const p1 = new Pin(1, 'A', UNCONNECTED)
  const p2 = new Pin(2, 'B', INPUT)
  const p3 = new Pin(3, 'C', OUTPUT)
  const p4 = new Pin(4, 'D', BIDIRECTIONAL)

  assert(p1.mode === Pin.UNCONNECTED)
  assert(!p1.input)
  assert(!p1.output)

  assert(p2.mode === Pin.INPUT)
  assert(p2.input)
  assert(!p2.output)

  assert(p3.mode === Pin.OUTPUT)
  assert(!p3.input)
  assert(p3.output)

  assert(p4.mode === Pin.BIDIRECTIONAL)
  assert(p4.input)
  assert(p4.output)
}

export function modeChange() {
  const p = new Pin(1, 'A', UNCONNECTED)
  assert(p.mode === UNCONNECTED)
  p.mode = INPUT
  assert(p.mode === INPUT)
  p.mode = OUTPUT
  assert(p.mode === OUTPUT)
  p.mode = BIDIRECTIONAL
  assert(p.mode === BIDIRECTIONAL)
}

export function modeOutToIn() {
  const p = new Pin(1, 'A', OUTPUT)
  const t = new Trace(p, new Pin(2, 'B', INPUT))
  p.level = 1
  assert(t.high)
  p.mode = INPUT
  assert(t.floating)
}

export function modeBidiToIn() {
  const p = new Pin(1, 'A', BIDIRECTIONAL)
  const t = new Trace(p, new Pin(2, 'B', INPUT))
  p.level = 1
  assert(t.high)
  p.mode = INPUT
  assert(t.floating)
}

export function modeUncToIn() {
  const p = new Pin(1, 'A', UNCONNECTED)
  const t = new Trace(p, new Pin(2, 'B', INPUT))
  p.level = 1
  assert(t.floating)
  p.mode = INPUT
  assert(t.floating)
}

export function modeBidiToOut() {
  const p = new Pin(1, 'A', BIDIRECTIONAL)
  const t = new Trace(p)
  p.level = 1
  assert(t.high)
  p.mode = OUTPUT
  assert(t.high)
}

export function modeUncToOut() {
  const p = new Pin(1, 'A', UNCONNECTED)
  const t = new Trace(p)
  p.level = 1
  assert(t.floating)
  p.mode = OUTPUT
  assert(t.high)
}

export function modeInToUnc() {
  const p = new Pin(1, 'A', INPUT)
  const t = new Trace(p)
  t.level = 1
  assert(p.high)
  p.mode = UNCONNECTED
  assert(t.high)
  assert(p.high)
}

export function incorrectMode() {
  const p = new Pin(1, 'A', INPUT)
  p.mode = 1729
  assert(p.mode === INPUT)
}
