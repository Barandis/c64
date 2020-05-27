// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import {
  TIMAHI,
  TIMALO,
  CIACRA,
  CRA_LOAD,
  CRA_START,
  CRA_RUN,
  CRA_PBON,
  CRA_OUT,
  CRA_IN,
  CIAICR,
  ICR_TA,
  ICR_IR,
  ICR_SC,
} from "chips/6526/constants"
import { OUTPUT } from "components/pin"
import { bitSet } from "utils"

export function taDefault({ readRegister }) {
  expect(readRegister(TIMAHI)).to.equal(0xff)
  expect(readRegister(TIMALO)).to.equal(0xff)
}

export function taClockDec({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRA, 1 << CRA_START)

  for (let i = 1; i <= 10; i++) {
    tr.O2.set()
    expect(readRegister(TIMAHI)).to.equal(0xff)
    expect(readRegister(TIMALO)).to.equal(0xff - i)
    tr.O2.clear()
  }
}

export function taCntDec({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRA, (1 << CRA_IN) | (1 << CRA_START))

  for (let i = 1; i <= 10; i++) {
    tr.CNT.set()
    expect(readRegister(TIMAHI)).to.equal(0xff)
    expect(readRegister(TIMALO)).to.equal(0xff - i)
    tr.CNT.clear()
  }
}

export function taRegRollover({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 0x00)

  // Force this valuesinto the timer register
  writeRegister(CIACRA, 1 << CRA_LOAD)
  expect(readRegister(CIACRA)).to.equal(0)

  // Start timer
  writeRegister(CIACRA, 1 << CRA_START)

  // One clock pulse
  tr.O2.set()
  expect(readRegister(TIMALO)).to.equal(0xff)
  expect(readRegister(TIMAHI)).to.equal(0xfe)
  tr.O2.clear()
}

export function taStop({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRA, 1 << CRA_START)

  for (let i = 1; i <= 5; i++) {
    tr.O2.set()
    expect(readRegister(TIMAHI)).to.equal(0xff)
    expect(readRegister(TIMALO)).to.equal(0xff - i)
    tr.O2.clear()
  }

  writeRegister(CIACRA, 0)

  for (let i = 1; i <= 5; i++) {
    tr.O2.set()
    expect(readRegister(TIMAHI)).to.equal(0xff)
    expect(readRegister(TIMALO)).to.equal(0xfa)
    tr.O2.clear()
  }
}

export function taContinue({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_LOAD) | (1 << CRA_START))

  for (let i = 0; i < 4; i++) {
    tr.O2.set()
    expect(readRegister(TIMALO)).to.equal((i % 2) + 1)
    expect(readRegister(TIMAHI)).to.equal(0)
    tr.O2.clear()
  }
}

export function taOneShot({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_LOAD) | (1 << CRA_RUN) | (1 << CRA_START))

  tr.O2.set()
  expect(readRegister(TIMALO)).to.equal(1)
  expect(readRegister(TIMAHI)).to.equal(0)
  tr.O2.clear()
  tr.O2.set()
  expect(readRegister(TIMALO)).to.equal(2)
  expect(readRegister(TIMAHI)).to.equal(0)
  // START bit has been cleared
  expect(readRegister(CIACRA)).to.equal(1 << CRA_RUN)
  tr.O2.clear()
  tr.O2.set()
  expect(readRegister(TIMALO)).to.equal(2)
  expect(readRegister(TIMAHI)).to.equal(0)
  tr.O2.clear()
}

export function taPbPulse({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 5)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_LOAD) | (1 << CRA_PBON) | (1 << CRA_START))

  expect(readRegister(TIMALO)).to.equal(5)
  expect(readRegister(TIMAHI)).to.equal(0)
  expect(chip.PB6.mode).to.equal(OUTPUT)
  expect(tr.PB6.level).to.equal(0)

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      tr.O2.set()
      expect(tr.PB6.level).to.equal(0)
      tr.O2.clear()
    }
    tr.O2.set()
    expect(tr.PB6.level).to.equal(1)
    tr.O2.clear()
  }
}

export function taPbToggle({ chip, tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 5)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_LOAD) | (1 << CRA_OUT) | (1 << CRA_PBON) | (1 << CRA_START))

  expect(readRegister(TIMALO)).to.equal(5)
  expect(readRegister(TIMAHI)).to.equal(0)
  expect(chip.PB6.mode).to.equal(OUTPUT)
  expect(tr.PB6.level).to.equal(0)

  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      tr.O2.set()
      expect(tr.PB6.level).to.equal(j % 2)
      tr.O2.clear()
    }
    tr.O2.set()
    expect(tr.PB6.level).to.equal((j + 1) % 2)
    tr.O2.clear()
  }
}

export function taIrqDefault({ tr, writeRegister, readRegister }) {
  writeRegister(TIMALO, 1)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_LOAD) | (1 << CRA_START))

  tr.O2.set()
  // IRQ line to CPU; low indicates a request, no request made here
  expect(tr._IRQ.low).to.be.false
  // Have to read this once, as the read clears it
  const icr = readRegister(CIAICR)
  // TA bit is set whether an interrupt is requested or not
  expect(bitSet(icr, ICR_TA)).to.be.true
  // IR bit is only set when an interrupt is requested
  expect(bitSet(icr, ICR_IR)).to.be.false
  // Expect the ICR to be clear since it was read above
  expect(readRegister(CIAICR)).to.equal(0)
  tr.O2.clear()
}

export function taIrqFlagSet({ tr, writeRegister, readRegister }) {
  writeRegister(CIAICR, (1 << ICR_SC) | (1 << ICR_TA))
  writeRegister(TIMALO, 1)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, (1 << CRA_LOAD) | (1 << CRA_START))

  tr.O2.set()
  // Line low, interrupt requested
  expect(tr._IRQ.low).to.be.true
  const icr = readRegister(CIAICR)
  expect(bitSet(icr, ICR_TA)).to.be.true
  // IR bit indicates an interrupt was actually fired
  expect(bitSet(icr, ICR_IR)).to.be.true
  // _IRQ signal is cleared by reading the ICR register
  expect(tr._IRQ.low).to.be.false
  expect(readRegister(CIAICR)).to.equal(0)
  tr.O2.clear()
}
