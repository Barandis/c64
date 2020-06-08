// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { rand, assert } from "test/helper"
import { INPUT, OUTPUT } from "components"
import {
  TIMBHI, TIMALO, CIAICR, ICR_FLG, ICR_IR, ICR_SC, CIAPRB,
} from "chips/ic-6526/constants"
import { bitSet, bitClear, range } from "utils"

export function reset({ chip, tr, writeRegister, readRegister }) {
  for (const i of range(16)) {
    writeRegister(i, rand(256))
  }
  tr._RES.clear()
  tr._RES.set()
  for (const i of range(16)) {
    assert(
      readRegister(i) === (i <= CIAPRB || i >= TIMALO && i <= TIMBHI ? 255 : 0)
    )
  }
  assert(chip.CNT.mode === INPUT)
  assert(tr._IRQ.floating)
  for (const i of range(8)) {
    const name = `D${i}`
    assert(chip[name].mode === OUTPUT)
    assert(tr[name].floating)
  }
}

export function flagDefault({ tr, readRegister }) {
  tr._FLAG.clear()
  assert(!tr._IRQ.low)
  const icr = readRegister(CIAICR)
  assert(bitSet(icr, ICR_FLG))
  assert(bitClear(icr, ICR_IR))
}

export function flagFlagSet({ tr, readRegister, writeRegister }) {
  writeRegister(CIAICR, 1 << ICR_SC | 1 << ICR_FLG)

  tr._FLAG.clear()
  assert(tr._IRQ.low)
  const icr = readRegister(CIAICR)
  assert(bitSet(icr, ICR_FLG))
  assert(bitSet(icr, ICR_IR))
}

export function flagFlagReset({ tr, readRegister, writeRegister }) {
  writeRegister(CIAICR, 1 << ICR_SC | 1 << ICR_FLG)
  writeRegister(CIAICR, 1 << ICR_FLG)

  tr._FLAG.clear()
  assert(!tr._IRQ.low)
  const icr = readRegister(CIAICR)
  assert(bitSet(icr, ICR_FLG))
  assert(bitClear(icr, ICR_IR))
}
