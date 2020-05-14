/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect } from "test/helper"

import { create4164, D, Q, _W, _RAS, _CAS, A0, A1, A2, A3, A4, A5, A6, A7 } from "chips/4164"
import { createTrace } from "circuits/trace"
import { LOW, HIGH, TRI } from "circuits/state"

describe("4164 64k x 1 bit DRAM", () => {
  let chip
  const traces = []

  beforeEach(() => {
    chip = create4164()
    for (const pin of chip.pins) {
      traces[pin.num - 1] = createTrace(pin)
    }
    traces[_W].state = HIGH
    traces[_RAS].state = HIGH
    traces[_CAS].state = HIGH
  })

  describe("idle state", () => {
    it("has Q set to tri-state", () => {
      expect(chip.pins[Q].state).to.equal(TRI)
    })
  })

  describe("read mode", () => {
    it("enables Q", () => {
      traces[_RAS].state = LOW
      traces[_CAS].state = LOW
      expect(chip.pins[Q].state).to.equal(LOW) // data at 0x0000

      traces[_RAS].state = HIGH
      traces[_CAS].state = HIGH
      expect(chip.pins[Q].state).to.equal(TRI)
    })
  })

  describe("write mode", () => {
    it("disables Q", () => {
      traces[_RAS].state = LOW
      traces[_W].state = LOW
      traces[_CAS].state = LOW
      expect(chip.pins[Q].state).to.equal(TRI)

      traces[_RAS].state = HIGH
      traces[_W].state = HIGH
      traces[_CAS].state = HIGH
      expect(chip.pins[Q].state).to.equal(TRI)
    })
  })

  describe("read-modify-write mode", () => {
    it("enables Q", () => {
      traces[_RAS].state = LOW
      traces[_CAS].state = LOW
      traces[_W].state = LOW
      expect(chip.pins[Q].state).to.equal(LOW)

      traces[_RAS].state = HIGH
      traces[_CAS].state = HIGH
      traces[_W].state = HIGH
      expect(chip.pins[Q].state).to.equal(TRI)
    })
  })

  function setAddressPins(value) {
    traces[A0].value = (value & 0b00000001) >> 0
    traces[A1].value = (value & 0b00000010) >> 1
    traces[A2].value = (value & 0b00000100) >> 2
    traces[A3].value = (value & 0b00001000) >> 3
    traces[A4].value = (value & 0b00010000) >> 4
    traces[A5].value = (value & 0b00100000) >> 5
    traces[A6].value = (value & 0b01000000) >> 6
    traces[A7].value = (value & 0b10000000) >> 7
  }

  function bitValue(row, col) {
    const bit = col & 0b00011111
    return (row >> bit) & 1
  }

  describe("reading and writing", () => {
    it("writes and then reads all of the correct values", () => {
      for (let addr = 0; addr < 16384; addr += 4) {
        const row = (addr & 0xff00) >> 8
        const col = addr & 0x00ff

        setAddressPins(row)
        traces[_RAS].state = LOW

        setAddressPins(col)
        traces[_CAS].state = LOW

        traces[D].value = bitValue(row, col)
        traces[_W].state = LOW

        traces[_RAS].state = HIGH
        traces[_CAS].state = HIGH
        traces[_W].state = HIGH
      }

      for (let addr = 0; addr < 16384; addr += 4) {
        const row = (addr & 0xff00) >> 8
        const col = addr & 0x00ff

        setAddressPins(row)
        traces[_RAS].state = LOW

        setAddressPins(col)
        traces[_CAS].state = LOW

        expect(traces[Q].value).to.equal(bitValue(row, col))

        traces[_RAS].state = HIGH
        traces[_CAS].state = HIGH
      }
    })

    it("reads and writes within the same page without resetting row addresses", () => {
      const row = 0x2f // arbitrary
      setAddressPins(row)
      traces[_RAS].state = LOW

      for (let col = 0; col < 256; col++) {
        setAddressPins(col)
        traces[_CAS].state = LOW

        traces[D].value = bitValue(row, col)
        traces[_W].state = LOW

        traces[_CAS].state = HIGH
        traces[_W].state = HIGH
      }

      for (let col = 0; col < 256; col++) {
        setAddressPins(col)
        traces[_CAS].state = LOW

        expect(traces[Q].value).to.equal(bitValue(row, col))

        traces[_CAS].state = HIGH
      }

      traces[_RAS].state = HIGH
    })
  })
})
