// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import {
  CIASDR,
  TIMALO,
  TIMAHI,
  CIACRA,
  CRA_LOAD,
  CRA_SP,
  CRA_START,
  CIAICR,
  ICR_SP,
  ICR_IR,
} from "chips/6526/constants"
import { bitSet } from "utils"

export function spInput({ tr, readRegister }) {
  const data = 0x2f

  for (let i = 7; i >= 0; i--) {
    tr.SP.level = (data >> i) & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  expect(readRegister(CIASDR)).to.equal(0x2f)
}

export function spInputWrite({ tr, writeRegister, readRegister }) {
  const data = 0x2f
  writeRegister(CIASDR, 0xa9)

  for (let i = 7; i >= 0; i--) {
    tr.SP.level = (data >> i) & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  expect(readRegister(CIASDR)).to.equal(0x2f)
}

export function spOutput({ tr, writeRegister }) {
  const data = 0xaf

  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_SP) | (1 << CRA_LOAD) | (1 << CRA_START))

  writeRegister(CIASDR, data)

  // Initial clock, before first timer underflow
  tr.φ2.set()
  tr.φ2.clear()
  expect(tr.SP.level).to.equal(0)
  expect(tr.CNT.level).to.equal(0)

  // 8 loops for 8 bits, MSB first
  for (let bit = 7; bit >= 0; bit--) {
    // First underflow, CNT is high and SP is the bit value
    for (let i = 0; i < 2; i++) {
      tr.φ2.set()
      tr.φ2.clear()
      expect(tr.CNT.level).to.equal(1)
      expect(tr.SP.level).to.equal((data >> bit) & 1)
    }
    // Second underflow, CNT drops (EXCEPT on the last pass, as CNT stays high after a value is done
    // being sent) but SP retains its value
    for (let i = 0; i < 2; i++) {
      tr.φ2.set()
      tr.φ2.clear()
      expect(tr.CNT.level).to.equal(bit === 0 ? 1 : 0)
      expect(tr.SP.level).to.equal((data >> bit) & 1)
    }
  }
}

export function spReady({ tr, writeRegister }) {
  const data = 0xaf

  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_SP) | (1 << CRA_LOAD) | (1 << CRA_START))

  writeRegister(CIASDR, 0x00)

  // Initial clock, before first timer underflow
  tr.φ2.set()
  tr.φ2.clear()
  expect(tr.SP.level).to.equal(0)
  expect(tr.CNT.level).to.equal(0)

  // Dropping a new value into the SDR as the old one is being transmitted; this one will
  // automatically begin when the first one finishes
  writeRegister(CIASDR, data)

  // pulse clock 32 times to shift out 8 bits from first value
  for (let i = 0; i < 32; i++) {
    tr.φ2.set()
    tr.φ2.clear()
  }

  // 8 loops for 8 bits, MSB first
  for (let bit = 7; bit >= 0; bit--) {
    // First underflow, CNT is high and SP is the bit value
    for (let i = 0; i < 2; i++) {
      tr.φ2.set()
      tr.φ2.clear()
      expect(tr.CNT.level).to.equal(1)
      expect(tr.SP.level).to.equal((data >> bit) & 1)
    }
    // Second underflow, CNT drops (EXCEPT on the last pass, as CNT stays high after a value is done
    // being sent) but SP retains its value
    for (let i = 0; i < 2; i++) {
      tr.φ2.set()
      tr.φ2.clear()
      expect(tr.CNT.level).to.equal(bit === 0 ? 1 : 0)
      expect(tr.SP.level).to.equal((data >> bit) & 1)
    }
  }
}

export function spIrqRxDefault({ tr, readRegister }) {
  const data = 0x2f

  for (let i = 7; i >= 0; i--) {
    tr.SP.level = (data >> i) & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  expect(tr._IRQ.low).to.be.false
  const icr = readRegister(CIAICR)
  expect(bitSet(icr, ICR_SP)).to.be.true
  expect(bitSet(icr, ICR_IR)).to.be.false
}

export function spIrqTxDefault({ tr, writeRegister, readRegister }) {
  const data = 0xaf

  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_SP) | (1 << CRA_LOAD) | (1 << CRA_START))

  writeRegister(CIASDR, data)

  // Initial clock, before first timer underflow
  tr.φ2.set()
  tr.φ2.clear()
  expect(tr.SP.level).to.equal(0)
  expect(tr.CNT.level).to.equal(0)

  for (let i = 0; i < 32; i++) {
    tr.φ2.set()
    tr.φ2.clear()
  }

  expect(tr._IRQ.low).to.be.false
  const icr = readRegister(CIAICR)
  expect(bitSet(icr, ICR_SP)).to.be.true
  expect(bitSet(icr, ICR_IR)).to.be.false
}

export function spIrqRxFlagSet({ tr, writeRegister, readRegister }) {
  const data = 0x2f
  writeRegister(CIAICR, (1 << ICR_IR) | (1 << ICR_SP))

  for (let i = 7; i >= 0; i--) {
    tr.SP.level = (data >> i) & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  expect(tr._IRQ.low).to.be.true
  const icr = readRegister(CIAICR)
  expect(bitSet(icr, ICR_SP)).to.be.true
  expect(bitSet(icr, ICR_IR)).to.be.true
}

export function spIrqTxFlagSet({ tr, writeRegister, readRegister }) {
  const data = 0xaf
  writeRegister(CIAICR, (1 << ICR_IR) | (1 << ICR_SP))

  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_SP) | (1 << CRA_LOAD) | (1 << CRA_START))

  writeRegister(CIASDR, data)

  // Initial clock, before first timer underflow
  tr.φ2.set()
  tr.φ2.clear()
  expect(tr.SP.level).to.equal(0)
  expect(tr.CNT.level).to.equal(0)

  for (let i = 0; i < 32; i++) {
    tr.φ2.set()
    tr.φ2.clear()
  }

  expect(tr._IRQ.low).to.be.true
  const icr = readRegister(CIAICR)
  expect(bitSet(icr, ICR_SP)).to.be.true
  expect(bitSet(icr, ICR_IR)).to.be.true
}
