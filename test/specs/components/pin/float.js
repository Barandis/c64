// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import Pin from 'components/pin'
import Trace from 'components/trace'

const UNCONNECTED = Pin.UNCONNECTED
const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT
const BIDIRECTIONAL = Pin.BIDIRECTIONAL

export function puInitial() {
  const p = new Pin(1, 'A', OUTPUT).pullUp()
  assert(p.high)
}

export function puUnconnected() {
  const p = new Pin(1, 'A', UNCONNECTED).pullUp()
  p.level = 0
  assert(p.low)
  p.level = null
  assert(p.high)
}

export function puInput() {
  const p = new Pin(1, 'A', INPUT).pullUp()
  const t = new Trace(p)
  t.level = 0
  assert(p.low)
  t.level = null
  assert(p.high)
}

export function puOutput() {
  const p = new Pin(1, 'A', OUTPUT).pullUp()
  const t = new Trace(p)
  p.level = 0
  assert(t.low)
  p.level = null
  assert(t.high)
}

export function puBidirectional() {
  const p = new Pin(1, 'A', BIDIRECTIONAL).pullUp()
  const t = new Trace(p)
  p.level = 0
  assert(t.low)
  p.level = null
  assert(t.high)
}

export function puAfter() {
  const p = new Pin(1, 'A', UNCONNECTED)
  assert(p.floating)
  p.pullUp()
  assert(p.high)
}

export function pdInitial() {
  const p = new Pin(1, 'A', OUTPUT).pullDown()
  assert(p.low)
}

export function pdUnconnected() {
  const p = new Pin(1, 'A', UNCONNECTED).pullDown()
  p.level = 1
  assert(p.high)
  p.level = null
  assert(p.low)
}

export function pdInput() {
  const p = new Pin(1, 'A', INPUT).pullDown()
  const t = new Trace(p)
  t.level = 1
  assert(p.high)
  t.level = null
  assert(p.low)
}

export function pdOutput() {
  const p = new Pin(1, 'A', OUTPUT).pullDown()
  const t = new Trace(p)
  p.level = 1
  assert(t.high)
  p.level = null
  assert(t.low)
}

export function pdBidirectional() {
  const p = new Pin(1, 'A', BIDIRECTIONAL).pullDown()
  const t = new Trace(p)
  p.level = 1
  assert(t.high)
  p.level = null
  assert(t.low)
}

export function pdAfter() {
  const p = new Pin(1, 'A', UNCONNECTED)
  assert(p.floating)
  p.pullDown()
  assert(p.low)
}

export function pnInitial() {
  const p = new Pin(1, 'A', OUTPUT).noPull()
  assert(p.floating)
}

export function pnPullUp() {
  const p = new Pin(1, 'A', OUTPUT).pullUp()
  p.level = null
  assert(p.high)
  p.noPull()
  p.level = null
  assert(p.floating)
}

export function pnPullDown() {
  const p = new Pin(1, 'A', OUTPUT).pullDown()
  p.level = null
  assert(p.low)
  p.noPull()
  p.level = null
  assert(p.floating)
}
