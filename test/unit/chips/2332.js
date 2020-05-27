/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces, DEBUG, hex } from "test/helper"
import { new2332 } from "chips/2332"
import { character } from "rom/character"

describe("2332 4k x 8-bit ROM", () => {
  describe("Character ROM", () => {
    let chip
    let traces
    const expected = new Uint8Array(character)

    before(() => {
      chip = new2332(character)
      traces = deviceTraces(chip)
      traces._CS2.lower()
      traces._CS1.raise()
    })

    function setAddressPins(addr) {
      traces.A0.level = (addr & 0b0000000000001) >> 0
      traces.A1.level = (addr & 0b0000000000010) >> 1
      traces.A2.level = (addr & 0b0000000000100) >> 2
      traces.A3.level = (addr & 0b0000000001000) >> 3
      traces.A4.level = (addr & 0b0000000010000) >> 4
      traces.A5.level = (addr & 0b0000000100000) >> 5
      traces.A6.level = (addr & 0b0000001000000) >> 6
      traces.A7.level = (addr & 0b0000010000000) >> 7
      traces.A8.level = (addr & 0b0000100000000) >> 8
      traces.A9.level = (addr & 0b0001000000000) >> 9
      traces.A10.level = (addr & 0b0010000000000) >> 10
      traces.A11.level = (addr & 0b0100000000000) >> 11
    }

    function readDataPins() {
      return (
        (traces.D0.level << 0) |
        (traces.D1.level << 1) |
        (traces.D2.level << 2) |
        (traces.D3.level << 3) |
        (traces.D4.level << 4) |
        (traces.D5.level << 5) |
        (traces.D6.level << 6) |
        (traces.D7.level << 7)
      )
    }

    function runTests(lo, hi) {
      for (let addr = lo; addr < hi; addr++) {
        setAddressPins(addr)
        traces._CS1.lower()
        const data = readDataPins()

        if (DEBUG) {
          console.log(
            `[address: ${hex(addr, 4)}, expected: ${hex(expected[addr], 2)}, actual: ${hex(
              data,
              2,
            )}]`,
          )
        }

        expect(data).to.equal(expected[addr])
        traces._CS1.raise()
      }
    }

    it("reads all of the correct levels in 0x0000 - 0x0fff", () => {
      runTests(0x0000, 0x1000)
    })
  })
})
