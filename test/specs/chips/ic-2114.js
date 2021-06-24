// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, hex } from 'test/helper'
import { Ic2114 } from 'chips'
import { range, valueToPins, pinsToValue } from 'utils'

const message = (addr, expected, actual) =>
  `Incorrect value at address 0x${hex(addr, 3)}: expected: 0x${hex(expected, 1)}, actual 0x${hex(
    actual,
    1,
  )}`

describe('2114 1024 x 4-bit static RAM', () => {
  let chip
  let traces
  let addrTraces
  let dataTraces

  beforeEach(() => {
    chip = Ic2114()
    traces = deviceTraces(chip)

    traces.CS.set()
    traces.WE.set()

    addrTraces = [...range(10)].map(pin => traces[`A${pin}`])
    dataTraces = [...range(4)].map(pin => traces[`D${pin}`])

    for (const addr of range(0x000, 0x400)) {
      const level = addr & 0xf
      valueToPins(addr, ...addrTraces)
      valueToPins(level, ...dataTraces)
      traces.WE.clear()
      traces.CS.clear()
      traces.CS.set()
      traces.WE.set()
    }
  })

  it('reads and writes correctly from 0x000 to 0x3ff', () => {
    for (const addr of range(0x000, 0x400)) {
      const expected = addr & 0xf
      valueToPins(addr, ...addrTraces)
      traces.CS.clear()
      const data = pinsToValue(...dataTraces)

      assert.equal(data, expected, message(addr, expected, data))
      traces.CS.set()
    }
  })

  it('reads and writes on a single select cycle', () => {
    for (const addr of range(0x000, 0x400)) {
      const expected = ~addr & 0xf
      valueToPins(addr, ...addrTraces)

      traces.CS.clear()
      const temp = pinsToValue(...dataTraces)
      valueToPins(~temp, ...dataTraces)
      traces.WE.clear().set()
      traces.CS.set()

      traces.CS.clear()
      const data = pinsToValue(...dataTraces)
      assert.equal(data, expected, message(addr, expected, data))
      traces.CS.set()
    }
  })

  it('responds to address pin changes alone', () => {
    valueToPins(0, ...dataTraces)
    valueToPins(0, ...addrTraces)

    traces.WE.clear()
    traces.CS.clear()

    for (const i of range(10)) {
      valueToPins(i, ...dataTraces)
      traces[`A${i}`].set()
    }

    traces.WE.set()
    valueToPins(0, ...addrTraces)

    for (const i of range(10)) {
      traces[`A${i}`].set()
      const data = pinsToValue(...dataTraces)
      assert.equal(data, i, message(2 ** (i + 1) - 1, i, data))
    }
    traces.CS.set()
  })
})
