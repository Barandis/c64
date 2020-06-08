// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from "test/helper"
import {
  TODTEN, CIACRA, CRA_TOD, TODSEC, TODMIN, TODHRS, CIAICR, ICR_ALRM, ICR_IR,
  CIACRB, CRB_ALRM, ICR_SC,
} from "chips/ic-6526/constants"
import { bitSet, bitClear } from "utils"

export function todAdvance({ tr, readRegister }) {
  assert(readRegister(TODTEN) === 0)
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      tr.TOD.set()
      assert(readRegister(TODTEN) === i)
      tr.TOD.clear()
    }
    tr.TOD.set()
    assert(readRegister(TODTEN) === i + 1)
    tr.TOD.clear()
  }
}

export function todAdvance50Hz({ tr, writeRegister, readRegister }) {
  writeRegister(CIACRA, 1 << CRA_TOD)
  assert(readRegister(TODTEN) === 0)
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
      tr.TOD.set()
      assert(readRegister(TODTEN) === i)
      tr.TOD.clear()
    }
    tr.TOD.set()
    assert(readRegister(TODTEN) === i + 1)
    tr.TOD.clear()
  }
}

export function todSecond({ tr, writeRegister, readRegister }) {
  writeRegister(TODTEN, 0x09)
  assert(readRegister(TODSEC) === 0)

  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODTEN) === 0)
  assert(readRegister(TODSEC) === 1)
}

export function todBcdSec({ tr, writeRegister, readRegister }) {
  writeRegister(TODTEN, 0x09)
  writeRegister(TODSEC, 0x09)

  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODTEN) === 0)
  assert(readRegister(TODSEC) === 0x10)
}

export function todMinute({ tr, writeRegister, readRegister }) {
  writeRegister(TODTEN, 0x09)
  writeRegister(TODSEC, 0x59)
  assert(readRegister(TODMIN) === 0)

  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODTEN) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 1)
}

export function todBcdMin({ tr, writeRegister, readRegister }) {
  writeRegister(TODTEN, 0x09)
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x09)

  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODTEN) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0x10)
}

export function todHour({ tr, writeRegister, readRegister }) {
  writeRegister(TODTEN, 0x09)
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x59)
  assert(readRegister(TODHRS) === 0)
  // Have to do this because reading hours pauses updates until tenths
  // are read
  readRegister(TODTEN)

  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODTEN) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHRS) === 1)
}

export function todBcdHour({ tr, writeRegister, readRegister }) {
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODHRS, 0x09)
  // Have to do this because writing hours pauses the clock until tenths
  // are written
  writeRegister(TODTEN, 0x09)

  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODTEN) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHRS) === 0x10)
}

export function todAmPm({ tr, writeRegister, readRegister }) {
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODHRS, 0x11)
  writeRegister(TODTEN, 0x09)

  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODTEN) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHRS) === (0x12 | 1 << 7))
}

export function todPmAm({ tr, writeRegister, readRegister }) {
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODHRS, 0x11 | 1 << 7)
  writeRegister(TODTEN, 0x09)

  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODTEN) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHRS) === 0x12)
}

export function todNoUpdate({ tr, writeRegister, readRegister }) {
  writeRegister(TODHRS, 0x12)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODSEC, 0x59)
  writeRegister(TODTEN, 0x09)

  // Reading the hours register pauses register updates but does not
  // stop the clock
  readRegister(TODHRS)

  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODHRS) === 0x12)
  assert(readRegister(TODMIN) === 0x59)
  assert(readRegister(TODSEC) === 0x59)
  // Reading the tenths register updates registers to current time and
  // starts updates again
  assert(readRegister(TODTEN) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHRS) === 1)
}

export function todHalt({ tr, writeRegister, readRegister }) {
  writeRegister(TODTEN, 0x09)
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x59)
  // Writing to the hours register stops the clock completely until the
  // next write to tenths
  writeRegister(TODHRS, 0x12)

  // If the clock was not halted, this would be enough to push it to
  // 1:00:00
  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  // This write unfreezes the clock
  writeRegister(TODTEN, 0x09)
  assert(readRegister(TODHRS) === 0x12)
  assert(readRegister(TODMIN) === 0x59)
  assert(readRegister(TODSEC) === 0x59)
  assert(readRegister(TODTEN) === 0x09)

  // The clock is running again, so this will be enough to push it to
  // 1:00:00
  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODTEN) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHRS) === 1)
}

export function todIrqDefault({ tr, writeRegister, readRegister }) {
  writeRegister(TODHRS, 0x12)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODSEC, 0x59)
  writeRegister(TODTEN, 0x09)

  // Setting this flag means further writes will set the alarm
  writeRegister(CIACRB, 1 << CRB_ALRM)

  writeRegister(TODHRS, 0x01)
  writeRegister(TODMIN, 0x00)
  writeRegister(TODSEC, 0x00)
  writeRegister(TODTEN, 0x00)

  assert(readRegister(TODHRS) === 0x12)
  assert(readRegister(TODMIN) === 0x59)
  assert(readRegister(TODSEC) === 0x59)
  assert(readRegister(TODTEN) === 0x09)

  // Ticking one tenth of a second makes time match the alarm
  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODHRS) === 0x01)
  assert(readRegister(TODMIN) === 0x00)
  assert(readRegister(TODSEC) === 0x00)
  assert(readRegister(TODTEN) === 0x00)

  assert(bitSet(readRegister(CIAICR), ICR_ALRM))
  assert(bitClear(readRegister(CIAICR), ICR_IR))
  assert(!tr._IRQ.low)
}

export function todIrqFlagSet({ tr, writeRegister, readRegister }) {
  writeRegister(TODHRS, 0x12)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODSEC, 0x59)
  writeRegister(TODTEN, 0x09)

  writeRegister(CIACRB, 1 << CRB_ALRM)

  writeRegister(TODHRS, 0x01)
  writeRegister(TODMIN, 0x00)
  writeRegister(TODSEC, 0x00)
  writeRegister(TODTEN, 0x00)

  writeRegister(CIAICR, 1 << ICR_SC | 1 << ICR_ALRM)

  for (let i = 0; i < 6; i++) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(tr._IRQ.low)
  const icr = readRegister(CIAICR)
  assert(bitSet(icr, ICR_ALRM))
  assert(bitSet(icr, ICR_IR))
}
