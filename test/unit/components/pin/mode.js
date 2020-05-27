// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import { UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL, newPin } from "components/pin"
import { newTrace } from "components/trace"

export function modeInitial() {
  const p1 = newPin(1, "A", UNCONNECTED)
  const p2 = newPin(2, "B", INPUT)
  const p3 = newPin(3, "C", OUTPUT)
  const p4 = newPin(4, "D", BIDIRECTIONAL)

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
  const p = newPin(1, "A", UNCONNECTED)
  expect(p.mode).to.equal(UNCONNECTED)
  p.mode = INPUT
  expect(p.mode).to.equal(INPUT)
  p.mode = OUTPUT
  expect(p.mode).to.equal(OUTPUT)
  p.mode = BIDIRECTIONAL
  expect(p.mode).to.equal(BIDIRECTIONAL)
}

export function modeOutToIn() {
  const p = newPin(1, "A", OUTPUT)
  const t = newTrace(p, newPin(2, "B", INPUT))
  p.level = 1
  expect(t.level).to.equal(1)
  p.mode = INPUT
  expect(t.level).to.be.null
}

export function modeBidiToIn() {
  const p = newPin(1, "A", BIDIRECTIONAL)
  const t = newTrace(p, newPin(2, "B", INPUT))
  p.level = 1
  expect(t.level).to.equal(1)
  p.mode = INPUT
  expect(t.level).to.be.null
}

export function modeUncToIn() {
  const p = newPin(1, "A", UNCONNECTED)
  const t = newTrace(p, newPin(2, "B", INPUT))
  p.level = 1
  expect(t.level).to.be.null
  p.mode = INPUT
  expect(t.level).to.be.null
}

export function modeBidiToOut() {
  const p = newPin(1, "A", BIDIRECTIONAL)
  const t = newTrace(p)
  p.level = 1
  expect(t.level).to.equal(1)
  p.mode = OUTPUT
  expect(t.level).to.equal(1)
}

export function modeUncToOut() {
  const p = newPin(1, "A", UNCONNECTED)
  const t = newTrace(p)
  p.level = 1
  expect(t.level).to.be.null
  p.mode = OUTPUT
  expect(t.level).to.equal(1)
}

export function modeInToUnc() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p)
  t.level = 1
  expect(p.level).to.equal(1)
  p.mode = UNCONNECTED
  expect(t.level).to.equal(1)
  expect(p.level).to.equal(1)
}
