/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, bin } from "test/helper"

import { create906114 } from "chips/906114"
import { createTrace, PULL_UP, PULL_DOWN } from "circuits/trace"

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

describe("906114 Programmable Logic Array", () => {
  const chip = create906114()
  const traces = {}

  for (const name in chip.pins) {
    if (!(chip.pins[name].hiZ && chip.pins[name].input)) {
      traces[name] = createTrace(chip.pins[name])
    }
  }
  traces._OE = createTrace(chip.pins._OE, PULL_DOWN)
  traces.VCC = createTrace(chip.pins.VCC, PULL_UP)
  traces.GND = createTrace(chip.pins.GND, PULL_DOWN)

  const bitValue = (input, bit) => (input & (1 << bit)) >> bit

  function applyInputs(input) {
    traces._CAS.value = bitValue(input, 0)
    traces._LORAM.value = bitValue(input, 1)
    traces._HIRAM.value = bitValue(input, 2)
    traces._CHAREN.value = bitValue(input, 3)
    traces._VA14.value = bitValue(input, 4)
    traces.A15.value = bitValue(input, 5)
    traces.A14.value = bitValue(input, 6)
    traces.A13.value = bitValue(input, 7)
    traces.A12.value = bitValue(input, 8)
    traces.BA.value = bitValue(input, 9)
    traces._AEC.value = bitValue(input, 10)
    traces.R__W.value = bitValue(input, 11)
    traces._EXROM.value = bitValue(input, 12)
    traces._GAME.value = bitValue(input, 13)
    traces.VA13.value = bitValue(input, 14)
    traces.VA12.value = bitValue(input, 15)
  }

  function outputValue() {
    let output = 0
    output |= traces._CASRAM.value << 0
    output |= traces._BASIC.value << 1
    output |= traces._KERNAL.value << 2
    output |= traces._CHAROM.value << 3
    output |= traces.GR__W.value << 4
    output |= traces._IO.value << 5
    output |= traces._ROML.value << 6
    output |= traces._ROMH.value << 7
    return output
  }

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
