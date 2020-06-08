// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import {
  UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL, Pin,
} from "components/pin"
import { Trace } from "components/trace"

export function modeInitial() {
  const p1 = Pin(1, "A", UNCONNECTED)
  const p2 = Pin(2, "B", INPUT)
  const p3 = Pin(3, "C", OUTPUT)
  const p4 = Pin(4, "D", BIDIRECTIONAL)

  expect(p1.mode).to.equal(UNCONNECTED)
  expect(p1.input).to.be.false
  expect(p1.output).to.be.false

  expect(p2.mode).to.equal(INPUT)
  expect(p2.input).to.be.true
  expect(p2.output).to.be.false

  expect(p3.mode).to.equal(OUTPUT)
  expect(p3.input).to.be.false
  expect(p3.output).to.be.true

  expect(p4.mode).to.equal(BIDIRECTIONAL)
  expect(p4.input).to.be.true
  expect(p4.output).to.be.true
}

export function modeChange() {
  const p = Pin(1, "A", UNCONNECTED)
  expect(p.mode).to.equal(UNCONNECTED)
  p.mode = INPUT
  expect(p.mode).to.equal(INPUT)
  p.mode = OUTPUT
  expect(p.mode).to.equal(OUTPUT)
  p.mode = BIDIRECTIONAL
  expect(p.mode).to.equal(BIDIRECTIONAL)
}

export function modeOutToIn() {
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p, Pin(2, "B", INPUT))
  p.level = 1
  expect(t.level).to.equal(1)
  p.mode = INPUT
  expect(t.level).to.be.null
}

export function modeBidiToIn() {
  const p = Pin(1, "A", BIDIRECTIONAL)
  const t = Trace(p, Pin(2, "B", INPUT))
  p.level = 1
  expect(t.level).to.equal(1)
  p.mode = INPUT
  expect(t.level).to.be.null
}

export function modeUncToIn() {
  const p = Pin(1, "A", UNCONNECTED)
  const t = Trace(p, Pin(2, "B", INPUT))
  p.level = 1
  expect(t.level).to.be.null
  p.mode = INPUT
  expect(t.level).to.be.null
}

export function modeBidiToOut() {
  const p = Pin(1, "A", BIDIRECTIONAL)
  const t = Trace(p)
  p.level = 1
  expect(t.level).to.equal(1)
  p.mode = OUTPUT
  expect(t.level).to.equal(1)
}

export function modeUncToOut() {
  const p = Pin(1, "A", UNCONNECTED)
  const t = Trace(p)
  p.level = 1
  expect(t.level).to.be.null
  p.mode = OUTPUT
  expect(t.level).to.equal(1)
}

export function modeInToUnc() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p)
  t.level = 1
  expect(p.level).to.equal(1)
  p.mode = UNCONNECTED
  expect(t.level).to.equal(1)
  expect(p.level).to.equal(1)
}
