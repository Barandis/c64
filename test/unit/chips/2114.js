/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces } from "test/helper"

import { new2114 } from "chips/2114"
import { newTrace, PULL_UP, PULL_DOWN } from "components/trace"

describe("2114 1024 x 4-bit static RAM", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = new2114()
    setupTraces(traces, chip)
    traces.VCC = newTrace(chip.VCC, PULL_UP)
    traces.GND = newTrace(chip.GND, PULL_DOWN)

    traces._CE.state = true
    traces._WE.state = true
  })

  function setAddressPins(addr) {
    traces.A0.value = (addr & 0b0000000001) >> 0
    traces.A1.value = (addr & 0b0000000010) >> 1
    traces.A2.value = (addr & 0b0000000100) >> 2
    traces.A3.value = (addr & 0b0000001000) >> 3
    traces.A4.value = (addr & 0b0000010000) >> 4
    traces.A5.value = (addr & 0b0000100000) >> 5
    traces.A6.value = (addr & 0b0001000000) >> 6
    traces.A7.value = (addr & 0b0010000000) >> 7
    traces.A8.value = (addr & 0b0100000000) >> 8
    traces.A9.value = (addr & 0b1000000000) >> 9
  }

  function setDataPins(value) {
    traces.D0.value = (value & 0b0001) >> 0
    traces.D1.value = (value & 0b0010) >> 1
    traces.D2.value = (value & 0b0100) >> 2
    traces.D3.value = (value & 0b1000) >> 3
  }

  function readDataPins() {
    return (
      (traces.D0.value << 0) |
      (traces.D1.value << 1) |
      (traces.D2.value << 2) |
      (traces.D3.value << 3)
    )
  }

  it("reads and writes all of the correct values from 0x000 to 0x3ff", () => {
    for (let addr = 0x000; addr < 0x400; addr++) {
      const value = addr & 0xf
      setAddressPins(addr)
      setDataPins(value)
      traces._WE.value = 0
      traces._CE.value = 0
      traces._CE.value = 1
      traces._WE.value = 1
    }

    for (let addr = 0x000; addr < 0x400; addr++) {
      const value = addr & 0xf
      setAddressPins(addr)
      traces._CE.value = 0
      expect(readDataPins()).to.equal(value)
      traces._CE.value = 1
    }
  })
})
