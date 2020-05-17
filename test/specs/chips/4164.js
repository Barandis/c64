/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces } from "test/helper"

import { create4164 } from "chips/4164"
import { createTrace, PULL_UP, PULL_DOWN } from "circuits/trace"
import { LOW, HIGH, HI_Z } from "circuits/state"

describe("4164 64k x 1 bit DRAM", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = create4164()
    setupTraces(traces, chip)
    traces.VCC = createTrace(chip.pins.VCC, PULL_UP)
    traces.VSS = createTrace(chip.pins.VSS, PULL_DOWN)

    traces._W.state = HIGH
    traces._RAS.state = HIGH
    traces._CAS.state = HIGH
  })

  describe("idle state", () => {
    it("has Q set to hi-z", () => {
      expect(traces.Q.state).to.equal(HI_Z)
    })
  })

  describe("read mode", () => {
    it("enables Q", () => {
      traces._RAS.state = LOW
      traces._CAS.state = LOW
      expect(traces.Q.state).to.equal(LOW) // data at 0x0000

      traces._RAS.state = HIGH
      traces._CAS.state = HIGH
      expect(traces.Q.state).to.equal(HI_Z)
    })
  })

  describe("write mode", () => {
    it("disables Q", () => {
      traces._RAS.state = LOW
      traces._W.state = LOW
      traces._CAS.state = LOW
      expect(traces.Q.state).to.equal(HI_Z)

      traces._RAS.state = HIGH
      traces._W.state = HIGH
      traces._CAS.state = HIGH
      expect(traces.Q.state).to.equal(HI_Z)
    })
  })

  describe("read-modify-write mode", () => {
    it("enables Q", () => {
      traces._RAS.state = LOW
      traces._CAS.state = LOW
      traces._W.state = LOW
      expect(traces.Q.state).to.equal(LOW)

      traces._RAS.state = HIGH
      traces._CAS.state = HIGH
      traces._W.state = HIGH
      expect(traces.Q.state).to.equal(HI_Z)
    })
  })

  function setAddressPins(value) {
    traces.A0.state = (value & 0b00000001) >> 0
    traces.A1.state = (value & 0b00000010) >> 1
    traces.A2.state = (value & 0b00000100) >> 2
    traces.A3.state = (value & 0b00001000) >> 3
    traces.A4.state = (value & 0b00010000) >> 4
    traces.A5.state = (value & 0b00100000) >> 5
    traces.A6.state = (value & 0b01000000) >> 6
    traces.A7.state = (value & 0b10000000) >> 7
  }

  function bitValue(row, col) {
    const bit = col & 0b00011111
    return (row >> bit) & 1
  }

  function runRwTest(lo, hi) {
    for (let addr = lo; addr < hi; addr++) {
      const row = (addr & 0xff00) >> 8
      const col = addr & 0x00ff

      setAddressPins(row)
      traces._RAS.state = LOW

      setAddressPins(col)
      traces._CAS.state = LOW

      traces.D.state = bitValue(row, col)
      traces._W.state = LOW

      traces._RAS.state = HIGH
      traces._CAS.state = HIGH
      traces._W.state = HIGH
    }

    for (let addr = lo; addr < hi; addr++) {
      const row = (addr & 0xff00) >> 8
      const col = addr & 0x00ff

      setAddressPins(row)
      traces._RAS.state = LOW

      setAddressPins(col)
      traces._CAS.state = LOW

      expect(traces.Q.value).to.equal(bitValue(row, col))

      traces._RAS.state = HIGH
      traces._CAS.state = HIGH
    }
  }

  describe("reading and writing", () => {
    it("writes and then reads all of the correct values in 0x0000 - 0x0fff", () => {
      runRwTest(0x0000, 0x1000)
    })
    it("writes and then reads all of the correct values in 0x1000 - 0x1fff", () => {
      runRwTest(0x1000, 0x2000)
    })
    it("writes and then reads all of the correct values in 0x2000 - 0x2fff", () => {
      runRwTest(0x2000, 0x3000)
    })
    it("writes and then reads all of the correct values in 0x3000 - 0x3fff", () => {
      runRwTest(0x3000, 0x4000)
    })
    it("writes and then reads all of the correct values in 0x4000 - 0x4fff", () => {
      runRwTest(0x4000, 0x5000)
    })
    it("writes and then reads all of the correct values in 0x5000 - 0x5fff", () => {
      runRwTest(0x5000, 0x6000)
    })
    it("writes and then reads all of the correct values in 0x6000 - 0x6fff", () => {
      runRwTest(0x6000, 0x7000)
    })
    it("writes and then reads all of the correct values in 0x7000 - 0x7fff", () => {
      runRwTest(0x7000, 0x8000)
    })
    it("writes and then reads all of the correct values in 0x8000 - 0x8fff", () => {
      runRwTest(0x8000, 0x9000)
    })
    it("writes and then reads all of the correct values in 0x9000 - 0x9fff", () => {
      runRwTest(0x9000, 0x1000)
    })
    it("writes and then reads all of the correct values in 0xa000 - 0xafff", () => {
      runRwTest(0xa000, 0xb000)
    })
    it("writes and then reads all of the correct values in 0xb000 - 0xbfff", () => {
      runRwTest(0xb000, 0xc000)
    })
    it("writes and then reads all of the correct values in 0xc000 - 0xcfff", () => {
      runRwTest(0xc000, 0xd000)
    })
    it("writes and then reads all of the correct values in 0xd000 - 0xdfff", () => {
      runRwTest(0xd000, 0xe000)
    })
    it("writes and then reads all of the correct values in 0xe000 - 0xefff", () => {
      runRwTest(0xe000, 0xf000)
    })
    it("writes and then reads all of the correct values in 0xf000 - 0xffff", () => {
      runRwTest(0xf000, 0x10000)
    })

    it("reads and writes within the same page without resetting row addresses", () => {
      const row = 0x2f // arbitrary
      setAddressPins(row)
      traces._RAS.state = LOW

      for (let col = 0; col < 256; col++) {
        setAddressPins(col)
        traces._CAS.state = LOW

        traces.D.state = bitValue(row, col)
        traces._W.state = LOW

        traces._CAS.state = HIGH
        traces._W.state = HIGH
      }

      for (let col = 0; col < 256; col++) {
        setAddressPins(col)
        traces._CAS.state = LOW

        expect(traces.Q.value).to.equal(bitValue(row, col))

        traces._CAS.state = HIGH
      }

      traces._RAS.state = HIGH
    })
  })
})
