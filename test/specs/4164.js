/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect } from "test/helper"

import { create4164, D, Q, W, RAS, CAS, A0, A1, A2, A3, A4, A5, A6, A7 } from "chips/4164"
import { createTrace } from "circuits/trace"
import { LOW, HIGH, HIGH_Z } from "circuits/state"

describe("4164 64k x 1 bit DRAM", () => {
  let chip
  const traces = []

  beforeEach(() => {
    chip = create4164()
    for (const pin of chip.pins) {
      traces[pin.num - 1] = createTrace(pin)
    }
    traces[W].set(HIGH)
    traces[RAS].set(HIGH)
    traces[CAS].set(HIGH)
  })

  describe("idle state", () => {
    it("has Q set to high-z", () => {
      expect(chip.pins[Q].state).to.equal(HIGH_Z)
    })

    it("has D set to high-z", () => {
      expect(chip.pins[D].state).to.equal(HIGH_Z)
    })
  })

  describe("read mode", () => {
    it("enables Q", () => {
      traces[RAS].set(LOW)
      traces[CAS].set(LOW)
      expect(chip.pins[Q].state).to.equal(LOW) // data at 0x0000
      expect(chip.pins[D].state).to.equal(HIGH_Z)

      traces[RAS].set(HIGH)
      traces[CAS].set(HIGH)
      expect(chip.pins[Q].state).to.equal(HIGH_Z)
      expect(chip.pins[D].state).to.equal(HIGH_Z)
    })
  })

  describe("write mode", () => {
    it("enables D", () => {
      traces[D].set(HIGH)
      expect(chip.pins[D].state).to.equal(HIGH_Z)

      traces[RAS].set(LOW)
      traces[W].set(LOW)
      traces[CAS].set(LOW)
      expect(chip.pins[Q].state).to.equal(HIGH_Z)
      expect(chip.pins[D].state).to.equal(HIGH)

      traces[RAS].set(HIGH)
      traces[W].set(HIGH)
      traces[CAS].set(HIGH)
      expect(chip.pins[Q].state).to.equal(HIGH_Z)
      expect(chip.pins[D].state).to.equal(HIGH_Z)
    })
  })

  describe("read-modify-write mode", () => {
    it("enables both D and Q", () => {
      traces[D].set(HIGH)
      traces[RAS].set(LOW)
      traces[CAS].set(LOW)
      traces[W].set(LOW)
      expect(chip.pins[Q].state).to.equal(LOW)
      expect(chip.pins[D].state).to.equal(HIGH)

      traces[RAS].set(HIGH)
      traces[CAS].set(HIGH)
      traces[W].set(HIGH)
      expect(chip.pins[Q].state).to.equal(HIGH_Z)
      expect(chip.pins[D].state).to.equal(HIGH_Z)
    })
  })

  function setAddressPins(value) {
    traces[A0].setValue((value & 0b00000001) >> 0)
    traces[A1].setValue((value & 0b00000010) >> 1)
    traces[A2].setValue((value & 0b00000100) >> 2)
    traces[A3].setValue((value & 0b00001000) >> 3)
    traces[A4].setValue((value & 0b00010000) >> 4)
    traces[A5].setValue((value & 0b00100000) >> 5)
    traces[A6].setValue((value & 0b01000000) >> 6)
    traces[A7].setValue((value & 0b10000000) >> 7)
  }

  function bitValue(row, col) {
    const bit = col & 0b00011111
    return (row >> bit) & 1
  }

  describe("reading and writing", () => {
    it("writes and then reads all of the correct values", () => {
      for (let addr = 0; addr < 65536; addr++) {
        const row = (addr & 0xff00) >> 8
        const col = addr & 0x00ff

        setAddressPins(row)
        traces[RAS].set(LOW)

        setAddressPins(col)
        traces[CAS].set(LOW)

        traces[D].setValue(bitValue(row, col))
        traces[W].set(LOW)

        traces[RAS].set(HIGH)
        traces[CAS].set(HIGH)
        traces[W].set(HIGH)
      }

      for (let addr = 0; addr < 65536; addr++) {
        const row = (addr & 0xff00) >> 8
        const col = addr & 0x00ff

        setAddressPins(row)
        traces[RAS].set(LOW)

        setAddressPins(col)
        traces[CAS].set(LOW)

        expect(traces[Q].value).to.equal(bitValue(row, col))

        traces[RAS].set(HIGH)
        traces[CAS].set(HIGH)
      }
    })

    it("reads and writes within the same page without resetting row addresses", () => {
      const row = 0x2f // arbitrary
      setAddressPins(row)
      traces[RAS].set(LOW)

      for (let col = 0; col < 256; col++) {
        setAddressPins(col)
        traces[CAS].set(LOW)

        traces[D].setValue(bitValue(row, col))
        traces[W].set(LOW)

        traces[CAS].set(HIGH)
        traces[W].set(HIGH)
      }

      for (let col = 0; col < 256; col++) {
        setAddressPins(col)
        traces[CAS].set(LOW)

        expect(traces[Q].value).to.equal(bitValue(row, col))

        traces[CAS].set(HIGH)
      }

      traces[RAS].set(HIGH)
    })
  })
})
