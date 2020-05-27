// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import { newPin, OUTPUT, UNCONNECTED, INPUT, BIDIRECTIONAL } from "components/new-pin"
import { newTrace } from "components/new-trace"

export function puInitial() {
  const p = newPin(1, "A", OUTPUT).pullUp()
  expect(p.level).to.equal(1)
}

export function puUnconnected() {
  const p = newPin(1, "A", UNCONNECTED).pullUp()
  p.level = 0
  expect(p.level).to.equal(0)
  p.level = null
  expect(p.level).to.equal(1)
}

export function puInput() {
  const p = newPin(1, "A", INPUT).pullUp()
  const t = newTrace(p)
  t.level = 0
  expect(p.level).to.equal(0)
  t.level = null
  expect(p.level).to.equal(1)
}

export function puOutput() {
  const p = newPin(1, "A", OUTPUT).pullUp()
  const t = newTrace(p)
  p.level = 0
  expect(t.level).to.equal(0)
  p.level = null
  expect(t.level).to.equal(1)
}

export function puBidirectional() {
  const p = newPin(1, "A", BIDIRECTIONAL).pullUp()
  const t = newTrace(p)
  p.level = 0
  expect(t.level).to.equal(0)
  p.level = null
  expect(t.level).to.equal(1)
}

export function puAfter() {
  const p = newPin(1, "A", UNCONNECTED)
  expect(p.level).to.be.null
  p.pullUp()
  expect(p.level).to.equal(1)
}

export function pdInitial() {
  const p = newPin(1, "A", OUTPUT).pullDown()
  expect(p.level).to.equal(0)
}

export function pdUnconnected() {
  const p = newPin(1, "A", UNCONNECTED).pullDown()
  p.level = 1
  expect(p.level).to.equal(1)
  p.level = null
  expect(p.level).to.equal(0)
}

export function pdInput() {
  const p = newPin(1, "A", INPUT).pullDown()
  const t = newTrace(p)
  t.level = 1
  expect(p.level).to.equal(1)
  t.level = null
  expect(p.level).to.equal(0)
}

export function pdOutput() {
  const p = newPin(1, "A", OUTPUT).pullDown()
  const t = newTrace(p)
  p.level = 1
  expect(t.level).to.equal(1)
  p.level = null
  expect(t.level).to.equal(0)
}

export function pdBidirectional() {
  const p = newPin(1, "A", BIDIRECTIONAL).pullDown()
  const t = newTrace(p)
  p.level = 1
  expect(t.level).to.equal(1)
  p.level = null
  expect(t.level).to.equal(0)
}

export function pdAfter() {
  const p = newPin(1, "A", UNCONNECTED)
  expect(p.level).to.be.null
  p.pullDown()
  expect(p.level).to.equal(0)
}

export function fltInitial() {
  const p = newPin(1, "A", OUTPUT).float()
  expect(p.level).to.be.null
}

export function fltPullUp() {
  const p = newPin(1, "A", OUTPUT).pullUp()
  p.level = null
  expect(p.level).to.equal(1)
  p.float()
  p.level = null
  expect(p.level).to.be.null
}

export function fltPullDown() {
  const p = newPin(1, "A", OUTPUT).pullDown()
  p.level = null
  expect(p.level).to.equal(0)
  p.float()
  p.level = null
  expect(p.level).to.be.null
}
