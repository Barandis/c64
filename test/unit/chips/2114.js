/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { new2114 } from "chips/2114"

describe("2114 1024 x 4-bit static RAM", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = new2114()
    traces = deviceTraces(chip)

    traces._CE.set()
    traces._WE.set()
  })

  function setAddressPins(addr) {
    traces.A0.level = (addr & 0b0000000001) >> 0
    traces.A1.level = (addr & 0b0000000010) >> 1
    traces.A2.level = (addr & 0b0000000100) >> 2
    traces.A3.level = (addr & 0b0000001000) >> 3
    traces.A4.level = (addr & 0b0000010000) >> 4
    traces.A5.level = (addr & 0b0000100000) >> 5
    traces.A6.level = (addr & 0b0001000000) >> 6
    traces.A7.level = (addr & 0b0010000000) >> 7
    traces.A8.level = (addr & 0b0100000000) >> 8
    traces.A9.level = (addr & 0b1000000000) >> 9
  }

  function setDataPins(value) {
    traces.D0.level = (value & 0b0001) >> 0
    traces.D1.level = (value & 0b0010) >> 1
    traces.D2.level = (value & 0b0100) >> 2
    traces.D3.level = (value & 0b1000) >> 3
  }

  function readDataPins() {
    return (
      (traces.D0.level << 0) |
      (traces.D1.level << 1) |
      (traces.D2.level << 2) |
      (traces.D3.level << 3)
    )
  }

  it("reads and writes all of the correct levels from 0x000 to 0x3ff", () => {
    for (let addr = 0x000; addr < 0x400; addr++) {
      const level = addr & 0xf
      setAddressPins(addr)
      setDataPins(level)
      traces._WE.clear()
      traces._CE.clear()
      traces._CE.set()
      traces._WE.set()
    }

    for (let addr = 0x000; addr < 0x400; addr++) {
      const level = addr & 0xf
      setAddressPins(addr)
      traces._CE.clear()
      expect(readDataPins()).to.equal(level)
      traces._CE.set()
    }
  })
})
