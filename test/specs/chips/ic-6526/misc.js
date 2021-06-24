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
  tr.RES.clear()
  tr.RES.set()
  for (const i of range(16)) {
    assert.equal(
      readRegister(i),
      i <= PRB || (i >= TALO && i <= TBHI) ? 255 : 0,
      `register ${i} has incorrect value`,
    )
  }
  assert.mode(chip.CNT, INPUT)
  assert(tr.IRQ.floating)
  for (const i of range(8)) {
    const name = `D${i}`
    assert.mode(chip[name], OUTPUT)
    assert(tr[name].floating)
  }
}

export function flagDefault({ tr, readRegister }) {
  tr.FLAG.clear()
  assert.isFalse(tr.IRQ.low)
  const icr = readRegister(ICR)
  assert.isTrue(bitSet(icr, FLG))
  assert.isTrue(bitClear(icr, IR))
}

export function flagFlagSet({ tr, readRegister, writeRegister }) {
  writeRegister(ICR, (1 << SC) | (1 << FLG))

  tr.FLAG.clear()
  assert.isLow(tr.IRQ)
  const icr = readRegister(ICR)
  assert.isTrue(bitSet(icr, FLG))
  assert.isTrue(bitSet(icr, IR))
}

export function flagFlagReset({ tr, readRegister, writeRegister }) {
  writeRegister(ICR, (1 << SC) | (1 << FLG))
  writeRegister(ICR, 1 << FLG)

  tr.FLAG.clear()
  assert.isFalse(tr.IRQ.low)
  const icr = readRegister(ICR)
  assert.isTrue(bitSet(icr, FLG))
  assert.isTrue(bitClear(icr, IR))
}
