// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, hex } from 'test/helper'
import { Ic4164 } from 'chips'
import { range, valueToPins } from 'utils'

describe('4164 64k x 1 bit dynamic RAM', () => {
  let chip
  let traces
  let addrTraces

  beforeEach(() => {
    chip = new Ic4164()
    traces = deviceTraces(chip)
    traces._WE.set()
    traces._RAS.set()
    traces._CAS.set()

    addrTraces = [...range(8)].map(pin => traces[`A${pin}`])
  })

  describe('read mode', () => {
    it('enables Q', () => {
      traces._RAS.clear()
      traces._CAS.clear()
      // data at 0x0000
      assert(traces.Q.low, 'Q should have data during read')

      traces._RAS.set()
      traces._CAS.set()
      assert(traces.Q.floating, 'Q should be disabled after read')
    })
  })

  describe('write mode', () => {
    it('disables Q', () => {
      traces._RAS.clear()
      traces._WE.clear()
      traces._CAS.clear()
      assert(traces.Q.floating, 'Q should be disabled during write')

      traces._RAS.set()
      traces._WE.set()
      traces._CAS.set()
      assert(traces.Q.floating, 'Q should be disabled after write')
    })
  })

  describe('read-modify-write mode', () => {
    it('enables Q', () => {
      traces.D.clear()
      traces._RAS.clear()
      traces._CAS.clear()
      traces._WE.clear()
      assert(traces.Q.low, 'Q should be enabled during RMW')

      traces._RAS.set()
      traces._CAS.set()
      traces._WE.set()
      assert(traces.Q.floating, 'Q should be disabled after RMW')
    })
  })

  function bitValue(row, col) {
    const bit = col & 0b00011111
    return (row >> bit) & 1
  }

  describe('reading and writing', () => {
    ;[...range(0x0000, 0xffff, 0x1000)].forEach(base => {
      it(`writes and reads correctly from 0x${hex(base, 4)} to 0x${hex(base + 0x0fff, 4)}`, () => {
        for (const addr of range(base, base + 0x1000)) {
          const row = (addr & 0xff00) >> 8
          const col = addr & 0x00ff

          valueToPins(row, ...addrTraces)
          traces._RAS.clear()

          valueToPins(col, ...addrTraces)
          traces._CAS.clear()

          traces.D.level = bitValue(row, col)
          traces._WE.clear()

          traces._RAS.set()
          traces._CAS.set()
          traces._WE.set()
        }

        for (const addr of range(base, base + 0x1000)) {
          const row = (addr & 0xff00) >> 8
          const col = addr & 0x00ff

          valueToPins(row, ...addrTraces)
          traces._RAS.clear()

          valueToPins(col, ...addrTraces)
          traces._CAS.clear()

          assert(
            traces.Q.level === bitValue(row, col),
            `Incorrect bit value at address 0x${hex(addr, 4)}`,
          )

          traces._RAS.set()
          traces._CAS.set()
        }
      })
    })

    it('reads and writes within the same page without resetting row addresses', () => {
      const row = 0x2f // arbitrary
      valueToPins(row, ...addrTraces)
      traces._RAS.clear()

      for (const col of range(256)) {
        valueToPins(col, ...addrTraces)
        traces._CAS.clear()

        traces.D.level = bitValue(row, col)
        traces._WE.clear()

        traces._CAS.set()
        traces._WE.set()
      }

      for (const col of range(256)) {
        valueToPins(col, ...addrTraces)
        traces._CAS.clear()

        assert(traces.Q.level === bitValue(row, col), `Incorrect bit value at column 0x${hex(col)}`)

        traces._CAS.set()
      }

      traces._RAS.set()
    })

    it('updates the output pin on write in RMW mode', () => {
      const row = 0x2f
      valueToPins(row, ...addrTraces)
      traces._RAS.clear()

      for (const col of range(256)) {
        traces.D.clear()
        valueToPins(col, ...addrTraces)
        traces._CAS.clear()
        assert(traces.Q.low, 'Q should reflect the low on D')
        traces.D.set()
        traces._WE.clear()
        assert(traces.Q.high, 'Q should reflect the high on D')
        traces._WE.set()
        traces._CAS.set()
      }
      traces._RAS.set()
    })

    it('does not update the output pin on write in write mode', () => {
      const row = 0x2f
      valueToPins(row, ...addrTraces)
      traces._RAS.clear()

      for (const col of range(256)) {
        valueToPins(col, ...addrTraces)
        traces.D.set()
        traces._WE.clear()
        traces._CAS.clear()
        assert(traces.Q.floating, 'Q should not reflect D in write mode')
        traces._WE.set()
        traces._CAS.set()
      }
      traces._RAS.set()
    })
  })
})
