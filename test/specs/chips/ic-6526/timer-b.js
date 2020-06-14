// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from "test/helper"
import {
  TBHI, TBLO, CRB, LOAD, START, RUNMODE, PBON, OUTMODE, INMODE0, TALO, TAHI,
  CRA, INMODE1, ICR, TB, IR, SC, DDRB,
} from "chips/ic-6526/constants"
import { OUTPUT } from "components"
import { bitSet, bitClear, range } from "utils"

export function tbDefault({ readRegister }) {
  assert(readRegister(TBHI) === 0xff)
  assert(readRegister(TBLO) === 0xff)
}

export function tbClockDec({ tr, writeRegister, readRegister }) {
  writeRegister(CRB, 1 << START)

  for (const i of range(1, 10, true)) {
    tr.φ2.set()
    assert(readRegister(TBHI) === 0xff)
    assert(readRegister(TBLO) === 0xff - i)
    tr.φ2.clear()
  }
}

export function tbCntDec({ tr, writeRegister, readRegister }) {
  writeRegister(CRB, 1 << INMODE0 | 1 << START)

  for (const i of range(1, 10, true)) {
    tr.CNT.set()
    assert(readRegister(TBHI) === 0xff)
    assert(readRegister(TBLO) === 0xff - i)
    tr.CNT.clear()
  }
}

export function tbUnderDec({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, 1 << LOAD | 1 << START)
  writeRegister(CRB, 1 << INMODE1 | 1 << START)

  for (const i of range(1, 10, true)) {
    for (const _ of range(2)) {
      tr.φ2.set()
      tr.φ2.clear()
    }
    assert(readRegister(TBLO) === 0xff - i)
    assert(readRegister(TBHI) === 0xff)
  }
}

export function tbCntUnderDec({ tr, writeRegister, readRegister }) {
  writeRegister(TALO, 2)
  writeRegister(TAHI, 0)
  writeRegister(CRA, 1 << LOAD | 1 << START)
  writeRegister(CRB, 1 << INMODE1 | 1 << INMODE0 | 1 << START)

  tr.CNT.level = 0
  for (const _ of range(5)) {
    for (const _ of range(2)) {
      tr.φ2.set()
      tr.φ2.clear()
    }
    assert(readRegister(TBLO) === 0xff)
    assert(readRegister(TBHI) === 0xff)
  }

  tr.CNT.level = 1
  for (const j of range(1, 5, true)) {
    for (const _ of range(2)) {
      tr.φ2.set()
      tr.φ2.clear()
    }
    assert(readRegister(TBLO) === 0xff - j)
    assert(readRegister(TBHI) === 0xff)
  }
}

export function tbRegRollover({ tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 0x00)

  // Force this value into the timer register
  writeRegister(CRB, 1 << LOAD)
  assert(readRegister(CRB) === 0)

  // Start timer
  writeRegister(CRB, 1 << START)

  // One clock pulse
  tr.φ2.set()
  assert(readRegister(TBLO) === 0xff)
  assert(readRegister(TBHI) === 0xfe)
  tr.φ2.clear()
}

export function tbStop({ tr, writeRegister, readRegister }) {
  writeRegister(CRB, 1 << START)

  for (const i of range(1, 5, true)) {
    tr.φ2.set()
    assert(readRegister(TBHI) === 0xff)
    assert(readRegister(TBLO) === 0xff - i)
    tr.φ2.clear()
  }

  writeRegister(CRB, 0)

  for (const _ of range(5)) {
    tr.φ2.set()
    assert(readRegister(TBHI) === 0xff)
    assert(readRegister(TBLO) === 0xfa)
    tr.φ2.clear()
  }
}

export function tbContinue({ tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 2)
  writeRegister(TBHI, 0)
  writeRegister(CRB, 1 << LOAD | 1 << START)

  for (const i of range(4)) {
    tr.φ2.set()
    assert(readRegister(TBLO) === i % 2 + 1)
    assert(readRegister(TBHI) === 0)
    tr.φ2.clear()
  }
}

export function tbOneShot({ tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 2)
  writeRegister(TBHI, 0)
  writeRegister(CRB, 1 << LOAD | 1 << RUNMODE | 1 << START)

  tr.φ2.set()
  assert(readRegister(TBLO) === 1)
  assert(readRegister(TBHI) === 0)
  tr.φ2.clear()
  tr.φ2.set()
  assert(readRegister(TBLO) === 2)
  assert(readRegister(TBHI) === 0)
  // START bit has been cleared
  assert(readRegister(CRB) === 1 << RUNMODE)
  tr.φ2.clear()
  tr.φ2.set()
  assert(readRegister(TBLO) === 2)
  assert(readRegister(TBHI) === 0)
  tr.φ2.clear()
}

export function tbPbPulse({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 5)
  writeRegister(TBHI, 0)
  writeRegister(CRB, 1 << LOAD | 1 << PBON | 1 << START)

  assert(readRegister(TBLO) === 5)
  assert(readRegister(TBHI) === 0)
  assert(chip.PB7.mode === OUTPUT)
  assert(tr.PB7.low)

  for (const _ of range(3)) {
    for (const _ of range(4)) {
      tr.φ2.set()
      assert(tr.PB7.low)
      tr.φ2.clear()
    }
    tr.φ2.set()
    assert(tr.PB7.high)
    tr.φ2.clear()
  }
}

export function tbPbToggle({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 5)
  writeRegister(TBHI, 0)
  writeRegister(
    CRB,
    1 << LOAD | 1 << OUTMODE | 1 << PBON | 1 << START
  )

  assert(readRegister(TBLO) === 5)
  assert(readRegister(TBHI) === 0)
  assert(chip.PB7.mode === OUTPUT)
  assert(tr.PB7.low)

  for (const i of range(3)) {
    for (const _ of range(4)) {
      tr.φ2.set()
      assert(tr.PB7.level === i % 2)
      tr.φ2.clear()
    }
    tr.φ2.set()
    assert(tr.PB7.level === (i + 1) % 2)
    tr.φ2.clear()
  }
}

export function tbPbRemove({ chip, tr, writeRegister }) {
  writeRegister(TBLO, 5)
  writeRegister(TBHI, 0)
  writeRegister(CRB, 1 << LOAD | 1 << PBON)

  assert(chip.PB7.mode === OUTPUT)
  assert(tr.PB7.low)

  writeRegister(DDRB, 0xff)
  // PBON gets reset
  writeRegister(CRB, 1 << START)
  assert(chip.PB7.mode === OUTPUT)
}

export function tbIrqDefault({ tr, writeRegister, readRegister }) {
  writeRegister(TBLO, 1)
  writeRegister(TBHI, 0)
  writeRegister(CRB, 1 << LOAD | 1 << START)

  tr.φ2.set()
  // IRQ line to CPU; low indicates a request, no request made here
  assert(!tr._IRQ.low)
  // Have to read this once, as the read clears it
  const icr = readRegister(ICR)
  // TA bit is set whether an interrupt is requested or not
  assert(bitSet(icr, TB))
  // IR bit is only set when an interrupt is requested
  assert(bitClear(icr, IR))
  // Expect the ICR to be clear since it was read above
  assert(readRegister(ICR) === 0)
  tr.φ2.clear()
}

export function tbIrqFlagSet({ tr, writeRegister, readRegister }) {
  writeRegister(ICR, 1 << SC | 1 << TB)
  writeRegister(TBLO, 1)
  writeRegister(TBHI, 0)
  writeRegister(CRB, 1 << LOAD | 1 << START)

  tr.φ2.set()
  // Line low, interrupt requested
  assert(tr._IRQ.low)
  const icr = readRegister(ICR)
  assert(bitSet(icr, TB))
  // IR bit indicates an interrupt was actually fired
  assert(bitSet(icr, IR))
  // _IRQ signal is cleared by reading the ICR register
  assert(!tr._IRQ.low)
  assert(readRegister(ICR) === 0)
  tr.φ2.clear()
}
