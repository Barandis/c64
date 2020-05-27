/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, bin, deviceTraces } from "test/helper"
import { new82S100 } from "chips/82S100"

// This program was adapted from a C program that provides a 64k table of outputs for PLA based on
// all of the possible inputs. The original is located at
// http://www.zimmers.net/anonftp/pub/cbm/firmware/computers/c64/pla.c.

/* eslint-disable complexity, camelcase */
function getExpected(input) {
  const cas_ = !!(input & (1 << 0))
  const loram_ = !!(input & (1 << 1))
  const hiram_ = !!(input & (1 << 2))
  const charen_ = !!(input & (1 << 3))
  const va14_ = !!(input & (1 << 4))
  const a15 = !!(input & (1 << 5))
  const a14 = !!(input & (1 << 6))
  const a13 = !!(input & (1 << 7))
  const a12 = !!(input & (1 << 8))
  const ba = !!(input & (1 << 9))
  const aec_ = !!(input & (1 << 10))
  const r_w_ = !!(input & (1 << 11))
  const exrom_ = !!(input & (1 << 12))
  const game_ = !!(input & (1 << 13))
  const va13 = !!(input & (1 << 14))
  const va12 = !!(input & (1 << 15))

  const f0 =
    (loram_ && hiram_ && a15 && !a14 && a13 && !aec_ && r_w_ && game_) ||
    (hiram_ && a15 && a14 && a13 && !aec_ && r_w_ && game_) ||
    (hiram_ && a15 && a14 && a13 && !aec_ && r_w_ && !exrom_ && !game_) ||
    (hiram_ && !charen_ && a15 && a14 && !a13 && a12 && !aec_ && r_w_ && game_) ||
    (loram_ && !charen_ && a15 && a14 && !a13 && a12 && !aec_ && r_w_ && game_) ||
    (hiram_ && !charen_ && a15 && a14 && !a13 && a12 && !aec_ && r_w_ && !exrom_ && !game_) ||
    (va14_ && aec_ && game_ && !va13 && va12) ||
    (va14_ && aec_ && !exrom_ && !game_ && !va13 && va12) ||
    (hiram_ && charen_ && a15 && a14 && !a13 && a12 && ba && !aec_ && r_w_ && game_) ||
    (hiram_ && charen_ && a15 && a14 && !a13 && a12 && !aec_ && !r_w_ && game_) ||
    (loram_ && charen_ && a15 && a14 && !a13 && a12 && ba && !aec_ && r_w_ && game_) ||
    (loram_ && charen_ && a15 && a14 && !a13 && a12 && !aec_ && !r_w_ && game_) ||
    (hiram_ && charen_ && a15 && a14 && !a13 && a12 && ba && !aec_ && r_w_ && !exrom_ && !game_) ||
    (hiram_ && charen_ && a15 && a14 && !a13 && a12 && !aec_ && !r_w_ && !exrom_ && !game_) ||
    (loram_ && charen_ && a15 && a14 && !a13 && a12 && ba && !aec_ && r_w_ && !exrom_ && !game_) ||
    (loram_ && charen_ && a15 && a14 && !a13 && a12 && !aec_ && !r_w_ && !exrom_ && !game_) ||
    (a15 && a14 && !a13 && a12 && ba && !aec_ && r_w_ && exrom_ && !game_) ||
    (a15 && a14 && !a13 && a12 && !aec_ && !r_w_ && exrom_ && !game_) ||
    (loram_ && hiram_ && a15 && !a14 && !a13 && !aec_ && r_w_ && !exrom_) ||
    (a15 && !a14 && !a13 && !aec_ && exrom_ && !game_) ||
    (hiram_ && a15 && !a14 && a13 && !aec_ && r_w_ && !exrom_ && !game_) ||
    (a15 && a14 && a13 && !aec_ && exrom_ && !game_) ||
    (aec_ && exrom_ && !game_ && va13 && va12) ||
    (!a15 && !a14 && a12 && exrom_ && !game_) ||
    (!a15 && !a14 && a13 && exrom_ && !game_) ||
    (!a15 && a14 && exrom_ && !game_) ||
    (a15 && !a14 && a13 && exrom_ && !game_) ||
    (a15 && a14 && !a13 && !a12 && exrom_ && !game_) ||
    cas_
  const f1 = !loram_ || !hiram_ || !a15 || a14 || !a13 || aec_ || !r_w_ || !game_
  const f2 =
    (!hiram_ || !a15 || !a14 || !a13 || aec_ || !r_w_ || !game_) &&
    (!hiram_ || !a15 || !a14 || !a13 || aec_ || !r_w_ || exrom_ || game_)
  const f3 =
    (!hiram_ || charen_ || !a15 || !a14 || a13 || !a12 || aec_ || !r_w_ || !game_) &&
    (!loram_ || charen_ || !a15 || !a14 || a13 || !a12 || aec_ || !r_w_ || !game_) &&
    (!hiram_ || charen_ || !a15 || !a14 || a13 || !a12 || aec_ || !r_w_ || exrom_ || game_) &&
    (!va14_ || !aec_ || !game_ || va13 || !va12) &&
    (!va14_ || !aec_ || exrom_ || game_ || va13 || !va12)
  const f4 = cas_ || !a15 || !a14 || a13 || !a12 || aec_ || r_w_
  const f5 =
    (!hiram_ || !charen_ || !a15 || !a14 || a13 || !a12 || !ba || aec_ || !r_w_ || !game_) &&
    (!hiram_ || !charen_ || !a15 || !a14 || a13 || !a12 || aec_ || r_w_ || !game_) &&
    (!loram_ || !charen_ || !a15 || !a14 || a13 || !a12 || !ba || aec_ || !r_w_ || !game_) &&
    (!loram_ || !charen_ || !a15 || !a14 || a13 || !a12 || aec_ || r_w_ || !game_) &&
    (!hiram_ ||
      !charen_ ||
      !a15 ||
      !a14 ||
      a13 ||
      !a12 ||
      !ba ||
      aec_ ||
      !r_w_ ||
      exrom_ ||
      game_) &&
    (!hiram_ || !charen_ || !a15 || !a14 || a13 || !a12 || aec_ || r_w_ || exrom_ || game_) &&
    (!loram_ ||
      !charen_ ||
      !a15 ||
      !a14 ||
      a13 ||
      !a12 ||
      !ba ||
      aec_ ||
      !r_w_ ||
      exrom_ ||
      game_) &&
    (!loram_ || !charen_ || !a15 || !a14 || a13 || !a12 || aec_ || r_w_ || exrom_ || game_) &&
    (!a15 || !a14 || a13 || !a12 || !ba || aec_ || !r_w_ || !exrom_ || game_) &&
    (!a15 || !a14 || a13 || !a12 || aec_ || r_w_ || !exrom_ || game_)
  const f6 =
    (!loram_ || !hiram_ || !a15 || a14 || a13 || aec_ || !r_w_ || exrom_) &&
    (!a15 || a14 || a13 || aec_ || !exrom_ || game_)
  const f7 =
    (!hiram_ || !a15 || a14 || !a13 || aec_ || !r_w_ || exrom_ || game_) &&
    (!a15 || !a14 || !a13 || aec_ || !exrom_ || game_) &&
    (!aec_ || !exrom_ || game_ || !va13 || !va12)

  let output = 0
  if (f0) {
    output |= 1 << 0
  }
  if (f1) {
    output |= 1 << 1
  }
  if (f2) {
    output |= 1 << 2
  }
  if (f3) {
    output |= 1 << 3
  }
  if (f4) {
    output |= 1 << 4
  }
  if (f5) {
    output |= 1 << 5
  }
  if (f6) {
    output |= 1 << 6
  }
  if (f7) {
    output |= 1 << 7
  }

  return output
}
/* eslint-enable complexity, camelcase */

describe("82S100 Programmable Logic Array", () => {
  const chip = new82S100()
  const traces = deviceTraces(chip)

  const bitValue = (input, bit) => (input & (1 << bit)) >> bit

  function applyInputs(input) {
    traces.I0.level = bitValue(input, 0)
    traces.I1.level = bitValue(input, 1)
    traces.I2.level = bitValue(input, 2)
    traces.I3.level = bitValue(input, 3)
    traces.I4.level = bitValue(input, 4)
    traces.I5.level = bitValue(input, 5)
    traces.I6.level = bitValue(input, 6)
    traces.I7.level = bitValue(input, 7)
    traces.I8.level = bitValue(input, 8)
    traces.I9.level = bitValue(input, 9)
    traces.I10.level = bitValue(input, 10)
    traces.I11.level = bitValue(input, 11)
    traces.I12.level = bitValue(input, 12)
    traces.I13.level = bitValue(input, 13)
    traces.I14.level = bitValue(input, 14)
    traces.I15.level = bitValue(input, 15)
  }

  function outputValue() {
    let output = 0
    output |= traces.F0.level << 0
    output |= traces.F1.level << 1
    output |= traces.F2.level << 2
    output |= traces.F3.level << 3
    output |= traces.F4.level << 4
    output |= traces.F5.level << 5
    output |= traces.F6.level << 6
    output |= traces.F7.level << 7
    return output
  }

  it("disables all outputs if _OE is set high", () => {
    traces._OE.raise()
    expect(traces.F0.null).to.be.true
    expect(traces.F1.null).to.be.true
    expect(traces.F2.null).to.be.true
    expect(traces.F3.null).to.be.true
    expect(traces.F4.null).to.be.true
    expect(traces.F5.null).to.be.true
    expect(traces.F6.null).to.be.true
    expect(traces.F7.null).to.be.true
    traces._OE.lower()
  })

  function runTest(lo, hi) {
    for (let i = lo; i < hi; i++) {
      const expected = getExpected(i)
      applyInputs(i)
      const actual = outputValue()
      expect(
        actual,
        `input: ${bin(i, 16)}, expected: ${bin(expected, 8)}, actual: ${bin(actual, 8)}`,
      ).to.equal(expected)
    }
  }

  it("produces the correct output for inputs 0x0000 - 0x0fff", () => {
    runTest(0x0000, 0x1000)
  })
  it("produces the correct output for inputs 0x1000 - 0x1fff", () => {
    runTest(0x1000, 0x2000)
  })
  it("produces the correct output for inputs 0x2000 - 0x2fff", () => {
    runTest(0x2000, 0x3000)
  })
  it("produces the correct output for inputs 0x3000 - 0x3fff", () => {
    runTest(0x3000, 0x4000)
  })
  it("produces the correct output for inputs 0x4000 - 0x4fff", () => {
    runTest(0x4000, 0x5000)
  })
  it("produces the correct output for inputs 0x5000 - 0x5fff", () => {
    runTest(0x5000, 0x6000)
  })
  it("produces the correct output for inputs 0x6000 - 0x6fff", () => {
    runTest(0x6000, 0x7000)
  })
  it("produces the correct output for inputs 0x7000 - 0x7fff", () => {
    runTest(0x7000, 0x8000)
  })
  it("produces the correct output for inputs 0x8000 - 0x8fff", () => {
    runTest(0x8000, 0x9000)
  })
  it("produces the correct output for inputs 0x9000 - 0x9fff", () => {
    runTest(0x9000, 0xa000)
  })
  it("produces the correct output for inputs 0xa000 - 0xafff", () => {
    runTest(0xa000, 0xb000)
  })
  it("produces the correct output for inputs 0xb000 - 0xbfff", () => {
    runTest(0xb000, 0xc000)
  })
  it("produces the correct output for inputs 0xc000 - 0xcfff", () => {
    runTest(0xc000, 0xd000)
  })
  it("produces the correct output for inputs 0xd000 - 0xdfff", () => {
    runTest(0xd000, 0xe000)
  })
  it("produces the correct output for inputs 0xe000 - 0xefff", () => {
    runTest(0xe000, 0xf000)
  })
  it("produces the correct output for inputs 0xf000 - 0xffff", () => {
    runTest(0xf000, 0x10000)
  })
})
