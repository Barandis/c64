// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import { newTrace } from "components/new-trace"
import { newPin, INPUT, OUTPUT, UNCONNECTED, BIDIRECTIONAL } from "components/new-pin"

export function levelDirectUnconnected() {
  const t = newTrace()
  t.raise()
  expect(t.high).to.be.true
  expect(t.low).to.be.false
  expect(t.none).to.be.false

  t.lower()
  expect(t.high).to.be.false
  expect(t.low).to.be.true
  expect(t.none).to.be.false

  t.reset()
  expect(t.high).to.be.false
  expect(t.low).to.be.false
  expect(t.none).to.be.true

  t.level = -0.35
  expect(t.level).to.equal(-0.35)
}

export function levelDirectInput() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p)

  t.level = 1
  expect(t.level).to.equal(1)
  t.level = 0
  expect(t.level).to.equal(0)
  t.level = null
  expect(t.level).to.be.null
  t.level = -0.35
  expect(t.level).to.equal(-0.35)
}

export function levelDirectHiOutput() {
  const p1 = newPin(1, "HI", OUTPUT)
  const p2 = newPin(2, "LO", OUTPUT)
  const t = newTrace(p1, p2)

  p1.level = 1
  p2.level = 0

  t.level = 1
  expect(t.level).to.equal(1)
  t.level = 0
  expect(t.level).to.equal(1)
  t.level = null
  expect(t.level).to.equal(1)
  t.level = -0.35
  expect(t.level).to.equal(1)
}

export function levelDirectLoOutput() {
  const p1 = newPin(1, "HI", OUTPUT)
  const p2 = newPin(2, "LO", OUTPUT)
  const t = newTrace(p1, p2)

  p1.level = 0
  p2.level = 0

  t.level = 1
  expect(t.level).to.equal(0)
  t.level = 0
  expect(t.level).to.equal(0)
  t.level = null
  expect(t.level).to.equal(0)
  t.level = -0.35
  expect(t.level).to.equal(0)
}

export function levelDirectNullOutput() {
  const p1 = newPin(1, "HI", OUTPUT)
  const p2 = newPin(2, "LO", OUTPUT)
  const t = newTrace(p1, p2)

  p1.level = null
  p2.level = null

  t.level = 1
  expect(t.level).to.equal(1)
  t.level = 0
  expect(t.level).to.equal(0)
  t.level = null
  expect(t.level).to.be.null
  t.level = -0.35
  expect(t.level).to.equal(-0.35)
}

export function levelPinUnconnected() {
  const p = newPin(1, "A", UNCONNECTED)
  const t = newTrace(p)
  t.level = 0

  p.level = 1
  expect(t.level).to.equal(0)
  expect(p.level).to.equal(1)
}

export function levelPinInput() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p)
  t.level = 0

  p.level = 1
  expect(t.level).to.equal(0)
  expect(p.level).to.equal(0)
}

export function levelPinOutput() {
  const p = newPin(1, "A", OUTPUT)
  const t = newTrace(p)
  t.level = 0

  p.level = 1
  expect(t.level).to.equal(1)
  expect(p.level).to.equal(1)
}

export function levelPinBidirectional() {
  const p = newPin(1, "A", BIDIRECTIONAL)
  const t = newTrace(p)
  t.level = 0

  p.level = 1
  expect(t.level).to.equal(1)
  expect(p.level).to.equal(1)

  t.level = null
  expect(t.level).to.equal(null)
  expect(p.level).to.equal(null)
}

export function levelPinHiOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  const p3 = newPin(3, "C", OUTPUT)
  const t = newTrace(p1, p2, p3)

  p2.level = 1
  p3.level = 1

  p1.level = 0
  expect(t.level).to.equal(0)
}

export function levelPinLoOutputs() {
  const p1 = newPin(1, "A", OUTPUT)
  const p2 = newPin(2, "B", OUTPUT)
  const p3 = newPin(3, "C", OUTPUT)
  const t = newTrace(p1, p2, p3)

  p2.level = 0
  p3.level = 0

  p1.level = 1
  expect(t.level).to.equal(1)
}
