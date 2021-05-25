// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { rand, assert } from 'test/helper'
import Pin from 'components/pin'
import { TBHI, TALO, ICR, FLG, IR, SC, PRB } from 'chips/ic-6526/constants'
import { bitSet, bitClear, range } from 'utils'

const { INPUT, OUTPUT } = Pin

export function reset({ chip, tr, writeRegister, readRegister }) {
  for (const i of range(16)) {
    writeRegister(i, rand(256))
  }
  tr._RES.clear()
  tr._RES.set()
  for (const i of range(16)) {
    assert.equal(
      readRegister(i),
      i <= PRB || (i >= TALO && i <= TBHI) ? 255 : 0,
      `register ${i} has incorrect value`,
    )
  }
  assert.equal(chip.CNT.mode, INPUT)
  assert(tr._IRQ.floating)
  for (const i of range(8)) {
    const name = `D${i}`
    assert.equal(chip[name].mode, OUTPUT)
    assert(tr[name].floating)
  }
}

export function flagDefault({ tr, readRegister }) {
  tr._FLAG.clear()
  assert(!tr._IRQ.low)
  const icr = readRegister(ICR)
  assert(bitSet(icr, FLG))
  assert(bitClear(icr, IR))
}

export function flagFlagSet({ tr, readRegister, writeRegister }) {
  writeRegister(ICR, (1 << SC) | (1 << FLG))

  tr._FLAG.clear()
  assert(tr._IRQ.low)
  const icr = readRegister(ICR)
  assert(bitSet(icr, FLG))
  assert(bitSet(icr, IR))
}

export function flagFlagReset({ tr, readRegister, writeRegister }) {
  writeRegister(ICR, (1 << SC) | (1 << FLG))
  writeRegister(ICR, 1 << FLG)

  tr._FLAG.clear()
  assert(!tr._IRQ.low)
  const icr = readRegister(ICR)
  assert(bitSet(icr, FLG))
  assert(bitClear(icr, IR))
}
