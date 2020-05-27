// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import { newPin, INPUT, UNCONNECTED, OUTPUT, BIDIRECTIONAL } from "components/pin"
import { newTrace } from "components/trace"

export function levelNoTrace() {
  const p = newPin(1, "A", INPUT)
  expect(p.level).to.be.null
  expect(p.high).to.be.false
  expect(p.low).to.be.false
  expect(p.null).to.be.true

  p.level = 1
  expect(p.level).to.equal(1)
  expect(p.high).to.be.true
  expect(p.low).to.be.false
  expect(p.null).to.be.false

  p.level = 0
  expect(p.level).to.equal(0)
  expect(p.high).to.be.false
  expect(p.low).to.be.true
  expect(p.null).to.be.false

  p.level = -0.35
  expect(p.level).to.equal(-0.35)
  expect(p.high).to.be.false
  expect(p.low).to.be.true
  expect(p.null).to.be.false
}

export function levelUpdateNoTrace() {
  const p = newPin(1, "A", INPUT)
  p.level = 1
  p.updateLevel()
  expect(p.level).to.equal(1)
}

export function levelUnconnected() {
  const p = newPin(1, "A", UNCONNECTED)
  const t = newTrace(p)

  t.level = 1
  expect(p.level).to.be.null
  expect(t.level).to.equal(1)

  p.level = 1
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.level = 0
  expect(p.level).to.equal(0)
  expect(t.level).to.equal(1)

  p.level = -0.35
  expect(p.level).to.equal(-0.35)
  expect(t.level).to.equal(1)

  p.level = null
  expect(p.level).to.equal(null)
  expect(t.level).to.equal(1)
}

export function levelInput() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p)

  t.level = 1
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.level = 1
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.level = 0
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.level = -0.35
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.level = null
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)
}

export function levelOutput() {
  const p = newPin(1, "A", OUTPUT)
  const t = newTrace(p)

  t.level = 1
  expect(p.level).to.equal(null)
  expect(t.level).to.equal(1)

  p.level = 1
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.level = 0
  expect(p.level).to.equal(0)
  expect(t.level).to.equal(0)

  p.level = -0.35
  expect(p.level).to.equal(-0.35)
  expect(t.level).to.equal(-0.35)

  p.level = null
  expect(p.level).to.equal(null)
  expect(t.level).to.equal(null)
}

export function levelBidirectional() {
  const p = newPin(1, "A", BIDIRECTIONAL)
  const t = newTrace(p)

  t.level = 1
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.level = 0
  expect(p.level).to.equal(0)
  expect(t.level).to.equal(0)

  t.level = -0.35
  expect(p.level).to.equal(-0.35)
  expect(t.level).to.equal(-0.35)

  p.level = null
  expect(p.level).to.equal(null)
  expect(t.level).to.equal(null)
}

export function levelOptions() {
  const p = newPin(1, "A", BIDIRECTIONAL)
  const t = newTrace(p)

  t.raise()
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.lower()
  expect(p.level).to.equal(0)
  expect(t.level).to.equal(0)

  t.level = -0.35
  expect(p.level).to.equal(-0.35)
  expect(t.level).to.equal(-0.35)

  p.raise()
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.reset()
  expect(p.level).to.equal(null)
  expect(t.level).to.equal(null)
}

export function levelToggleHigh() {
  const p = newPin(1, "A")
  p.level = 0
  p.toggle()
  expect(p.level).to.equal(1)
}

export function levelToggleLow() {
  const p = newPin(1, "A")
  p.level = 1
  p.toggle()
  expect(p.level).to.equal(0)
}

export function levelToggleNone() {
  const p = newPin(1, "A")
  p.level = null
  p.toggle()
  expect(p.level).to.equal(null)
}
