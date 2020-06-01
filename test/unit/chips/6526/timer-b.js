// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import {
  TIMBHI,
  TIMBLO,
  CIACRB,
  CRB_LOAD,
  CRB_START,
  CRB_RUN,
  CRB_PBON,
  CRB_OUT,
  CRB_IN0,
  TIMALO,
  TIMAHI,
  CIACRA,
  CRA_START,
  CRB_IN1,
  CRA_LOAD,
  CIAICR,
  ICR_TB,
  ICR_IR,
  ICR_SC,
  CIDDRB,
} from "chips/6526/constants"
import { OUTPUT } from "components/pin"
import { bitSet } from "utils"

export function tbDefault({ readRegister }) {
  expect(readRegister(TIMBHI)).to.equal(0xff)
  expect(readRegister(TIMBLO)).to.equal(0xff)
}

export function tbClockDec({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRB, 1 << CRB_START)

  for (let i = 1; i <= 10; i++) {
    tr.φ2.set()
    expect(readRegister(TIMBHI)).to.equal(0xff)
    expect(readRegister(TIMBLO)).to.equal(0xff - i)
    tr.φ2.clear()
  }
}

export function tbCntDec({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRB, (1 << CRB_IN0) | (1 << CRB_START))

  for (let i = 1; i <= 10; i++) {
    tr.CNT.set()
    expect(readRegister(TIMBHI)).to.equal(0xff)
    expect(readRegister(TIMBLO)).to.equal(0xff - i)
    tr.CNT.clear()
  }
}

export function tbUnderDec({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_LOAD) | (1 << CRA_START))
  writeRegister(CIACRB, (1 << CRB_IN1) | (1 << CRB_START))

  for (let j = 1; j <= 10; j++) {
    for (let i = 0; i < 2; i++) {
      tr.φ2.set()
      tr.φ2.clear()
    }
    expect(readRegister(TIMBLO)).to.equal(0xff - j)
    expect(readRegister(TIMBHI)).to.equal(0xff)
  }
}

export function tbCntUnderDec({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_LOAD) | (1 << CRA_START))
  writeRegister(CIACRB, (1 << CRB_IN1) | (1 << CRB_IN0) | (1 << CRB_START))

  tr.CNT.level = 0
  for (let j = 1; j <= 5; j++) {
    for (let i = 0; i < 2; i++) {
      tr.φ2.set()
      tr.φ2.clear()
    }
    expect(readRegister(TIMBLO)).to.equal(0xff)
    expect(readRegister(TIMBHI)).to.equal(0xff)
  }

  tr.CNT.level = 1
  for (let j = 1; j <= 5; j++) {
    for (let i = 0; i < 2; i++) {
      tr.φ2.set()
      tr.φ2.clear()
    }
    expect(readRegister(TIMBLO)).to.equal(0xff - j)
    expect(readRegister(TIMBHI)).to.equal(0xff)
  }
}

export function tbRegRollover({ tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 0x00)

  // Force this value into the timer register
  writeRegister(CIACRB, 1 << CRB_LOAD)
  expect(readRegister(CIACRB)).to.equal(0)

  // Start timer
  writeRegister(CIACRB, 1 << CRB_START)

  // One clock pulse
  tr.φ2.set()
  expect(readRegister(TIMBLO)).to.equal(0xff)
  expect(readRegister(TIMBHI)).to.equal(0xfe)
  tr.φ2.clear()
}

export function tbStop({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRB, 1 << CRB_START)

  for (let i = 1; i <= 5; i++) {
    tr.φ2.set()
    expect(readRegister(TIMBHI)).to.equal(0xff)
    expect(readRegister(TIMBLO)).to.equal(0xff - i)
    tr.φ2.clear()
  }

  writeRegister(CIACRB, 0)

  for (let i = 1; i <= 5; i++) {
    tr.φ2.set()
    expect(readRegister(TIMBHI)).to.equal(0xff)
    expect(readRegister(TIMBLO)).to.equal(0xfa)
    tr.φ2.clear()
  }
}

export function tbContinue({ tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 2)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, (1 << CRB_LOAD) | (1 << CRB_START))

  for (let i = 0; i < 4; i++) {
    tr.φ2.set()
    expect(readRegister(TIMBLO)).to.equal((i % 2) + 1)
    expect(readRegister(TIMBHI)).to.equal(0)
    tr.φ2.clear()
  }
}

export function tbOneShot({ tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 2)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, (1 << CRB_LOAD) | (1 << CRB_RUN) | (1 << CRB_START))

  tr.φ2.set()
  expect(readRegister(TIMBLO)).to.equal(1)
  expect(readRegister(TIMBHI)).to.equal(0)
  tr.φ2.clear()
  tr.φ2.set()
  expect(readRegister(TIMBLO)).to.equal(2)
  expect(readRegister(TIMBHI)).to.equal(0)
  // START bit has been cleared
  expect(readRegister(CIACRB)).to.equal(1 << CRB_RUN)
  tr.φ2.clear()
  tr.φ2.set()
  expect(readRegister(TIMBLO)).to.equal(2)
  expect(readRegister(TIMBHI)).to.equal(0)
  tr.φ2.clear()
}

export function tbPbPulse({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 5)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, (1 << CRB_LOAD) | (1 << CRB_PBON) | (1 << CRB_START))

  expect(readRegister(TIMBLO)).to.equal(5)
  expect(readRegister(TIMBHI)).to.equal(0)
  expect(chip.PB7.mode).to.equal(OUTPUT)
  expect(tr.PB7.level).to.equal(0)

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      tr.φ2.set()
      expect(tr.PB7.level).to.equal(0)
      tr.φ2.clear()
    }
    tr.φ2.set()
    expect(tr.PB7.level).to.equal(1)
    tr.φ2.clear()
  }
}

export function tbPbToggle({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 5)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, (1 << CRB_LOAD) | (1 << CRB_OUT) | (1 << CRB_PBON) | (1 << CRB_START))

  expect(readRegister(TIMBLO)).to.equal(5)
  expect(readRegister(TIMBHI)).to.equal(0)
  expect(chip.PB7.mode).to.equal(OUTPUT)
  expect(tr.PB7.level).to.equal(0)

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      tr.φ2.set()
      expect(tr.PB7.level).to.equal(j % 2)
      tr.φ2.clear()
    }
    tr.φ2.set()
    expect(tr.PB7.level).to.equal((j + 1) % 2)
    tr.φ2.clear()
  }
}

export function tbPbRemove({ chip, tr, writeRegister }) {
  writeRegister(TIMBLO, 5)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, (1 << CRB_LOAD) | (1 << CRB_PBON))

  expect(chip.PB7.mode).to.equal(OUTPUT)
  expect(tr.PB7.level).to.equal(0)

  writeRegister(CIDDRB, 0xff)
  // PBON gets reset
  writeRegister(CIACRB, 1 << CRB_START)
  expect(chip.PB7.mode).to.equal(OUTPUT)
}

export function tbIrqDefault({ tr, writeRegister, readRegister }) {
  writeRegister(TIMBLO, 1)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, (1 << CRB_LOAD) | (1 << CRB_START))

  tr.φ2.set()
  // IRQ line to CPU; low indicates a request, no request made here
  expect(tr._IRQ.low).to.be.false
  // Have to read this once, as the read clears it
  const icr = readRegister(CIAICR)
  // TA bit is set whether an interrupt is requested or not
  expect(bitSet(icr, ICR_TB)).to.be.true
  // IR bit is only set when an interrupt is requested
  expect(bitSet(icr, ICR_IR)).to.be.false
  // Expect the ICR to be clear since it was read above
  expect(readRegister(CIAICR)).to.equal(0)
  tr.φ2.clear()
}

export function tbIrqFlagSet({ tr, writeRegister, readRegister }) {
  writeRegister(CIAICR, (1 << ICR_SC) | (1 << ICR_TB))
  writeRegister(TIMBLO, 1)
  writeRegister(TIMBHI, 0)
  writeRegister(CIACRB, (1 << CRB_LOAD) | (1 << CRB_START))

  tr.φ2.set()
  // Line low, interrupt requested
  expect(tr._IRQ.low).to.be.true
  const icr = readRegister(CIAICR)
  expect(bitSet(icr, ICR_TB)).to.be.true
  // IR bit indicates an interrupt was actually fired
  expect(bitSet(icr, ICR_IR)).to.be.true
  // _IRQ signal is cleared by reading the ICR register
  expect(tr._IRQ.low).to.be.false
  expect(readRegister(CIAICR)).to.equal(0)
  tr.φ2.clear()
}
