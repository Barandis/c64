// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from "test/helper"
import {
  TIMBHI, TIMBLO, CIACRB, CRB_LOAD, CRB_START, CRB_RUN, CRB_PBON, CRB_OUT,
  CRB_IN0, TIMALO, TIMAHI, CIACRA, CRA_START, CRB_IN1, CRA_LOAD, CIAICR, ICR_TB,
  ICR_IR, ICR_SC, CIDDRB,
} from "chips/ic-6526/constants"
import { OUTPUT } from "components/pin"
import { bitSet, bitClear, range } from "utils"

export function tbDefault({ readRegister }) {
  assert(readRegister(TIMBHI) === 0xff)
  assert(readRegister(TIMBLO) === 0xff)
}

export function tbClockDec({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRB, 1 << CRB_START)

  for (const i of range(1, 10, true)) {
    tr.φ2.set()
    assert(readRegister(TIMBHI) === 0xff)
    assert(readRegister(TIMBLO) === 0xff - i)
    tr.φ2.clear()
  }
}

export function tbCntDec({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRB, 1 << CRB_IN0 | 1 << CRB_START)

  for (const i of range(1, 10, true)) {
    tr.CNT.set()
    assert(readRegister(TIMBHI) === 0xff)
    assert(readRegister(TIMBLO) === 0xff - i)
    tr.CNT.clear()
  }
}

export function tbUnderDec({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_LOAD | 1 << CRA_START)
  writeRegister(CIACRB, 1 << CRB_IN1 | 1 << CRB_START)

  for (const i of range(1, 10, true)) {
    for (const _ of range(2)) {
      tr.φ2.set()
      tr.φ2.clear()
    }
    assert(readRegister(TIMBLO) === 0xff - i)
    assert(readRegister(TIMBHI) === 0xff)
  }
}

export function tbCntUnderDec({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_LOAD | 1 << CRA_START)
  writeRegister(CIACRB, 1 << CRB_IN1 | 1 << CRB_IN0 | 1 << CRB_START)

  tr.CNT.level = 0
  for (const _ of range(5)) {
    for (const _ of range(2)) {
      tr.φ2.set()
      tr.φ2.clear()
    }
    assert(readRegister(TIMBLO) === 0xff)
    assert(readRegister(TIMBHI) === 0xff)
  }

  tr.CNT.level = 1
  for (const j of range(1, 5, true)) {
    for (const _ of range(2)) {
      tr.φ2.set()
      tr.φ2.clear()
    }
    assert(readRegister(TIMBLO) === 0xff - j)
    assert(readRegister(TIMBHI) === 0xff)
  }
}

export function tbRegRollover({ tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 0x00)

  // Force this value into the timer register
  writeRegister(CIACRB, 1 << CRB_LOAD)
  assert(readRegister(CIACRB) === 0)

  // Start timer
  writeRegister(CIACRB, 1 << CRB_START)

  // One clock pulse
  tr.φ2.set()
  assert(readRegister(TIMBLO) === 0xff)
  assert(readRegister(TIMBHI) === 0xfe)
  tr.φ2.clear()
}

export function tbStop({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRB, 1 << CRB_START)

  for (const i of range(1, 5, true)) {
    tr.φ2.set()
    assert(readRegister(TIMBHI) === 0xff)
    assert(readRegister(TIMBLO) === 0xff - i)
    tr.φ2.clear()
  }

  writeRegister(CIACRB, 0)

  for (const _ of range(5)) {
    tr.φ2.set()
    assert(readRegister(TIMBHI) === 0xff)
    assert(readRegister(TIMBLO) === 0xfa)
    tr.φ2.clear()
  }
}

export function tbContinue({ tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 2)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, 1 << CRB_LOAD | 1 << CRB_START)

  for (const i of range(4)) {
    tr.φ2.set()
    assert(readRegister(TIMBLO) === i % 2 + 1)
    assert(readRegister(TIMBHI) === 0)
    tr.φ2.clear()
  }
}

export function tbOneShot({ tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 2)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, 1 << CRB_LOAD | 1 << CRB_RUN | 1 << CRB_START)

  tr.φ2.set()
  assert(readRegister(TIMBLO) === 1)
  assert(readRegister(TIMBHI) === 0)
  tr.φ2.clear()
  tr.φ2.set()
  assert(readRegister(TIMBLO) === 2)
  assert(readRegister(TIMBHI) === 0)
  // START bit has been cleared
  assert(readRegister(CIACRB) === 1 << CRB_RUN)
  tr.φ2.clear()
  tr.φ2.set()
  assert(readRegister(TIMBLO) === 2)
  assert(readRegister(TIMBHI) === 0)
  tr.φ2.clear()
}

export function tbPbPulse({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 5)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, 1 << CRB_LOAD | 1 << CRB_PBON | 1 << CRB_START)

  assert(readRegister(TIMBLO) === 5)
  assert(readRegister(TIMBHI) === 0)
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
  writeRegister(TIMBLO, 5)
  writeRegister(TIMBHI, 0)
  writeRegister(
    CIACRB,
    1 << CRB_LOAD | 1 << CRB_OUT | 1 << CRB_PBON | 1 << CRB_START
  )

  assert(readRegister(TIMBLO) === 5)
  assert(readRegister(TIMBHI) === 0)
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
  writeRegister(TIMBLO, 5)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, 1 << CRB_LOAD | 1 << CRB_PBON)

  assert(chip.PB7.mode === OUTPUT)
  assert(tr.PB7.low)

  writeRegister(CIDDRB, 0xff)
  // PBON gets reset
  writeRegister(CIACRB, 1 << CRB_START)
  assert(chip.PB7.mode === OUTPUT)
}

export function tbIrqDefault({ tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 1)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, 1 << CRB_LOAD | 1 << CRB_START)

  tr.φ2.set()
  // IRQ line to CPU; low indicates a request, no request made here
  assert(!tr._IRQ.low)
  // Have to read this once, as the read clears it
  const icr = readRegister(CIAICR)
  // TA bit is set whether an interrupt is requested or not
  assert(bitSet(icr, ICR_TB))
  // IR bit is only set when an interrupt is requested
  assert(bitClear(icr, ICR_IR))
  // Expect the ICR to be clear since it was read above
  assert(readRegister(CIAICR) === 0)
  tr.φ2.clear()
}

export function tbIrqFlagSet({ tr, writeRegister, readRegister }) {
  writeRegister(CIAICR, 1 << ICR_SC | 1 << ICR_TB)
  writeRegister(TIMBLO, 1)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, 1 << CRB_LOAD | 1 << CRB_START)

  tr.φ2.set()
  // Line low, interrupt requested
  assert(tr._IRQ.low)
  const icr = readRegister(CIAICR)
  assert(bitSet(icr, ICR_TB))
  // IR bit indicates an interrupt was actually fired
  assert(bitSet(icr, ICR_IR))
  // _IRQ signal is cleared by reading the ICR register
  assert(!tr._IRQ.low)
  assert(readRegister(CIAICR) === 0)
  tr.φ2.clear()
}
