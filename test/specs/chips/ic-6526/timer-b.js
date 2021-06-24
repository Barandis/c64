// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import {
  TBHI,
  TBLO,
  CRB,
  LOAD,
  START,
  RUNMODE,
  PBON,
  OUTMODE,
  INMODE0,
  TALO,
  TAHI,
  CRA,
  INMODE1,
  ICR,
  TB,
  IR,
  SC,
  DDRB,
} from 'chips/ic-6526/constants'
import Pin from 'components/pin'
import { bitSet, bitClear, range } from 'utils'

const { OUTPUT } = Pin

export function tbDefault({ readRegister }) {
  assert.equal(readRegister(TBHI), 0xff)
  assert.equal(readRegister(TBLO), 0xff)
}

export function tbClockDec({ tr, writeRegister, readRegister }) {
  writeRegister(CRB, 1 << START)

  for (const i of range(1, 10, true)) {
    tr.PHI2.set()
    assert.equal(readRegister(TBHI), 0xff)
    assert.equal(readRegister(TBLO), 0xff - i)
    tr.PHI2.clear()
  }
}

export function tbCntDec({ tr, writeRegister, readRegister }) {
  writeRegister(CRB, (1 << INMODE0) | (1 << START))

  for (const i of range(1, 10, true)) {
    tr.CNT.set()
    assert.equal(readRegister(TBHI), 0xff)
    assert.equal(readRegister(TBLO), 0xff - i)
    tr.CNT.clear()
  }
}

export function tbUnderDec({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << LOAD) | (1 << START))
  writeRegister(CRB, (1 << INMODE1) | (1 << START))

  for (const i of range(1, 10, true)) {
    for (const _ of range(2)) {
      tr.PHI2.set()
      tr.PHI2.clear()
    }
    assert.equal(readRegister(TBLO), 0xff - i)
    assert.equal(readRegister(TBHI), 0xff)
  }
}

export function tbCntUnderDec({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, (1 << LOAD) | (1 << START))
  writeRegister(CRB, (1 << INMODE1) | (1 << INMODE0) | (1 << START))

  tr.CNT.level = 0
  for (const _ of range(5)) {
    for (const __ of range(2)) {
      tr.PHI2.set()
      tr.PHI2.clear()
    }
    assert.equal(readRegister(TBLO), 0xff)
    assert.equal(readRegister(TBHI), 0xff)
  }

  tr.CNT.level = 1
  for (const j of range(1, 5, true)) {
    for (const _ of range(2)) {
      tr.PHI2.set()
      tr.PHI2.clear()
    }
    assert.equal(readRegister(TBLO), 0xff - j)
    assert.equal(readRegister(TBHI), 0xff)
  }
}

export function tbRegRollover({ tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 0x00)

  // Force this value into the timer register
  writeRegister(CRB, 1 << LOAD)
  assert.equal(readRegister(CRB), 0)

  // Start timer
  writeRegister(CRB, 1 << START)

  // One clock pulse
  tr.PHI2.set()
  assert.equal(readRegister(TBLO), 0xff)
  assert.equal(readRegister(TBHI), 0xfe)
  tr.PHI2.clear()
}

export function tbStop({ tr, writeRegister, readRegister }) {
  writeRegister(CRB, 1 << START)

  for (const i of range(1, 5, true)) {
    tr.PHI2.set()
    assert.equal(readRegister(TBHI), 0xff)
    assert.equal(readRegister(TBLO), 0xff - i)
    tr.PHI2.clear()
  }

  writeRegister(CRB, 0)

  for (const _ of range(5)) {
    tr.PHI2.set()
    assert.equal(readRegister(TBHI), 0xff)
    assert.equal(readRegister(TBLO), 0xfa)
    tr.PHI2.clear()
  }
}

export function tbContinue({ tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 2)
  writeRegister(TBHI, 0)
  writeRegister(CRB, (1 << LOAD) | (1 << START))

  for (const i of range(4)) {
    tr.PHI2.set()
    assert.equal(readRegister(TBLO), (i % 2) + 1)
    assert.equal(readRegister(TBHI), 0)
    tr.PHI2.clear()
  }
}

export function tbOneShot({ tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 2)
  writeRegister(TBHI, 0)
  writeRegister(CRB, (1 << LOAD) | (1 << RUNMODE) | (1 << START))

  tr.PHI2.set()
  assert.equal(readRegister(TBLO), 1)
  assert.equal(readRegister(TBHI), 0)
  tr.PHI2.clear()
  tr.PHI2.set()
  assert.equal(readRegister(TBLO), 2)
  assert.equal(readRegister(TBHI), 0)
  // START bit has been cleared
  assert.equal(readRegister(CRB), 1 << RUNMODE)
  tr.PHI2.clear()
  tr.PHI2.set()
  assert.equal(readRegister(TBLO), 2)
  assert.equal(readRegister(TBHI), 0)
  tr.PHI2.clear()
}

export function tbPbPulse({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 5)
  writeRegister(TBHI, 0)
  writeRegister(CRB, (1 << LOAD) | (1 << PBON) | (1 << START))

  assert.equal(readRegister(TBLO), 5)
  assert.equal(readRegister(TBHI), 0)
  assert.mode(chip.PB7, OUTPUT)
  assert.isLow(tr.PB7)

  for (const _ of range(3)) {
    for (const __ of range(4)) {
      tr.PHI2.set()
      assert.isLow(tr.PB7)
      tr.PHI2.clear()
    }
    tr.PHI2.set()
    assert.isHigh(tr.PB7)
    tr.PHI2.clear()
  }
}

export function tbPbToggle({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 5)
  writeRegister(TBHI, 0)
  writeRegister(CRB, (1 << LOAD) | (1 << OUTMODE) | (1 << PBON) | (1 << START))

  assert.equal(readRegister(TBLO), 5)
  assert.equal(readRegister(TBHI), 0)
  assert.mode(chip.PB7, OUTPUT)
  assert.isLow(tr.PB7)

  for (const i of range(3)) {
    for (const _ of range(4)) {
      tr.PHI2.set()
      assert.level(tr.PB7, i % 2)
      tr.PHI2.clear()
    }
    tr.PHI2.set()
    assert.level(tr.PB7, (i + 1) % 2)
    tr.PHI2.clear()
  }
}

export function tbPbRemove({ chip, tr, writeRegister }) {
  writeRegister(TBLO, 5)
  writeRegister(TBHI, 0)
  writeRegister(CRB, (1 << LOAD) | (1 << PBON))

  assert.mode(chip.PB7, OUTPUT)
  assert.isLow(tr.PB7)

  writeRegister(DDRB, 0xff)
  // PBON gets reset
  writeRegister(CRB, 1 << START)
  assert.mode(chip.PB7, OUTPUT)
}

export function tbIrqDefault({ tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 1)
  writeRegister(TBHI, 0)
  writeRegister(CRB, (1 << LOAD) | (1 << START))

  tr.PHI2.set()
  // IRQ line to CPU; low indicates a request, no request made here
  assert.isFalse(tr.IRQ.low)
  // Have to read this once, as the read clears it
  const icr = readRegister(ICR)
  // TA bit is set whether an interrupt is requested or not
  assert.isTrue(bitSet(icr, TB))
  // IR bit is only set when an interrupt is requested
  assert.isTrue(bitClear(icr, IR))
  // Expect the ICR to be clear since it was read above
  assert.equal(readRegister(ICR), 0)
  tr.PHI2.clear()
}

export function tbIrqFlagSet({ tr, writeRegister, readRegister }) {
  writeRegister(ICR, (1 << SC) | (1 << TB))
  writeRegister(TBLO, 1)
  writeRegister(TBHI, 0)
  writeRegister(CRB, (1 << LOAD) | (1 << START))

  tr.PHI2.set()
  // Line low, interrupt requested
  assert.isLow(tr.IRQ)
  const icr = readRegister(ICR)
  assert.isTrue(bitSet(icr, TB))
  // IR bit indicates an interrupt was actually fired
  assert.isTrue(bitSet(icr, IR))
  // IRQ signal is cleared by reading the ICR register
  assert.isFalse(tr.IRQ.low)
  assert.equal(readRegister(ICR), 0)
  tr.PHI2.clear()
}
