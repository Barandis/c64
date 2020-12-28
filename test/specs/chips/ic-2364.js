/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { assert, deviceTraces, DEBUG, hex } from 'test/helper'
import { Ic2364 } from 'chips'
import { kernal } from 'rom/kernal'
import { basic } from 'rom/basic'
import { range, valueToPins, pinsToValue } from 'utils'

describe('2364 8k x 8-bit ROM', () => {
  describe('KERNAL ROM', () => {
    let chip, traces, addrTraces, dataTraces
    const expected = new Uint8Array(kernal)

    before(() => {
      chip = new Ic2364(kernal)
      traces = deviceTraces(chip)
      traces._CS.set()

      addrTraces = [...range(13)].map(pin => traces[`A${pin}`])
      dataTraces = [...range(8)].map(pin => traces[`D${pin}`])
    })

    for (const base of range(0x0000, 0x1fff, 0x1000)) {
      it(`reads correctly from 0x${hex(base, 4)} to 0x${
        hex(base + 0x0fff, 4)
      }`, () => {
        for (const addr of range(base, base + 0x1000)) {
          valueToPins(addr, ...addrTraces)
          traces._CS.clear()
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
            `Incorrect value at address 0x${hex(addr, 4)}: expected: 0x${
              hex(expected[addr], 2)
            }, actual 0x${hex(data, 2)}`,
          )
          traces._CS.set()
        }
      })
    }
  })

  describe('BASIC ROM', () => {
    let chip, traces, addrTraces, dataTraces
    const expected = new Uint8Array(basic)

    before(() => {
      chip = new Ic2364(basic)
      traces = deviceTraces(chip)
      traces._CS.set()

      addrTraces = [...range(13)].map(pin => traces[`A${pin}`])
      dataTraces = [...range(8)].map(pin => traces[`D${pin}`])
    })

    const blocks = [...range(0x0000, 0x1fff, 0x1000)]

    blocks.forEach(base => {
      it(`reads correctly from 0x${hex(base, 4)} to 0x${
        hex(base + 0x0fff, 4)
      }`, () => {
        for (const addr of range(base, base + 0x1000)) {
          valueToPins(addr, ...addrTraces)
          traces._CS.clear()
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
            `Incorrect value at address 0x${hex(addr, 4)}: expected: 0x${
              hex(expected[addr], 2)
            }, actual 0x${hex(data, 2)}`,
          )
          traces._CS.set()
        }
      })
    })
  })
})
