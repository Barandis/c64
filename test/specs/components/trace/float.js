// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from "test/helper"
import { Trace, Pin, OUTPUT, INPUT } from "components/"

export function puInitial() {
  const t = Trace().pullUp()
  assert(t.high)
}

export function puModeInput() {
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p).pullUp()

  p.level = 0
  assert(t.low)
  p.mode = INPUT
  assert(t.high)
}

export function puNoOutputs() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p).pullUp()
  assert(t.high)
}

export function puHiOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = Trace(p1, p2).pullUp()
  assert(t.high)
}

export function puLoOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = Trace(p1, p2).pullUp()
  assert(t.low)
}

export function puNullOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = null
  p2.level = null
  const t = Trace(p1, p2).pullUp()
  assert(t.high)
}

export function pdInitial() {
  const t = Trace().pullDown()
  assert(t.low)
}

export function pdModeInput() {
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p).pullDown()

  p.level = 1
  assert(t.high)
  p.mode = INPUT
  assert(t.low)
}

export function pdNoOutputs() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p).pullDown()
  assert(t.low)
}

export function pdHiOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = Trace(p1, p2).pullDown()
  assert(t.high)
}

export function pdLoOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = Trace(p1, p2).pullDown()
  assert(t.low)
}

export function pdNullOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = null
  p2.level = null
  const t = Trace(p1, p2).pullDown()
  assert(t.low)
}

export function pnInitial() {
  const t = Trace().noPull()
  assert(t.floating)
}

export function pnModeInput() {
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p).noPull()

  p.level = 1
  assert(t.high)
  p.mode = INPUT
  assert(t.floating)
}

export function pnNoOutputs() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p).noPull()
  assert(t.floating)
}

export function pnHiOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = Trace(p1, p2).noPull()
  assert(t.high)
}

export function pnLoOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = Trace(p1, p2).noPull()
  assert(t.low)
}

export function pnNullOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = null
  p2.level = null
  const t = Trace(p1, p2).noPull()
  assert(t.floating)
}
