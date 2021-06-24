// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import {
  TAHI,
  TALO,
  CRA,
  LOAD,
  START,
  RUNMODE,
  PBON,
  OUTMODE,
  INMODE,
  ICR,
  TA,
  IR,
  SC,
  DDRA,
} from 'chips/ic-6526/constants'
import Pin from 'components/pin'
import { bitSet, bitClear, range } from 'utils'

const { OUTPUT } = Pin

export function taDefault({ readRegister }) {
  assert.equal(readRegister(TAHI), 0xff)
  assert.equal(readRegister(TALO), 0xff)
}

export function taClockDec({ tr, writeRegister, readRegister }) {
  writeRegister(CRA, 1 << START)

  for (const i of range(1, 10, true)) {
    tr.PHI2.set()
    assert.equal(readRegister(TAHI), 0xff)
    assert.equal(readRegister(TALO), 0xff - i)
    tr.PHI2.clear()
  }
}

export function taCntDec({ tr, writeRegister, readRegister }) {
  writeRegister(CRA, (1 << INMODE) | (1 << START))

  for (const i of range(1, 10, true)) {
    tr.CNT.set()
    assert.equal(readRegister(TAHI), 0xff)
    assert.equal(readRegister(TALO), 0xff - i)
    tr.CNT.clear()
  }
}

export function taRegRollover({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 0x00)

  // Force this value into the timer register
  writeRegister(CRA, 1 << LOAD)
  assert.equal(readRegister(CRA), 0)

  // Start timer
  writeRegister(CRA, 1 << START)

  // One clock pulse
  tr.PHI2.set()
  assert.equal(readRegister(TALO), 0xff)
  assert.equal(readRegister(TAHI), 0xfe)
  tr.PHI2.clear()
}

export function taStop({ tr, writeRegister, readRegister }) {
  writeRegister(CRA, 1 << START)

  for (const i of range(1, 5, true)) {
    tr.PHI2.set()
    assert.equal(readRegister(TAHI), 0xff)
    assert.equal(readRegister(TALO), 0xff - i)
    tr.PHI2.clear()
  }

  writeRegister(CRA, 0)

  for (const _ of range(1, 5, true)) {
    tr.PHI2.set()
    assert.equal(readRegister(TAHI), 0xff)
    assert.equal(readRegister(TALO), 0xfa)
    tr.PHI2.clear()
  }
}

export function taContinue({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << LOAD) | (1 << START))

  for (const i of range(4)) {
    tr.PHI2.set()
    assert.equal(readRegister(TALO), (i % 2) + 1)
    assert.equal(readRegister(TAHI), 0)
    tr.PHI2.clear()
  }
}

export function taOneShot({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << LOAD) | (1 << RUNMODE) | (1 << START))

  tr.PHI2.set()
  assert.equal(readRegister(TALO), 1)
  assert.equal(readRegister(TAHI), 0)
  tr.PHI2.clear()
  tr.PHI2.set()
  assert.equal(readRegister(TALO), 2)
  assert.equal(readRegister(TAHI), 0)
  // START bit has been cleared
  assert.equal(readRegister(CRA), 1 << RUNMODE)
  tr.PHI2.clear()
  tr.PHI2.set()
  assert.equal(readRegister(TALO), 2)
  assert.equal(readRegister(TAHI), 0)
  tr.PHI2.clear()
}

export function taPbPulse({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TALO, 5)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << LOAD) | (1 << PBON) | (1 << START))

  assert.equal(readRegister(TALO), 5)
  assert.equal(readRegister(TAHI), 0)
  assert.mode(chip.PB6, OUTPUT)
  assert.isLow(tr.PB6)

  for (const _ of range(3)) {
    for (const __ of range(4)) {
      tr.PHI2.set()
      assert.isLow(tr.PB6)
      tr.PHI2.clear()
    }
    tr.PHI2.set()
    assert.isHigh(tr.PB6)
    tr.PHI2.clear()
  }
}

export function taPbToggle({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TALO, 5)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << LOAD) | (1 << OUTMODE) | (1 << PBON) | (1 << START))

  assert.equal(readRegister(TALO), 5)
  assert.equal(readRegister(TAHI), 0)
  assert.mode(chip.PB6, OUTPUT)
  assert.isLow(tr.PB6)

  for (const i of range(3)) {
    for (const _ of range(4)) {
      tr.PHI2.set()
      assert.level(tr.PB6, i % 2)
      tr.PHI2.clear()
    }
    tr.PHI2.set()
    assert.level(tr.PB6, (i + 1) % 2)
    tr.PHI2.clear()
  }
}

export function taPbRemove({ chip, tr, writeRegister }) {
  writeRegister(TALO, 5)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << LOAD) | (1 << PBON))

  assert.mode(chip.PB6, OUTPUT)
  assert.isLow(tr.PB6)

  writeRegister(DDRA, 0xff)
  // PBON gets reset
  writeRegister(CRA, 1 << START)
  assert.mode(chip.PB6, OUTPUT)
}

export function taIrqDefault({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 1)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << LOAD) | (1 << START))

  tr.PHI2.set()
  // IRQ line to CPU; low indicates a request, no request made here
  assert.isFalse(tr.IRQ.low)
  // Have to read this once, as the read clears it
  const icr = readRegister(ICR)
  // TA bit is set whether an interrupt is requested or not
  assert.isTrue(bitSet(icr, TA))
  // IR bit is only set when an interrupt is requested
  assert.isTrue(bitClear(icr, IR))
  // Expect the ICR to be clear since it was read above
  assert.equal(readRegister(ICR), 0)
  tr.PHI2.clear()
}

export function taIrqFlagSet({ tr, writeRegister, readRegister }) {
  writeRegister(ICR, (1 << SC) | (1 << TA))
  writeRegister(TALO, 1)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << LOAD) | (1 << START))

  tr.PHI2.set()
  // Line low, interrupt requested
  assert.isLow(tr.IRQ)
  const icr = readRegister(ICR)
  assert.isTrue(bitSet(icr, TA))
  // IR bit indicates an interrupt was actually fired
  assert.isTrue(bitSet(icr, IR))
  // IRQ signal is cleared by reading the ICR register
  assert.isFalse(tr.IRQ.low)
  assert.equal(readRegister(ICR), 0)
  tr.PHI2.clear()
}
