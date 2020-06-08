// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from "test/helper"
import {
  Trace, Pin, INPUT, OUTPUT, UNCONNECTED, BIDIRECTIONAL,
} from "components"

export function levelDirectUnconnected() {
  const t = Trace()
  t.set()
  assert(t.high)
  assert(!t.low)
  assert(!t.floating)

  t.clear()
  assert(!t.high)
  assert(t.low)
  assert(!t.floating)

  t.float()
  assert(!t.high)
  assert(!t.low)
  assert(t.floating)

  t.level = -0.35
  assert(t.level === -0.35)
}

export function levelDirectInput() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p)

  t.level = 1
  assert(t.level === 1)
  t.level = 0
  assert(t.level === 0)
  t.level = null
  assert(t.level === null)
  t.level = -0.35
  assert(t.level === -0.35)
}

export function levelDirectHiOutput() {
  const p1 = Pin(1, "HI", OUTPUT)
  const p2 = Pin(2, "LO", OUTPUT)
  const t = Trace(p1, p2)

  p1.level = 1
  p2.level = 0

  t.level = 1
  assert(t.level === 1)
  t.level = 0
  assert(t.level === 1)
  t.level = null
  assert(t.level === 1)
  t.level = -0.35
  assert(t.level === 1)
}

export function levelDirectLoOutput() {
  const p1 = Pin(1, "HI", OUTPUT)
  const p2 = Pin(2, "LO", OUTPUT)
  const t = Trace(p1, p2)

  p1.level = 0
  p2.level = 0

  t.level = 1
  assert(t.level === 0)
  t.level = 0
  assert(t.level === 0)
  t.level = null
  assert(t.level === 0)
  t.level = -0.35
  assert(t.level === 0)
}

export function levelDirectNullOutput() {
  const p1 = Pin(1, "HI", OUTPUT)
  const p2 = Pin(2, "LO", OUTPUT)
  const t = Trace(p1, p2)

  p1.level = null
  p2.level = null

  t.level = 1
  assert(t.level === 1)
  t.level = 0
  assert(t.level === 0)
  t.level = null
  assert(t.level === null)
  t.level = -0.35
  assert(t.level === -0.35)
}

export function levelPinUnconnected() {
  const p = Pin(1, "A", UNCONNECTED)
  const t = Trace(p)
  t.level = 0

  p.level = 1
  assert(t.level === 0)
  assert(p.level === 1)
}

export function levelPinInput() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p)
  t.level = 0

  p.level = 1
  assert(t.level === 0)
  assert(p.level === 0)
}

export function levelPinOutput() {
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p)
  t.level = 0

  p.level = 1
  assert(t.level === 1)
  assert(p.level === 1)
}

export function levelPinBidirectional() {
  const p = Pin(1, "A", BIDIRECTIONAL)
  const t = Trace(p)
  t.level = 0

  p.level = 1
  assert(t.level === 1)
  assert(p.level === 1)

  t.level = null
  assert(t.level === null)
  assert(p.level === null)
}

export function levelPinHiOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  const p3 = Pin(3, "C", OUTPUT)
  const t = Trace(p1, p2, p3)

  p2.level = 1
  p3.level = 1

  p1.level = 0
  assert(t.level === 0)
}

export function levelPinLoOutputs() {
  const p1 = Pin(1, "A", OUTPUT)
  const p2 = Pin(2, "B", OUTPUT)
  const p3 = Pin(3, "C", OUTPUT)
  const t = Trace(p1, p2, p3)

  p2.level = 0
  p3.level = 0

  p1.level = 1
  assert(t.level === 1)
}
