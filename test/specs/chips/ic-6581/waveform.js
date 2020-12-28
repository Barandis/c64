// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { SAWTOOTH } from 'chips/ic-6581/constants'
import { range } from 'utils'
import { assert } from 'test/helper'

const FRELO = 0
const FREHI = 1
const VCREG = 4

// Frequency of A7 is 3520 Hz
const cycles = Math.floor(1000000 / 3520)

export function sawtooth(tr, registers, gen1) {
  registers[FRELO] = 0xb0
  registers[FREHI] = 0xe6
  registers[VCREG] = 1 << SAWTOOTH

  let current = 0
  for (const _ of range(3)) {
    for (const _ of range(cycles)) {
      tr.φ2.set()
      const value = gen1.value
      assert(value >= current)
      current = value
      tr.φ2.clear()
    }
    tr.φ2.set()
    const value = gen1.value
    assert(value < current)
    current = value
    tr.φ2.clear()
  }
}
