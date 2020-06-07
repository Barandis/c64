// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect, deviceTraces } from "test/helper"
import { new4164 } from "chips/4164"

describe("4164 64k x 1 bit dynamic RAM", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = new4164()
    traces = deviceTraces(chip)
    traces._W.set()
    traces._RAS.set()
    traces._CAS.set()
  })

  describe("idle state", () => {
    it("has Q set to hi-z", () => {
      expect(traces.Q.null).to.be.true
    })
  })

  describe("read mode", () => {
    it("enables Q", () => {
      traces._RAS.clear()
      traces._CAS.clear()
      expect(traces.Q.low).to.be.true // data at 0x0000

      traces._RAS.set()
      traces._CAS.set()
      expect(traces.Q.null).to.be.true
    })
  })

  describe("write mode", () => {
    it("disables Q", () => {
      traces._RAS.clear()
      traces._W.clear()
      traces._CAS.clear()
      expect(traces.Q.null).to.be.true

      traces._RAS.set()
      traces._W.set()
      traces._CAS.set()
      expect(traces.Q.null).to.be.true
    })
  })

  describe("read-modify-write mode", () => {
    it("enables Q", () => {
      traces.D.clear()
      traces._RAS.clear()
      traces._CAS.clear()
      traces._W.clear()
      expect(traces.Q.low).to.be.true

      traces._RAS.set()
      traces._CAS.set()
      traces._W.set()
      expect(traces.Q.null).to.be.true
    })
  })

  function setAddressPins(value) {
    traces.A0.level = (value & 0b00000001) >> 0
    traces.A1.level = (value & 0b00000010) >> 1
    traces.A2.level = (value & 0b00000100) >> 2
    traces.A3.level = (value & 0b00001000) >> 3
    traces.A4.level = (value & 0b00010000) >> 4
    traces.A5.level = (value & 0b00100000) >> 5
    traces.A6.level = (value & 0b01000000) >> 6
    traces.A7.level = (value & 0b10000000) >> 7
  }

  function bitValue(row, col) {
    const bit = col & 0b00011111
    return row >> bit & 1
  }

  function runRwTest(lo, hi) {
    for (let addr = lo; addr < hi; addr++) {
      const row = (addr & 0xff00) >> 8
      const col = addr & 0x00ff

      setAddressPins(row)
      traces._RAS.clear()

      setAddressPins(col)
      traces._CAS.clear()

      traces.D.level = bitValue(row, col)
      traces._W.clear()

      traces._RAS.set()
      traces._CAS.set()
      traces._W.set()
    }

    for (let addr = lo; addr < hi; addr++) {
      const row = (addr & 0xff00) >> 8
      const col = addr & 0x00ff

      setAddressPins(row)
      traces._RAS.clear()

      setAddressPins(col)
      traces._CAS.clear()

      expect(traces.Q.level).to.equal(bitValue(row, col))

      traces._RAS.set()
      traces._CAS.set()
    }
  }

  describe("reading and writing", () => {
    it(
      "writes and then reads all of the correct values in 0x0000 - 0x0fff",
      () => runRwTest(0x0000, 0x1000)
    )
    it(
      "writes and then reads all of the correct values in 0x1000 - 0x1fff",
      () => runRwTest(0x1000, 0x2000)
    )
    it(
      "writes and then reads all of the correct values in 0x2000 - 0x2fff",
      () => runRwTest(0x2000, 0x3000)
    )
    it(
      "writes and then reads all of the correct values in 0x3000 - 0x3fff",
      () => runRwTest(0x3000, 0x4000)
    )
    it(
      "writes and then reads all of the correct values in 0x4000 - 0x4fff",
      () => runRwTest(0x4000, 0x5000)
    )
    it(
      "writes and then reads all of the correct values in 0x5000 - 0x5fff",
      () => runRwTest(0x5000, 0x6000)
    )
    it(
      "writes and then reads all of the correct values in 0x6000 - 0x6fff",
      () => runRwTest(0x6000, 0x7000)
    )
    it(
      "writes and then reads all of the correct values in 0x7000 - 0x7fff",
      () => runRwTest(0x7000, 0x8000)
    )
    it(
      "writes and then reads all of the correct values in 0x8000 - 0x8fff",
      () => runRwTest(0x8000, 0x9000)
    )
    it(
      "writes and then reads all of the correct values in 0x9000 - 0x9fff",
      () => runRwTest(0x9000, 0x1000)
    )
    it(
      "writes and then reads all of the correct values in 0xa000 - 0xafff",
      () => runRwTest(0xa000, 0xb000)
    )
    it(
      "writes and then reads all of the correct values in 0xb000 - 0xbfff",
      () => runRwTest(0xb000, 0xc000)
    )
    it(
      "writes and then reads all of the correct values in 0xc000 - 0xcfff",
      () => runRwTest(0xc000, 0xd000)
    )
    it(
      "writes and then reads all of the correct values in 0xd000 - 0xdfff",
      () => runRwTest(0xd000, 0xe000)
    )
    it(
      "writes and then reads all of the correct values in 0xe000 - 0xefff",
      () => runRwTest(0xe000, 0xf000)
    )
    it(
      "writes and then reads all of the correct values in 0xf000 - 0xffff",
      () => runRwTest(0xf000, 0x10000)
    )

    it(
      "reads and writes within the same page without resetting row addresses",
      () => {
        const row = 0x2f // arbitrary
        setAddressPins(row)
        traces._RAS.clear()

        for (let col = 0; col < 256; col++) {
          setAddressPins(col)
          traces._CAS.clear()

          traces.D.level = bitValue(row, col)
          traces._W.clear()

          traces._CAS.set()
          traces._W.set()
        }

        for (let col = 0; col < 256; col++) {
          setAddressPins(col)
          traces._CAS.clear()

          expect(traces.Q.level).to.equal(bitValue(row, col))

          traces._CAS.set()
        }

        traces._RAS.set()
      }
    )

    it("updates the output pin on write in RMW mode", () => {
      const row = 0x2f
      setAddressPins(row)
      traces._RAS.clear()

      for (let col = 0; col < 256; col++) {
        traces.D.clear()
        setAddressPins(col)
        traces._CAS.clear()
        expect(traces.Q.level).to.equal(0)
        traces.D.set()
        traces._W.clear()
        expect(traces.Q.level).to.equal(1)
        traces._W.set()
        traces._CAS.set()
      }
      traces._RAS.set()
    })

    it("does not update the output pin on write in write mode", () => {
      const row = 0x2f
      setAddressPins(row)
      traces._RAS.clear()

      for (let col = 0; col < 256; col++) {
        setAddressPins(col)
        traces.D.set()
        traces._W.clear()
        traces._CAS.clear()
        expect(traces.Q.level).to.be.null
        traces._W.set()
        traces._CAS.set()
      }
      traces._RAS.set()
    })
  })
})
