// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import { Trace } from "components/trace"
import {
  Pin, INPUT, OUTPUT, UNCONNECTED, BIDIRECTIONAL,
} from "components/pin"

export function levelDirectUnconnected() {
  const t = Trace()
  t.set()
  expect(t.high).to.be.true
  expect(t.low).to.be.false
  expect(t.null).to.be.false

  t.clear()
  expect(t.high).to.be.false
  expect(t.low).to.be.true
  expect(t.null).to.be.false

  t.float()
  expect(t.high).to.be.false
  expect(t.low).to.be.false
  expect(t.null).to.be.true

  t.level = -0.35
  expect(t.level).to.equal(-0.35)
}

export function levelDirectInput() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p)

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
  const p1 = Pin(1, "HI", OUTPUT)
  const p2 = Pin(2, "LO", OUTPUT)
  const t = Trace(p1, p2)

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
  const p1 = Pin(1, "HI", OUTPUT)
  const p2 = Pin(2, "LO", OUTPUT)
  const t = Trace(p1, p2)

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
  const p1 = Pin(1, "HI", OUTPUT)
  const p2 = Pin(2, "LO", OUTPUT)
  const t = Trace(p1, p2)

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
  const p = Pin(1, "A", UNCONNECTED)
  const t = Trace(p)
  t.level = 0

  p.level = 1
  expect(t.level).to.equal(0)
  expect(p.level).to.equal(1)
}

export function levelPinInput() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p)
  t.level = 0

  p.level = 1
  expect(t.level).to.equal(0)
  expect(p.level).to.equal(0)
}

export function levelPinOutput() {
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p)
  t.level = 0

  p.level = 1
  expect(t.level).to.equal(1)
  expect(p.level).to.equal(1)
}

export function levelPinBidirectional() {
  const p = Pin(1, "A", BIDIRECTIONAL)
  const t = Trace(p)
  t.level = 0

  p.level = 1
  expect(t.level).to.equal(1)
  expect(p.level).to.equal(1)

  t.level = null
  expect(t.level).to.equal(null)
  expect(p.level).to.equal(null)
}

export function levelPinHiOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  const p3 = Pin(3, "C", OUTPUT)
  const t = Trace(p1, p2, p3)

  p2.level = 1
  p3.level = 1

  p1.level = 0
  expect(t.level).to.equal(0)
}

export function levelPinLoOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  const p3 = Pin(3, "C", OUTPUT)
  const t = Trace(p1, p2, p3)

  p2.level = 0
  p3.level = 0

  p1.level = 1
  expect(t.level).to.equal(1)
}
