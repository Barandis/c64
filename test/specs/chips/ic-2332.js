// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, DEBUG, hex } from "test/helper"
import { Ic2332 } from "chips"
import { character } from "rom/character"
import { range, valueToPins, pinsToValue } from "utils"

describe("2332 4k x 8-bit ROM", () => {
  describe("Character ROM", () => {
    const expected = new Uint8Array(character)
    let chip, traces, addrTraces, dataTraces

    before(() => {
      chip = Ic2332(character)
      traces = deviceTraces(chip)
      traces._CS2.clear()
      traces._CS1.set()

      addrTraces = [...range(12)].map(pin => traces[`A${pin}`])
      dataTraces = [...range(8)].map(pin => traces[`D${pin}`])
    })

    it("reads correctly from 0x0000 to 0x0fff", () => {
      for (const addr of range(0x1000)) {
        valueToPins(addr, ...addrTraces)
        traces._CS1.clear()
        const data = pinsToValue(...dataTraces)

        if (DEBUG) {
          console.log(
            `[address: ${hex(addr, 4)}, expected: ${
              hex(expected[addr], 2)
            }, actual: ${hex(data, 2)}]`,
          )
        }

        assert(
          data === expected[addr],
          `Incorrect value at address 0x${hex(addr, 3)}: expected: 0x${
            hex(expected[addr], 2)
          }, actual 0x${hex(data, 2)}`
        )
        traces._CS1.set()
      }
    })
  })
})
