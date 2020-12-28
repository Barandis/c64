// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import {
  TAHI, TALO, CRA, LOAD, START, RUNMODE, PBON, OUTMODE, INMODE, ICR, TA, IR,
  SC, DDRA,
} from 'chips/ic-6526/constants'
import Pin from 'components/pin'
import { bitSet, bitClear, range } from 'utils'

const OUTPUT = Pin.OUTPUT

export function taDefault({ readRegister }) {
  assert(readRegister(TAHI) === 0xff)
  assert(readRegister(TALO) === 0xff)
}

export function taClockDec({ tr, writeRegister, readRegister }) {
  writeRegister(CRA, 1 << START)

  for (const i of range(1, 10, true)) {
    tr.φ2.set()
    assert(readRegister(TAHI) === 0xff)
    assert(readRegister(TALO) === 0xff - i)
    tr.φ2.clear()
  }
}

export function taCntDec({ tr, writeRegister, readRegister }) {
  writeRegister(CRA, 1 << INMODE | 1 << START)

  for (const i of range(1, 10, true)) {
    tr.CNT.set()
    assert(readRegister(TAHI) === 0xff)
    assert(readRegister(TALO) === 0xff - i)
    tr.CNT.clear()
  }
}

export function taRegRollover({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 0x00)

  // Force this value into the timer register
  writeRegister(CRA, 1 << LOAD)
  assert(readRegister(CRA) === 0)

  // Start timer
  writeRegister(CRA, 1 << START)

  // One clock pulse
  tr.φ2.set()
  assert(readRegister(TALO) === 0xff)
  assert(readRegister(TAHI) === 0xfe)
  tr.φ2.clear()
}

export function taStop({ tr, writeRegister, readRegister }) {
  writeRegister(CRA, 1 << START)

  for (const i of range(1, 5, true)) {
    tr.φ2.set()
    assert(readRegister(TAHI) === 0xff)
    assert(readRegister(TALO) === 0xff - i)
    tr.φ2.clear()
  }

  writeRegister(CRA, 0)

  for (const _ of range(1, 5, true)) {
    tr.φ2.set()
    assert(readRegister(TAHI) === 0xff)
    assert(readRegister(TALO) === 0xfa)
    tr.φ2.clear()
  }
}

export function taContinue({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, 1 << LOAD | 1 << START)

  for (const i of range(4)) {
    tr.φ2.set()
    assert(readRegister(TALO) === i % 2 + 1)
    assert(readRegister(TAHI) === 0)
    tr.φ2.clear()
  }
}

export function taOneShot({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, 1 << LOAD | 1 << RUNMODE | 1 << START)

  tr.φ2.set()
  assert(readRegister(TALO) === 1)
  assert(readRegister(TAHI) === 0)
  tr.φ2.clear()
  tr.φ2.set()
  assert(readRegister(TALO) === 2)
  assert(readRegister(TAHI) === 0)
  // START bit has been cleared
  assert(readRegister(CRA) === 1 << RUNMODE)
  tr.φ2.clear()
  tr.φ2.set()
  assert(readRegister(TALO) === 2)
  assert(readRegister(TAHI) === 0)
  tr.φ2.clear()
}

export function taPbPulse({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TALO, 5)
  writeRegister(TAHI, 0)
  writeRegister(CRA, 1 << LOAD | 1 << PBON | 1 << START)

  assert(readRegister(TALO) === 5)
  assert(readRegister(TAHI) === 0)
  assert(chip.PB6.mode === OUTPUT)
  assert(tr.PB6.low)

  for (const _ of range(3)) {
    for (const _ of range(4)) {
      tr.φ2.set()
      assert(tr.PB6.low)
      tr.φ2.clear()
    }
    tr.φ2.set()
    assert(tr.PB6.high)
    tr.φ2.clear()
  }
}

export function taPbToggle({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TALO, 5)
  writeRegister(TAHI, 0)
  writeRegister(
    CRA,
    1 << LOAD | 1 << OUTMODE | 1 << PBON | 1 << START,
  )

  assert(readRegister(TALO) === 5)
  assert(readRegister(TAHI) === 0)
  assert(chip.PB6.mode === OUTPUT)
  assert(tr.PB6.low)

  for (const i of range(3)) {
    for (const _ of range(4)) {
      tr.φ2.set()
      assert(tr.PB6.level === i % 2)
      tr.φ2.clear()
    }
    tr.φ2.set()
    assert(tr.PB6.level === (i + 1) % 2)
    tr.φ2.clear()
  }
}

export function taPbRemove({ chip, tr, writeRegister }) {
  writeRegister(TALO, 5)
  writeRegister(TAHI, 0)
  writeRegister(CRA, 1 << LOAD | 1 << PBON)

  assert(chip.PB6.mode === OUTPUT)
  assert(tr.PB6.low)

  writeRegister(DDRA, 0xff)
  // PBON gets reset
  writeRegister(CRA, 1 << START)
  assert(chip.PB6.mode === OUTPUT)
}

export function taIrqDefault({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 1)
  writeRegister(TAHI, 0)
  writeRegister(CRA, 1 << LOAD | 1 << START)

  tr.φ2.set()
  // IRQ line to CPU; low indicates a request, no request made here
  assert(!tr._IRQ.low)
  // Have to read this once, as the read clears it
  const icr = readRegister(ICR)
  // TA bit is set whether an interrupt is requested or not
  assert(bitSet(icr, TA))
  // IR bit is only set when an interrupt is requested
  assert(bitClear(icr, IR))
  // Expect the ICR to be clear since it was read above
  assert(readRegister(ICR) === 0)
  tr.φ2.clear()
}

export function taIrqFlagSet({ tr, writeRegister, readRegister }) {
  writeRegister(ICR, 1 << SC | 1 << TA)
  writeRegister(TALO, 1)
  writeRegister(TAHI, 0)
  writeRegister(CRA, 1 << LOAD | 1 << START)

  tr.φ2.set()
  // Line low, interrupt requested
  assert(tr._IRQ.low)
  const icr = readRegister(ICR)
  assert(bitSet(icr, TA))
  // IR bit indicates an interrupt was actually fired
  assert(bitSet(icr, IR))
  // _IRQ signal is cleared by reading the ICR register
  assert(!tr._IRQ.low)
  assert(readRegister(ICR) === 0)
  tr.φ2.clear()
}
