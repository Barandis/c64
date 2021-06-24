// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, bin, deviceTraces, hex } from 'test/helper'
import { Ic82S100 } from 'chips'
import { range, valueToPins, pinsToValue } from 'utils'

// This program was adapted from a C program that provides a 64k table of outputs for PLA
// based on all of the possible inputs. The original is located at
// http://www.zimmers.net/anonftp/pub/cbm/firmware/computers/c64/pla.c.

/* eslint-disable complexity, camelcase */
function getExpected(input) {
  const cas = !!(input & (1 << 0))
  const loram = !!(input & (1 << 1))
  const hiram = !!(input & (1 << 2))
  const charen = !!(input & (1 << 3))
  const va14 = !!(input & (1 << 4))
  const a15 = !!(input & (1 << 5))
  const a14 = !!(input & (1 << 6))
  const a13 = !!(input & (1 << 7))
  const a12 = !!(input & (1 << 8))
  const ba = !!(input & (1 << 9))
  const aec = !!(input & (1 << 10))
  const r_w = !!(input & (1 << 11))
  const exrom = !!(input & (1 << 12))
  const game = !!(input & (1 << 13))
  const va13 = !!(input & (1 << 14))
  const va12 = !!(input & (1 << 15))

  const f0 =
    (loram && hiram && a15 && !a14 && a13 && !aec && r_w && game) ||
    (hiram && a15 && a14 && a13 && !aec && r_w && game) ||
    (hiram && a15 && a14 && a13 && !aec && r_w && !exrom && !game) ||
    (hiram && !charen && a15 && a14 && !a13 && a12 && !aec && r_w && game) ||
    (loram && !charen && a15 && a14 && !a13 && a12 && !aec && r_w && game) ||
    (hiram && !charen && a15 && a14 && !a13 && a12 && !aec && r_w && !exrom && !game) ||
    (va14 && aec && game && !va13 && va12) ||
    (va14 && aec && !exrom && !game && !va13 && va12) ||
    (hiram && charen && a15 && a14 && !a13 && a12 && ba && !aec && r_w && game) ||
    (hiram && charen && a15 && a14 && !a13 && a12 && !aec && !r_w && game) ||
    (loram && charen && a15 && a14 && !a13 && a12 && ba && !aec && r_w && game) ||
    (loram && charen && a15 && a14 && !a13 && a12 && !aec && !r_w && game) ||
    (hiram && charen && a15 && a14 && !a13 && a12 && ba && !aec && r_w && !exrom && !game) ||
    (hiram && charen && a15 && a14 && !a13 && a12 && !aec && !r_w && !exrom && !game) ||
    (loram && charen && a15 && a14 && !a13 && a12 && ba && !aec && r_w && !exrom && !game) ||
    (loram && charen && a15 && a14 && !a13 && a12 && !aec && !r_w && !exrom && !game) ||
    (a15 && a14 && !a13 && a12 && ba && !aec && r_w && exrom && !game) ||
    (a15 && a14 && !a13 && a12 && !aec && !r_w && exrom && !game) ||
    (loram && hiram && a15 && !a14 && !a13 && !aec && r_w && !exrom) ||
    (a15 && !a14 && !a13 && !aec && exrom && !game) ||
    (hiram && a15 && !a14 && a13 && !aec && r_w && !exrom && !game) ||
    (a15 && a14 && a13 && !aec && exrom && !game) ||
    (aec && exrom && !game && va13 && va12) ||
    (!a15 && !a14 && a12 && exrom && !game) ||
    (!a15 && !a14 && a13 && exrom && !game) ||
    (!a15 && a14 && exrom && !game) ||
    (a15 && !a14 && a13 && exrom && !game) ||
    (a15 && a14 && !a13 && !a12 && exrom && !game) ||
    cas
  const f1 = !loram || !hiram || !a15 || a14 || !a13 || aec || !r_w || !game
  const f2 =
    (!hiram || !a15 || !a14 || !a13 || aec || !r_w || !game) &&
    (!hiram || !a15 || !a14 || !a13 || aec || !r_w || exrom || game)
  const f3 =
    (!hiram || charen || !a15 || !a14 || a13 || !a12 || aec || !r_w || !game) &&
    (!loram || charen || !a15 || !a14 || a13 || !a12 || aec || !r_w || !game) &&
    (!hiram || charen || !a15 || !a14 || a13 || !a12 || aec || !r_w || exrom || game) &&
    (!va14 || !aec || !game || va13 || !va12) &&
    (!va14 || !aec || exrom || game || va13 || !va12)
  const f4 = cas || !a15 || !a14 || a13 || !a12 || aec || r_w
  const f5 =
    (!hiram || !charen || !a15 || !a14 || a13 || !a12 || !ba || aec || !r_w || !game) &&
    (!hiram || !charen || !a15 || !a14 || a13 || !a12 || aec || r_w || !game) &&
    (!loram || !charen || !a15 || !a14 || a13 || !a12 || !ba || aec || !r_w || !game) &&
    (!loram || !charen || !a15 || !a14 || a13 || !a12 || aec || r_w || !game) &&
    (!hiram || !charen || !a15 || !a14 || a13 || !a12 || !ba || aec || !r_w || exrom || game) &&
    (!hiram || !charen || !a15 || !a14 || a13 || !a12 || aec || r_w || exrom || game) &&
    (!loram || !charen || !a15 || !a14 || a13 || !a12 || !ba || aec || !r_w || exrom || game) &&
    (!loram || !charen || !a15 || !a14 || a13 || !a12 || aec || r_w || exrom || game) &&
    (!a15 || !a14 || a13 || !a12 || !ba || aec || !r_w || !exrom || game) &&
    (!a15 || !a14 || a13 || !a12 || aec || r_w || !exrom || game)
  const f6 =
    (!loram || !hiram || !a15 || a14 || a13 || aec || !r_w || exrom) &&
    (!a15 || a14 || a13 || aec || !exrom || game)
  const f7 =
    (!hiram || !a15 || a14 || !a13 || aec || !r_w || exrom || game) &&
    (!a15 || !a14 || !a13 || aec || !exrom || game) &&
    (!aec || !exrom || game || !va13 || !va12)

  let output = 0
  if (f0) output |= 1 << 0
  if (f1) output |= 1 << 1
  if (f2) output |= 1 << 2
  if (f3) output |= 1 << 3
  if (f4) output |= 1 << 4
  if (f5) output |= 1 << 5
  if (f6) output |= 1 << 6
  if (f7) output |= 1 << 7

  return output
}
/* eslint-enable complexity, camelcase */

describe('82S100 Programmable Logic Array', () => {
  const chip = Ic82S100()
  const traces = deviceTraces(chip)

  const inTraces = [...range(0, 16)].map(pin => traces[`I${pin}`])
  const outTraces = [...range(0, 8)].map(pin => traces[`F${pin}`])

  it('disables all outputs if OE is set high', () => {
    traces.OE.set()
    assert.isFloating(traces.F0)
    assert.isFloating(traces.F1)
    assert.isFloating(traces.F2)
    assert.isFloating(traces.F3)
    assert.isFloating(traces.F4)
    assert.isFloating(traces.F5)
    assert.isFloating(traces.F6)
    assert.isFloating(traces.F7)
    traces.OE.clear()
  })

  describe('logic combinations', () => {
    for (const base of range(0x0000, 0xffff, 0x1000)) {
      it(`produces the correct output from 0x${hex(base, 4)} to 0x${hex(base + 0x0fff, 4)}`, () => {
        for (const addr of range(base, base + 0x1000)) {
          const expected = getExpected(addr)

          valueToPins(addr, ...inTraces)
          const actual = pinsToValue(...outTraces)
          assert.equal(
            actual,
            expected,
            `Incorrect output for input ${bin(addr, 16)}: expected: ${bin(
              expected,
              8,
            )}, actual ${bin(actual, 8)}`,
          )
        }
      })
    }
  })
})
