// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import Pin from 'components/pin'
import Trace from 'components/trace'

const { INPUT, OUTPUT } = Pin

export function puInitial() {
  const t = Trace().pullUp()
  assert.isHigh(t)
}

export function puModeInput() {
  const p = Pin(1, 'A', OUTPUT)
  const t = Trace(p).pullUp()

  p.level = 0
  assert.isLow(t)
  p.mode = INPUT
  assert.isHigh(t)
}

export function puNoOutputs() {
  const p = Pin(1, 'A', INPUT)
  const t = Trace(p).pullUp()
  assert.isHigh(t)
}

export function puHiOutputs() {
  const p1 = Pin(1, 'A', OUTPUT)
  const p2 = Pin(2, 'B', OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = Trace(p1, p2).pullUp()
  assert.isHigh(t)
}

export function puLoOutputs() {
  const p1 = Pin(1, 'A', OUTPUT)
  const p2 = Pin(2, 'B', OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = Trace(p1, p2).pullUp()
  assert.isLow(t)
}

export function puNullOutputs() {
  const p1 = Pin(1, 'A', OUTPUT)
  const p2 = Pin(2, 'B', OUTPUT)
  p1.level = null
  p2.level = null
  const t = Trace(p1, p2).pullUp()
  assert.isHigh(t)
}

export function pdInitial() {
  const t = Trace().pullDown()
  assert.isLow(t)
}

export function pdModeInput() {
  const p = Pin(1, 'A', OUTPUT)
  const t = Trace(p).pullDown()

  p.level = 1
  assert.isHigh(t)
  p.mode = INPUT
  assert.isLow(t)
}

export function pdNoOutputs() {
  const p = Pin(1, 'A', INPUT)
  const t = Trace(p).pullDown()
  assert.isLow(t)
}

export function pdHiOutputs() {
  const p1 = Pin(1, 'A', OUTPUT)
  const p2 = Pin(2, 'B', OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = Trace(p1, p2).pullDown()
  assert.isHigh(t)
}

export function pdLoOutputs() {
  const p1 = Pin(1, 'A', OUTPUT)
  const p2 = Pin(2, 'B', OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = Trace(p1, p2).pullDown()
  assert.isLow(t)
}

export function pdNullOutputs() {
  const p1 = Pin(1, 'A', OUTPUT)
  const p2 = Pin(2, 'B', OUTPUT)
  p1.level = null
  p2.level = null
  const t = Trace(p1, p2).pullDown()
  assert.isLow(t)
}

export function pnInitial() {
  const t = Trace().noPull()
  assert.isFloating(t)
}

export function pnModeInput() {
  const p = Pin(1, 'A', OUTPUT)
  const t = Trace(p).noPull()

  p.level = 1
  assert.isHigh(t)
  p.mode = INPUT
  assert.isFloating(t)
}

export function pnNoOutputs() {
  const p = Pin(1, 'A', INPUT)
  const t = Trace(p).noPull()
  assert.isFloating(t)
}

export function pnHiOutputs() {
  const p1 = Pin(1, 'A', OUTPUT)
  const p2 = Pin(2, 'B', OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = Trace(p1, p2).noPull()
  assert.isHigh(t)
}

export function pnLoOutputs() {
  const p1 = Pin(1, 'A', OUTPUT)
  const p2 = Pin(2, 'B', OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = Trace(p1, p2).noPull()
  assert.isLow(t)
}

export function pnNullOutputs() {
  const p1 = Pin(1, 'A', OUTPUT)
  const p2 = Pin(2, 'B', OUTPUT)
  p1.level = null
  p2.level = null
  const t = Trace(p1, p2).noPull()
  assert.isFloating(t)
}
