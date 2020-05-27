// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import { newTrace } from "components/trace"
import { newPin, OUTPUT, INPUT } from "components/pin"

export function puInitial() {
  const t = newTrace().pullUp()
  expect(t.level).to.equal(1)
}

export function puModeInput() {
  const p = newPin(1, "A", OUTPUT)
  const t = newTrace(p).pullUp()

  p.level = 0
  expect(t.level).to.equal(0)
  p.mode = INPUT
  expect(t.level).to.equal(1)
}

export function puNoOutputs() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p).pullUp()
  expect(t.level).to.equal(1)
}

export function puHiOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = newTrace(p1, p2).pullUp()
  expect(t.level).to.equal(1)
}

export function puLoOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = newTrace(p1, p2).pullUp()
  expect(t.level).to.equal(0)
}

export function puNullOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  p1.level = null
  p2.level = null
  const t = newTrace(p1, p2).pullUp()
  expect(t.level).to.equal(1)
}

export function pdInitial() {
  const t = newTrace().pullDown()
  expect(t.level).to.equal(0)
}

export function pdModeInput() {
  const p = newPin(1, "A", OUTPUT)
  const t = newTrace(p).pullDown()

  p.level = 1
  expect(t.level).to.equal(1)
  p.mode = INPUT
  expect(t.level).to.equal(0)
}

export function pdNoOutputs() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p).pullDown()
  expect(t.level).to.equal(0)
}

export function pdHiOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = newTrace(p1, p2).pullDown()
  expect(t.level).to.equal(1)
}

export function pdLoOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = newTrace(p1, p2).pullDown()
  expect(t.level).to.equal(0)
}

export function pdNullOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  p1.level = null
  p2.level = null
  const t = newTrace(p1, p2).pullDown()
  expect(t.level).to.equal(0)
}

export function fltInitial() {
  const t = newTrace().float()
  expect(t.level).to.be.null
}

export function fltModeInput() {
  const p = newPin(1, "A", OUTPUT)
  const t = newTrace(p).float()

  p.level = 1
  expect(t.level).to.equal(1)
  p.mode = INPUT
  expect(t.level).to.be.null
}

export function fltNoOutputs() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p).float()
  expect(t.level).to.be.null
}

export function fltHiOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  p1.level = 1
  p2.level = 0
  const t = newTrace(p1, p2).float()
  expect(t.level).to.equal(1)
}

export function fltLoOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  p1.level = 0
  p2.level = 0
  const t = newTrace(p1, p2).float()
  expect(t.level).to.equal(0)
}

export function fltNullOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  p1.level = null
  p2.level = null
  const t = newTrace(p1, p2).float()
  expect(t.level).to.be.null
}
