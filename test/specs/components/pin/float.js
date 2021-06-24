// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import Pin from 'components/pin'
import Trace from 'components/trace'

const { UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL } = Pin

export function puInitial() {
  const p = Pin(1, 'A', OUTPUT).pullUp()
  assert.isHigh(p)
}

export function puUnconnected() {
  const p = Pin(1, 'A', UNCONNECTED).pullUp()
  p.level = 0
  assert.isLow(p)
  p.level = null
  assert.isHigh(p)
}

export function puInput() {
  const p = Pin(1, 'A', INPUT).pullUp()
  const t = Trace(p)
  t.level = 0
  assert.isLow(p)
  t.level = null
  assert.isHigh(p)
}

export function puOutput() {
  const p = Pin(1, 'A', OUTPUT).pullUp()
  const t = Trace(p)
  p.level = 0
  assert.isLow(t)
  p.level = null
  assert.isHigh(t)
}

export function puBidirectional() {
  const p = Pin(1, 'A', BIDIRECTIONAL).pullUp()
  const t = Trace(p)
  p.level = 0
  assert.isLow(t)
  p.level = null
  assert.isHigh(t)
}

export function puAfter() {
  const p = Pin(1, 'A', UNCONNECTED)
  assert.isFloating(p)
  p.pullUp()
  assert.isHigh(p)
}

export function pdInitial() {
  const p = Pin(1, 'A', OUTPUT).pullDown()
  assert.isLow(p)
}

export function pdUnconnected() {
  const p = Pin(1, 'A', UNCONNECTED).pullDown()
  p.level = 1
  assert.isHigh(p)
  p.level = null
  assert.isLow(p)
}

export function pdInput() {
  const p = Pin(1, 'A', INPUT).pullDown()
  const t = Trace(p)
  t.level = 1
  assert.isHigh(p)
  t.level = null
  assert.isLow(p)
}

export function pdOutput() {
  const p = Pin(1, 'A', OUTPUT).pullDown()
  const t = Trace(p)
  p.level = 1
  assert.isHigh(t)
  p.level = null
  assert.isLow(t)
}

export function pdBidirectional() {
  const p = Pin(1, 'A', BIDIRECTIONAL).pullDown()
  const t = Trace(p)
  p.level = 1
  assert.isHigh(t)
  p.level = null
  assert.isLow(t)
}

export function pdAfter() {
  const p = Pin(1, 'A', UNCONNECTED)
  assert.isFloating(p)
  p.pullDown()
  assert.isLow(p)
}

export function pnInitial() {
  const p = Pin(1, 'A', OUTPUT).noPull()
  assert.isFloating(p)
}

export function pnPullUp() {
  const p = Pin(1, 'A', OUTPUT).pullUp()
  p.level = null
  assert.isHigh(p)
  p.noPull()
  p.level = null
  assert.isFloating(p)
}

export function pnPullDown() {
  const p = Pin(1, 'A', OUTPUT).pullDown()
  p.level = null
  assert.isLow(p)
  p.noPull()
  p.level = null
  assert.isFloating(p)
}
