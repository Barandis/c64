// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import Pin from 'components/pin'
import Trace from 'components/trace'

const { INPUT, OUTPUT } = Pin

export function puInitial() {
  const t = new Trace().pullUp()
  assert(t.high)
}

export function puModeInput() {
  const p = new Pin(1, 'A', OUTPUT)
  const t = new Trace(p).pullUp()

  p.level = 0
  assert(t.low)
  p.mode = INPUT
  assert(t.high)
}

export function puNoOutputs() {
  const p = new Pin(1, 'A', INPUT)
  const t = new Trace(p).pullUp()
  assert(t.high)
}

export function puHiOutputs() {
  const p1 = new Pin(1, 'A', OUTPUT)
  const p2 = new Pin(2, 'B', OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = new Trace(p1, p2).pullUp()
  assert(t.high)
}

export function puLoOutputs() {
  const p1 = new Pin(1, 'A', OUTPUT)
  const p2 = new Pin(2, 'B', OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = new Trace(p1, p2).pullUp()
  assert(t.low)
}

export function puNullOutputs() {
  const p1 = new Pin(1, 'A', OUTPUT)
  const p2 = new Pin(2, 'B', OUTPUT)
  p1.level = null
  p2.level = null
  const t = new Trace(p1, p2).pullUp()
  assert(t.high)
}

export function pdInitial() {
  const t = new Trace().pullDown()
  assert(t.low)
}

export function pdModeInput() {
  const p = new Pin(1, 'A', OUTPUT)
  const t = new Trace(p).pullDown()

  p.level = 1
  assert(t.high)
  p.mode = INPUT
  assert(t.low)
}

export function pdNoOutputs() {
  const p = new Pin(1, 'A', INPUT)
  const t = new Trace(p).pullDown()
  assert(t.low)
}

export function pdHiOutputs() {
  const p1 = new Pin(1, 'A', OUTPUT)
  const p2 = new Pin(2, 'B', OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = new Trace(p1, p2).pullDown()
  assert(t.high)
}

export function pdLoOutputs() {
  const p1 = new Pin(1, 'A', OUTPUT)
  const p2 = new Pin(2, 'B', OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = new Trace(p1, p2).pullDown()
  assert(t.low)
}

export function pdNullOutputs() {
  const p1 = new Pin(1, 'A', OUTPUT)
  const p2 = new Pin(2, 'B', OUTPUT)
  p1.level = null
  p2.level = null
  const t = new Trace(p1, p2).pullDown()
  assert(t.low)
}

export function pnInitial() {
  const t = new Trace().noPull()
  assert(t.floating)
}

export function pnModeInput() {
  const p = new Pin(1, 'A', OUTPUT)
  const t = new Trace(p).noPull()

  p.level = 1
  assert(t.high)
  p.mode = INPUT
  assert(t.floating)
}

export function pnNoOutputs() {
  const p = new Pin(1, 'A', INPUT)
  const t = new Trace(p).noPull()
  assert(t.floating)
}

export function pnHiOutputs() {
  const p1 = new Pin(1, 'A', OUTPUT)
  const p2 = new Pin(2, 'B', OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = new Trace(p1, p2).noPull()
  assert(t.high)
}

export function pnLoOutputs() {
  const p1 = new Pin(1, 'A', OUTPUT)
  const p2 = new Pin(2, 'B', OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = new Trace(p1, p2).noPull()
  assert(t.low)
}

export function pnNullOutputs() {
  const p1 = new Pin(1, 'A', OUTPUT)
  const p2 = new Pin(2, 'B', OUTPUT)
  p1.level = null
  p2.level = null
  const t = new Trace(p1, p2).noPull()
  assert(t.floating)
}
