// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import {
  Pin, INPUT, UNCONNECTED, OUTPUT, BIDIRECTIONAL,
} from "components/pin"
import { Trace } from "components/trace"

export function levelNoTrace() {
  const p = Pin(1, "A", INPUT)
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
  const p = Pin(1, "A", INPUT)
  p.level = 1
  p.updateLevel()
  expect(p.level).to.equal(1)
}

export function levelUnconnected() {
  const p = Pin(1, "A", UNCONNECTED)
  const t = Trace(p)

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
  const p = Pin(1, "A", INPUT)
  const t = Trace(p)

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
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p)

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
  const p = Pin(1, "A", BIDIRECTIONAL)
  const t = Trace(p)

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
  const p = Pin(1, "A", BIDIRECTIONAL)
  const t = Trace(p)

  t.set()
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.clear()
  expect(p.level).to.equal(0)
  expect(t.level).to.equal(0)

  t.level = -0.35
  expect(p.level).to.equal(-0.35)
  expect(t.level).to.equal(-0.35)

  p.set()
  expect(p.level).to.equal(1)
  expect(t.level).to.equal(1)

  p.float()
  expect(p.level).to.equal(null)
  expect(t.level).to.equal(null)
}

export function levelToggleHigh() {
  const p = Pin(1, "A")
  p.level = 0
  p.toggle()
  expect(p.level).to.equal(1)
}

export function levelToggleLow() {
  const p = Pin(1, "A")
  p.level = 1
  p.toggle()
  expect(p.level).to.equal(0)
}

export function levelToggleNone() {
  const p = Pin(1, "A")
  p.level = null
  p.toggle()
  expect(p.level).to.equal(null)
}