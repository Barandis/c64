// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from "test/helper"
import {
  TIMAHI, TIMALO, CIACRA, CRA_LOAD, CRA_START, CRA_RUN, CRA_PBON, CRA_OUT,
  CRA_IN, CIAICR, ICR_TA, ICR_IR, ICR_SC, CIDDRA,
} from "chips/ic-6526/constants"
import { OUTPUT } from "components/pin"
import { bitSet, bitClear, range } from "utils"

export function taDefault({ readRegister }) {
  assert(readRegister(TIMAHI) === 0xff)
  assert(readRegister(TIMALO) === 0xff)
}

export function taClockDec({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRA, 1 << CRA_START)

  for (const i of range(1, 10, true)) {
    tr.φ2.set()
    assert(readRegister(TIMAHI) === 0xff)
    assert(readRegister(TIMALO) === 0xff - i)
    tr.φ2.clear()
  }
}

export function taCntDec({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRA, 1 << CRA_IN | 1 << CRA_START)

  for (const i of range(1, 10, true)) {
    tr.CNT.set()
    assert(readRegister(TIMAHI) === 0xff)
    assert(readRegister(TIMALO) === 0xff - i)
    tr.CNT.clear()
  }
}

export function taRegRollover({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 0x00)

  // Force this value into the timer register
  writeRegister(CIACRA, 1 << CRA_LOAD)
  assert(readRegister(CIACRA) === 0)

  // Start timer
  writeRegister(CIACRA, 1 << CRA_START)

  // One clock pulse
  tr.φ2.set()
  assert(readRegister(TIMALO) === 0xff)
  assert(readRegister(TIMAHI) === 0xfe)
  tr.φ2.clear()
}

export function taStop({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRA, 1 << CRA_START)

  for (const i of range(1, 5, true)) {
    tr.φ2.set()
    assert(readRegister(TIMAHI) === 0xff)
    assert(readRegister(TIMALO) === 0xff - i)
    tr.φ2.clear()
  }

  writeRegister(CIACRA, 0)

  for (const _ of range(1, 5, true)) {
    tr.φ2.set()
    assert(readRegister(TIMAHI) === 0xff)
    assert(readRegister(TIMALO) === 0xfa)
    tr.φ2.clear()
  }
}

export function taContinue({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_LOAD | 1 << CRA_START)

  for (const i of range(4)) {
    tr.φ2.set()
    assert(readRegister(TIMALO) === i % 2 + 1)
    assert(readRegister(TIMAHI) === 0)
    tr.φ2.clear()
  }
}

export function taOneShot({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_LOAD | 1 << CRA_RUN | 1 << CRA_START)

  tr.φ2.set()
  assert(readRegister(TIMALO) === 1)
  assert(readRegister(TIMAHI) === 0)
  tr.φ2.clear()
  tr.φ2.set()
  assert(readRegister(TIMALO) === 2)
  assert(readRegister(TIMAHI) === 0)
  // START bit has been cleared
  assert(readRegister(CIACRA) === 1 << CRA_RUN)
  tr.φ2.clear()
  tr.φ2.set()
  assert(readRegister(TIMALO) === 2)
  assert(readRegister(TIMAHI) === 0)
  tr.φ2.clear()
}

export function taPbPulse({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 5)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_LOAD | 1 << CRA_PBON | 1 << CRA_START)

  assert(readRegister(TIMALO) === 5)
  assert(readRegister(TIMAHI) === 0)
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
  writeRegister(TIMALO, 5)
  writeRegister(TIMAHI, 0)
  writeRegister(
    CIACRA,
    1 << CRA_LOAD | 1 << CRA_OUT | 1 << CRA_PBON | 1 << CRA_START
  )

  assert(readRegister(TIMALO) === 5)
  assert(readRegister(TIMAHI) === 0)
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
  writeRegister(TIMALO, 5)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_LOAD | 1 << CRA_PBON)

  assert(chip.PB6.mode === OUTPUT)
  assert(tr.PB6.low)

  writeRegister(CIDDRA, 0xff)
  // PBON gets reset
  writeRegister(CIACRA, 1 << CRA_START)
  assert(chip.PB6.mode === OUTPUT)
}

export function taIrqDefault({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 1)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_LOAD | 1 << CRA_START)

  tr.φ2.set()
  // IRQ line to CPU; low indicates a request, no request made here
  assert(!tr._IRQ.low)
  // Have to read this once, as the read clears it
  const icr = readRegister(CIAICR)
  // TA bit is set whether an interrupt is requested or not
  assert(bitSet(icr, ICR_TA))
  // IR bit is only set when an interrupt is requested
  assert(bitClear(icr, ICR_IR))
  // Expect the ICR to be clear since it was read above
  assert(readRegister(CIAICR) === 0)
  tr.φ2.clear()
}

export function taIrqFlagSet({ tr, writeRegister, readRegister }) {
  writeRegister(CIAICR, 1 << ICR_SC | 1 << ICR_TA)
  writeRegister(TIMALO, 1)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_LOAD | 1 << CRA_START)

  tr.φ2.set()
  // Line low, interrupt requested
  assert(tr._IRQ.low)
  const icr = readRegister(CIAICR)
  assert(bitSet(icr, ICR_TA))
  // IR bit indicates an interrupt was actually fired
  assert(bitSet(icr, ICR_IR))
  // _IRQ signal is cleared by reading the ICR register
  assert(!tr._IRQ.low)
  assert(readRegister(CIAICR) === 0)
  tr.φ2.clear()
}
