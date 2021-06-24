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
    chip = Ic4164()
    traces = deviceTraces(chip)
    traces.WE.set()
    traces.RAS.set()
    traces.CAS.set()

    addrTraces = [...range(8)].map(pin => traces[`A${pin}`])
  })

  describe('read mode', () => {
    it('enables Q', () => {
      traces.RAS.clear()
      traces.CAS.clear()
      // data at 0x0000
      assert.isLow(traces.Q, 'Q should have data during read')

      traces.RAS.set()
      traces.CAS.set()
      assert.isFloating(traces.Q, 'Q should be disabled after read')
    })
  })

  describe('write mode', () => {
    it('disables Q', () => {
      traces.RAS.clear()
      traces.WE.clear()
      traces.CAS.clear()
      assert.isFloating(traces.Q, 'Q should be disabled during write')

      traces.RAS.set()
      traces.WE.set()
      traces.CAS.set()
      assert.isFloating(traces.Q, 'Q should be disabled after write')
    })
  })

  describe('read-modify-write mode', () => {
    it('enables Q', () => {
      traces.D.clear()
      traces.RAS.clear()
      traces.CAS.clear()
      traces.WE.clear()
      assert.isLow(traces.Q, 'Q should be enabled during RMW')

      traces.RAS.set()
      traces.CAS.set()
      traces.WE.set()
      assert.isFloating(traces.Q, 'Q should be disabled after RMW')
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
          traces.RAS.clear()

          valueToPins(col, ...addrTraces)
          traces.CAS.clear()

          traces.D.level = bitValue(row, col)
          traces.WE.clear()

          traces.RAS.set()
          traces.CAS.set()
          traces.WE.set()
        }

        for (const addr of range(base, base + 0x1000)) {
          const row = (addr & 0xff00) >> 8
          const col = addr & 0x00ff

          valueToPins(row, ...addrTraces)
          traces.RAS.clear()

          valueToPins(col, ...addrTraces)
          traces.CAS.clear()

          assert.level(
            traces.Q,
            bitValue(row, col),
            `Incorrect bit value at address 0x${hex(addr, 4)}`,
          )

          traces.RAS.set()
          traces.CAS.set()
        }
      })
    })

    it('reads and writes within the same page without resetting row addresses', () => {
      const row = 0x2f // arbitrary
      valueToPins(row, ...addrTraces)
      traces.RAS.clear()

      for (const col of range(256)) {
        valueToPins(col, ...addrTraces)
        traces.CAS.clear()

        traces.D.level = bitValue(row, col)
        traces.WE.clear()

        traces.CAS.set()
        traces.WE.set()
      }

      for (const col of range(256)) {
        valueToPins(col, ...addrTraces)
        traces.CAS.clear()

        assert.level(traces.Q, bitValue(row, col), `Incorrect bit value at column 0x${hex(col)}`)

        traces.CAS.set()
      }

      traces.RAS.set()
    })

    it('updates the output pin on write in RMW mode', () => {
      const row = 0x2f
      valueToPins(row, ...addrTraces)
      traces.RAS.clear()

      for (const col of range(256)) {
        traces.D.clear()
        valueToPins(col, ...addrTraces)
        traces.CAS.clear()
        assert.isLow(traces.Q, 'Q should reflect the low on D')
        traces.D.set()
        traces.WE.clear()
        assert.isHigh(traces.Q, 'Q should reflect the high on D')
        traces.WE.set()
        traces.CAS.set()
      }
      traces.RAS.set()
    })

    it('does not update the output pin on write in write mode', () => {
      const row = 0x2f
      valueToPins(row, ...addrTraces)
      traces.RAS.clear()

      for (const col of range(256)) {
        valueToPins(col, ...addrTraces)
        traces.D.set()
        traces.WE.clear()
        traces.CAS.clear()
        assert.isFloating(traces.Q, 'Q should not reflect D in write mode')
        traces.WE.set()
        traces.CAS.set()
      }
      traces.RAS.set()
    })
  })
})
