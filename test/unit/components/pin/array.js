// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import { newPin, newPinArray } from "components/pin"

export function arrayContains() {
  const p1 = newPin(1, "A")
  const p2 = newPin(2, "B")
  const p3 = newPin(3, "C")
  const p4 = newPin(4, "D")
  const p5 = newPin(5, "E")

  const pa = newPinArray(p1, p2, p3, p4)
  expect(pa).to.include(p1)
  expect(pa).to.include(p2)
  expect(pa).to.include(p3)
  expect(pa).to.include(p4)
  expect(pa).not.to.include(p5)
}

export function arrayByNumber() {
  const p1 = newPin(1, "A")
  const p2 = newPin(2, "B")
  const p3 = newPin(3, "C")
  const p4 = newPin(4, "D")

  const pa = newPinArray(p1, p2, p3, p4)
  expect(pa[1]).to.equal(p1)
  expect(pa[2]).to.equal(p2)
  expect(pa[3]).to.equal(p3)
  expect(pa[4]).to.equal(p4)
}

export function arrayByName() {
  const p1 = newPin(1, "A")
  const p2 = newPin(2, "B")
  const p3 = newPin(3, "C")
  const p4 = newPin(4, "D")

  const pa = newPinArray(p1, p2, p3, p4)
  expect(pa.A).to.equal(p1)
  expect(pa.B).to.equal(p2)
  expect(pa.C).to.equal(p3)
  expect(pa.D).to.equal(p4)
}
