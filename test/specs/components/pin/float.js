// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import {
  Pin, OUTPUT, UNCONNECTED, INPUT, BIDIRECTIONAL,
} from "components/pin"
import { Trace } from "components/trace"

export function puInitial() {
  const p = Pin(1, "A", OUTPUT).pullUp()
  expect(p.level).to.equal(1)
}

export function puUnconnected() {
  const p = Pin(1, "A", UNCONNECTED).pullUp()
  p.level = 0
  expect(p.level).to.equal(0)
  p.level = null
  expect(p.level).to.equal(1)
}

export function puInput() {
  const p = Pin(1, "A", INPUT).pullUp()
  const t = Trace(p)
  t.level = 0
  expect(p.level).to.equal(0)
  t.level = null
  expect(p.level).to.equal(1)
}

export function puOutput() {
  const p = Pin(1, "A", OUTPUT).pullUp()
  const t = Trace(p)
  p.level = 0
  expect(t.level).to.equal(0)
  p.level = null
  expect(t.level).to.equal(1)
}

export function puBidirectional() {
  const p = Pin(1, "A", BIDIRECTIONAL).pullUp()
  const t = Trace(p)
  p.level = 0
  expect(t.level).to.equal(0)
  p.level = null
  expect(t.level).to.equal(1)
}

export function puAfter() {
  const p = Pin(1, "A", UNCONNECTED)
  expect(p.level).to.be.null
  p.pullUp()
  expect(p.level).to.equal(1)
}

export function pdInitial() {
  const p = Pin(1, "A", OUTPUT).pullDown()
  expect(p.level).to.equal(0)
}

export function pdUnconnected() {
  const p = Pin(1, "A", UNCONNECTED).pullDown()
  p.level = 1
  expect(p.level).to.equal(1)
  p.level = null
  expect(p.level).to.equal(0)
}

export function pdInput() {
  const p = Pin(1, "A", INPUT).pullDown()
  const t = Trace(p)
  t.level = 1
  expect(p.level).to.equal(1)
  t.level = null
  expect(p.level).to.equal(0)
}

export function pdOutput() {
  const p = Pin(1, "A", OUTPUT).pullDown()
  const t = Trace(p)
  p.level = 1
  expect(t.level).to.equal(1)
  p.level = null
  expect(t.level).to.equal(0)
}

export function pdBidirectional() {
  const p = Pin(1, "A", BIDIRECTIONAL).pullDown()
  const t = Trace(p)
  p.level = 1
  expect(t.level).to.equal(1)
  p.level = null
  expect(t.level).to.equal(0)
}

export function pdAfter() {
  const p = Pin(1, "A", UNCONNECTED)
  expect(p.level).to.be.null
  p.pullDown()
  expect(p.level).to.equal(0)
}

export function pnInitial() {
  const p = Pin(1, "A", OUTPUT).pullNone()
  expect(p.level).to.be.null
}

export function pnPullUp() {
  const p = Pin(1, "A", OUTPUT).pullUp()
  p.level = null
  expect(p.level).to.equal(1)
  p.pullNone()
  p.level = null
  expect(p.level).to.be.null
}

export function pnPullDown() {
  const p = Pin(1, "A", OUTPUT).pullDown()
  p.level = null
  expect(p.level).to.equal(0)
  p.pullNone()
  p.level = null
  expect(p.level).to.be.null
}
