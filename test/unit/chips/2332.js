/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces, DEBUG, hex } from "test/helper"

import { create2332 } from "chips/2332"
import { createTrace, PULL_UP, PULL_DOWN } from "components/trace"
import { character } from "data/character"

describe("2332 4k x 8-bit ROM", () => {
  describe("Character ROM", () => {
    let chip
    const traces = {}
    const expected = new Uint8Array(character)

    before(() => {
      chip = create2332(character)
      setupTraces(traces, chip)
      traces.VCC = createTrace(chip.VCC, PULL_UP)
      traces.GND = createTrace(chip.GND, PULL_DOWN)

      traces._CS2.value = 0
      traces._CS1.value = 1
    })

    function setAddressPins(addr) {
      traces.A0.value = (addr & 0b0000000000001) >> 0
      traces.A1.value = (addr & 0b0000000000010) >> 1
      traces.A2.value = (addr & 0b0000000000100) >> 2
      traces.A3.value = (addr & 0b0000000001000) >> 3
      traces.A4.value = (addr & 0b0000000010000) >> 4
      traces.A5.value = (addr & 0b0000000100000) >> 5
      traces.A6.value = (addr & 0b0000001000000) >> 6
      traces.A7.value = (addr & 0b0000010000000) >> 7
      traces.A8.value = (addr & 0b0000100000000) >> 8
      traces.A9.value = (addr & 0b0001000000000) >> 9
      traces.A10.value = (addr & 0b0010000000000) >> 10
      traces.A11.value = (addr & 0b0100000000000) >> 11
    }

    function readDataPins() {
      return (
        (traces.D0.value << 0) |
        (traces.D1.value << 1) |
        (traces.D2.value << 2) |
        (traces.D3.value << 3) |
        (traces.D4.value << 4) |
        (traces.D5.value << 5) |
        (traces.D6.value << 6) |
        (traces.D7.value << 7)
      )
    }

    function runTests(lo, hi) {
      for (let addr = lo; addr < hi; addr++) {
        setAddressPins(addr)
        traces._CS1.value = 0
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
        traces._CS1.value = 1
      }
    }

    it("reads all of the correct values in 0x0000 - 0x0fff", () => {
      runTests(0x0000, 0x1000)
    })
  })
})
