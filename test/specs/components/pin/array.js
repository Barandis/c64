// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from "test/helper"
import { Pin, PinArray } from "components"

export function arrayContains() {
  const p1 = Pin(1, "A")
  const p2 = Pin(2, "B")
  const p3 = Pin(3, "C")
  const p4 = Pin(4, "D")
  const p5 = Pin(5, "E")

  const pa = PinArray(p1, p2, p3, p4)
  assert(pa.includes(p1))
  assert(pa.includes(p2))
  assert(pa.includes(p3))
  assert(pa.includes(p4))
  assert(!pa.includes(p5))
}

export function arrayByNumber() {
  const p1 = Pin(1, "A")
  const p2 = Pin(2, "B")
  const p3 = Pin(3, "C")
  const p4 = Pin(4, "D")

  const pa = PinArray(p1, p2, p3, p4)
  assert(pa[1] === p1)
  assert(pa[2] === p2)
  assert(pa[3] === p3)
  assert(pa[4] === p4)
}

export function arrayByName() {
  const p1 = Pin(1, "A")
  const p2 = Pin(2, "B")
  const p3 = Pin(3, "C")
  const p4 = Pin(4, "D")

  const pa = PinArray(p1, p2, p3, p4)
  assert(pa.A === p1)
  assert(pa.B === p2)
  assert(pa.C === p3)
  assert(pa.D === p4)
}
