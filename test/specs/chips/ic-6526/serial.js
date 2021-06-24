// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import { SDR, TALO, TAHI, CRA, LOAD, SPMODE, START, ICR, SP, IR } from 'chips/ic-6526/constants'
import { bitSet, bitClear, range } from 'utils'

export function spInput({ tr, readRegister }) {
  const data = 0x2f

  for (const i of range(7, 0, true)) {
    tr.SP.level = (data >> i) & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  const value = readRegister(SDR)
  assert.equal(value, 0x2f)
}

export function spInputWrite({ tr, writeRegister, readRegister }) {
  const data = 0x2f
  writeRegister(SDR, 0xa9)

  for (const i of range(7, 0, true)) {
    tr.SP.level = (data >> i) & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  assert.equal(readRegister(SDR), 0x2f)
}

export function spOutput({ tr, writeRegister }) {
  const data = 0xaf

  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << SPMODE) | (1 << LOAD) | (1 << START))

  writeRegister(SDR, data)

  // Initial clock, before first timer underflow
  tr.PHI2.set()
  tr.PHI2.clear()
  assert.isLow(tr.SP)
  assert.isLow(tr.CNT)

  // 8 loops for 8 bits, MSB first
  for (const bit of range(7, 0, true)) {
    // First underflow, CNT is high and SP is the bit value
    for (const _ of range(2)) {
      tr.PHI2.set()
      tr.PHI2.clear()
      assert.isHigh(tr.CNT)
      assert.level(tr.SP, (data >> bit) & 1)
    }
    // Second underflow, CNT drops (EXCEPT on the last pass, as CNT stays high after a value
    // is done being sent) but SP retains its value
    for (const _ of range(2)) {
      tr.PHI2.set()
      tr.PHI2.clear()
      assert.level(tr.CNT, bit === 0 ? 1 : 0)
      assert.level(tr.SP, (data >> bit) & 1)
    }
  }
}

export function spReady({ tr, writeRegister }) {
  const data = 0xaf

  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << SPMODE) | (1 << LOAD) | (1 << START))

  writeRegister(SDR, 0x00)

  // Initial clock, before first timer underflow
  tr.PHI2.set()
  tr.PHI2.clear()
  assert.isLow(tr.SP)
  assert.isLow(tr.CNT)

  // Dropping a new value into the SDR as the old one is being transmitted; this one will
  // automatically begin when the first one finishes
  writeRegister(SDR, data)

  // pulse clock 32 times to shift out 8 bits from first value
  for (const _ of range(32)) {
    tr.PHI2.set()
    tr.PHI2.clear()
  }

  // 8 loops for 8 bits, MSB first
  for (const bit of range(7, 0, true)) {
    // First underflow, CNT is high and SP is the bit value
    for (const _ of range(2)) {
      tr.PHI2.set()
      tr.PHI2.clear()
      assert.isHigh(tr.CNT)
      assert.level(tr.SP, (data >> bit) & 1)
    }
    // Second underflow, CNT drops (EXCEPT on the last pass, as CNT
    // stays high after a value is done being sent) but SP retains its
    // value
    for (const _ of range(2)) {
      tr.PHI2.set()
      tr.PHI2.clear()
      assert.level(tr.CNT, bit === 0 ? 1 : 0)
      assert.level(tr.SP, (data >> bit) & 1)
    }
  }
}

export function spIrqRxDefault({ tr, readRegister }) {
  const data = 0x2f

  for (const i of range(7, 0, true)) {
    tr.SP.level = (data >> i) & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  assert.isFalse(tr.IRQ.low)
  const icr = readRegister(ICR)
  assert.isTrue(bitSet(icr, SP))
  assert.isTrue(bitClear(icr, IR))
}

export function spIrqTxDefault({ tr, writeRegister, readRegister }) {
  const data = 0xaf

  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << SPMODE) | (1 << LOAD) | (1 << START))

  writeRegister(SDR, data)

  // Initial clock, before first timer underflow
  tr.PHI2.set()
  tr.PHI2.clear()
  assert.isLow(tr.SP)
  assert.isLow(tr.CNT)

  for (const _ of range(32)) {
    tr.PHI2.set()
    tr.PHI2.clear()
  }

  assert.isFalse(tr.IRQ.low)
  const icr = readRegister(ICR)
  assert.isTrue(bitSet(icr, SP))
  assert.isTrue(bitClear(icr, IR))
}

export function spIrqRxFlagSet({ tr, writeRegister, readRegister }) {
  const data = 0x2f
  writeRegister(ICR, (1 << IR) | (1 << SP))

  for (const i of range(7, 0, true)) {
    tr.SP.level = (data >> i) & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  assert.isLow(tr.IRQ)
  const icr = readRegister(ICR)
  assert.isTrue(bitSet(icr, SP))
  assert.isTrue(bitSet(icr, IR))
}

export function spIrqTxFlagSet({ tr, writeRegister, readRegister }) {
  const data = 0xaf
  writeRegister(ICR, (1 << IR) | (1 << SP))

  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << SPMODE) | (1 << LOAD) | (1 << START))

  writeRegister(SDR, data)

  // Initial clock, before first timer underflow
  tr.PHI2.set()
  tr.PHI2.clear()
  assert.isLow(tr.SP)
  assert.isLow(tr.CNT)

  for (const _ of range(32)) {
    tr.PHI2.set()
    tr.PHI2.clear()
  }

  assert.isLow(tr.IRQ)
  const icr = readRegister(ICR)
  assert.isTrue(bitSet(icr, SP))
  assert.isTrue(bitSet(icr, IR))
}
