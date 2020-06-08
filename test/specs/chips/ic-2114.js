// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, hex } from "test/helper"
import { Ic2114 } from "chips/"
import { range, valueToPins, pinsToValue } from "utils"

describe("2114 1024 x 4-bit static RAM", () => {
  let chip, traces, addrTraces, dataTraces

  beforeEach(() => {
    chip = Ic2114()
    traces = deviceTraces(chip)

    traces._CE.set()
    traces._WE.set()

    addrTraces = [...range(10)].map(pin => traces[`A${pin}`])
    dataTraces = [...range(4)].map(pin => traces[`D${pin}`])
  })

  it("reads and writes correctly from 0x000 to 0x3ff", () => {
    for (const addr of range(0x000, 0x400)) {
      const level = addr & 0xf
      valueToPins(addr, ...addrTraces)
      valueToPins(level, ...dataTraces)
      traces._WE.clear()
      traces._CE.clear()
      traces._CE.set()
      traces._WE.set()
    }

    for (const addr of range(0x000, 0x400)) {
      const expected = addr & 0xf
      valueToPins(addr, ...addrTraces)
      traces._CE.clear()
      const data = pinsToValue(...dataTraces)

      assert(
        data === expected,
        `Incorrect value at address 0x${hex(addr, 3)}: expected: 0x${
          hex(expected, 1)
        }, actual 0x${hex(data, 1)}`
      )
      traces._CE.set()
    }
  })
})
