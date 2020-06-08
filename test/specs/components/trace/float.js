// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import { Trace } from "components/trace"
import { Pin, OUTPUT, INPUT } from "components/pin"

export function puInitial() {
  const t = Trace().pullUp()
  expect(t.level).to.equal(1)
}

export function puModeInput() {
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p).pullUp()

  p.level = 0
  expect(t.level).to.equal(0)
  p.mode = INPUT
  expect(t.level).to.equal(1)
}

export function puNoOutputs() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p).pullUp()
  expect(t.level).to.equal(1)
}

export function puHiOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = Trace(p1, p2).pullUp()
  expect(t.level).to.equal(1)
}

export function puLoOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = Trace(p1, p2).pullUp()
  expect(t.level).to.equal(0)
}

export function puNullOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = null
  p2.level = null
  const t = Trace(p1, p2).pullUp()
  expect(t.level).to.equal(1)
}

export function pdInitial() {
  const t = Trace().pullDown()
  expect(t.level).to.equal(0)
}

export function pdModeInput() {
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p).pullDown()

  p.level = 1
  expect(t.level).to.equal(1)
  p.mode = INPUT
  expect(t.level).to.equal(0)
}

export function pdNoOutputs() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p).pullDown()
  expect(t.level).to.equal(0)
}

export function pdHiOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = Trace(p1, p2).pullDown()
  expect(t.level).to.equal(1)
}

export function pdLoOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = Trace(p1, p2).pullDown()
  expect(t.level).to.equal(0)
}

export function pdNullOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = null
  p2.level = null
  const t = Trace(p1, p2).pullDown()
  expect(t.level).to.equal(0)
}

export function pnInitial() {
  const t = Trace().pullNone()
  expect(t.level).to.be.null
}

export function pnModeInput() {
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p).pullNone()

  p.level = 1
  expect(t.level).to.equal(1)
  p.mode = INPUT
  expect(t.level).to.be.null
}

export function pnNoOutputs() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p).pullNone()
  expect(t.level).to.be.null
}

export function pnHiOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = Trace(p1, p2).pullNone()
  expect(t.level).to.equal(1)
}

export function pnLoOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = Trace(p1, p2).pullNone()
  expect(t.level).to.equal(0)
}

export function pnNullOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  p1.level = null
  p2.level = null
  const t = Trace(p1, p2).pullNone()
  expect(t.level).to.be.null
}
