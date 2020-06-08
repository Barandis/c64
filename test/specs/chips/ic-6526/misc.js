// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { rand, expect } from "test/helper"
import { INPUT, OUTPUT } from "components/pin"
import {
  TIMBHI, TIMALO, CIAICR, ICR_FLG, ICR_IR, ICR_SC, CIAPRB,
} from "chips/ic-6526/constants"
import { bitSet } from "utils"

export function reset({ chip, tr, writeRegister, readRegister }) {
  for (let i = 0; i < 16; i++) {
    writeRegister(i, rand(256))
  }
  tr._RES.clear()
  tr._RES.set()
  for (let i = 0; i < 16; i++) {
    expect(readRegister(i))
      .to.equal(i <= CIAPRB || i >= TIMALO && i <= TIMBHI ? 255 : 0)
  }
  expect(chip.CNT.mode).to.equal(INPUT)
  expect(tr._IRQ.level).to.be.null
  for (let i = 0; i < 8; i++) {
    const name = `D${i}`
    expect(chip[name].mode).to.equal(OUTPUT)
    expect(tr[name].level).to.be.null
  }
}

export function flagDefault({ tr, readRegister }) {
  tr._FLAG.clear()
  expect(tr._IRQ.low).to.be.false
  const icr = readRegister(CIAICR)
  expect(bitSet(icr, ICR_FLG)).to.be.true
  expect(bitSet(icr, ICR_IR)).to.be.false
}

export function flagFlagSet({ tr, readRegister, writeRegister }) {
  writeRegister(CIAICR, 1 << ICR_SC | 1 << ICR_FLG)

  tr._FLAG.clear()
  expect(tr._IRQ.low).to.be.true
  const icr = readRegister(CIAICR)
  expect(bitSet(icr, ICR_FLG)).to.be.true
  expect(bitSet(icr, ICR_IR)).to.be.true
}

export function flagFlagReset({ tr, readRegister, writeRegister }) {
  writeRegister(CIAICR, 1 << ICR_SC | 1 << ICR_FLG)
  writeRegister(CIAICR, 1 << ICR_FLG)

  tr._FLAG.clear()
  expect(tr._IRQ.low).to.be.false
  const icr = readRegister(CIAICR)
  expect(bitSet(icr, ICR_FLG)).to.be.true
  expect(bitSet(icr, ICR_IR)).to.be.false
}
