// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from 'test/helper'
import {
  TOD10TH,
  CRA,
  TODIN,
  TODSEC,
  TODMIN,
  TODHR,
  ICR,
  ALRM,
  IR,
  CRB,
  ALARM,
  SC,
  PM,
} from 'chips/ic-6526/constants'
import { bitSet, bitClear, range } from 'utils'

export function todAdvance({ tr, readRegister }) {
  assert(readRegister(TOD10TH) === 0)
  for (const i of range(6)) {
    for (const _ of range(5)) {
      tr.TOD.set()
      assert(readRegister(TOD10TH) === i)
      tr.TOD.clear()
    }
    tr.TOD.set()
    assert(readRegister(TOD10TH) === i + 1)
    tr.TOD.clear()
  }
}

export function todAdvance50Hz({ tr, writeRegister, readRegister }) {
  writeRegister(CRA, 1 << TODIN)
  assert(readRegister(TOD10TH) === 0)
  for (const i of range(6)) {
    for (const _ of range(4)) {
      tr.TOD.set()
      assert(readRegister(TOD10TH) === i)
      tr.TOD.clear()
    }
    tr.TOD.set()
    assert(readRegister(TOD10TH) === i + 1)
    tr.TOD.clear()
  }
}

export function todSecond({ tr, writeRegister, readRegister }) {
  writeRegister(TOD10TH, 0x09)
  assert(readRegister(TODSEC) === 0)

  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TOD10TH) === 0)
  assert(readRegister(TODSEC) === 1)
}

export function todBcdSec({ tr, writeRegister, readRegister }) {
  writeRegister(TOD10TH, 0x09)
  writeRegister(TODSEC, 0x09)

  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TOD10TH) === 0)
  assert(readRegister(TODSEC) === 0x10)
}

export function todMinute({ tr, writeRegister, readRegister }) {
  writeRegister(TOD10TH, 0x09)
  writeRegister(TODSEC, 0x59)
  assert(readRegister(TODMIN) === 0)

  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TOD10TH) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 1)
}

export function todBcdMin({ tr, writeRegister, readRegister }) {
  writeRegister(TOD10TH, 0x09)
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x09)

  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TOD10TH) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0x10)
}

export function todHour({ tr, writeRegister, readRegister }) {
  writeRegister(TOD10TH, 0x09)
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x59)
  assert(readRegister(TODHR) === 0)
  // Have to do this because reading hours pauses updates until tenths
  // are read
  readRegister(TOD10TH)

  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TOD10TH) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHR) === 1)
}

export function todBcdHour({ tr, writeRegister, readRegister }) {
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODHR, 0x09)
  // Have to do this because writing hours pauses the clock until tenths
  // are written
  writeRegister(TOD10TH, 0x09)

  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TOD10TH) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHR) === 0x10)
}

export function todAmPm({ tr, writeRegister, readRegister }) {
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODHR, 0x11)
  writeRegister(TOD10TH, 0x09)

  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TOD10TH) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHR) === (0x12 | (1 << PM)))
}

export function todPmAm({ tr, writeRegister, readRegister }) {
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODHR, 0x11 | (1 << PM))
  writeRegister(TOD10TH, 0x09)

  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TOD10TH) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHR) === 0x12)
}

export function todNoUpdate({ tr, writeRegister, readRegister }) {
  writeRegister(TODHR, 0x12)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODSEC, 0x59)
  writeRegister(TOD10TH, 0x09)

  // Reading the hours register pauses register updates but does not
  // stop the clock
  readRegister(TODHR)

  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODHR) === 0x12)
  assert(readRegister(TODMIN) === 0x59)
  assert(readRegister(TODSEC) === 0x59)
  // Reading the tenths register updates registers to current time and
  // starts updates again
  assert(readRegister(TOD10TH) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHR) === 1)
}

export function todHalt({ tr, writeRegister, readRegister }) {
  writeRegister(TOD10TH, 0x09)
  writeRegister(TODSEC, 0x59)
  writeRegister(TODMIN, 0x59)
  // Writing to the hours register stops the clock completely until the
  // next write to tenths
  writeRegister(TODHR, 0x12)

  // If the clock was not halted, this would be enough to push it to
  // 1:00:00
  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  // This write unfreezes the clock
  writeRegister(TOD10TH, 0x09)
  assert(readRegister(TODHR) === 0x12)
  assert(readRegister(TODMIN) === 0x59)
  assert(readRegister(TODSEC) === 0x59)
  assert(readRegister(TOD10TH) === 0x09)

  // The clock is running again, so this will be enough to push it to
  // 1:00:00
  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TOD10TH) === 0)
  assert(readRegister(TODSEC) === 0)
  assert(readRegister(TODMIN) === 0)
  assert(readRegister(TODHR) === 1)
}

export function todIrqDefault({ tr, writeRegister, readRegister }) {
  writeRegister(TODHR, 0x12)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODSEC, 0x59)
  writeRegister(TOD10TH, 0x09)

  // Setting this flag means further writes will set the alarm
  writeRegister(CRB, 1 << ALARM)

  writeRegister(TODHR, 0x01)
  writeRegister(TODMIN, 0x00)
  writeRegister(TODSEC, 0x00)
  writeRegister(TOD10TH, 0x00)

  assert(readRegister(TODHR) === 0x12)
  assert(readRegister(TODMIN) === 0x59)
  assert(readRegister(TODSEC) === 0x59)
  assert(readRegister(TOD10TH) === 0x09)

  // Ticking one tenth of a second makes time match the alarm
  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(readRegister(TODHR) === 0x01)
  assert(readRegister(TODMIN) === 0x00)
  assert(readRegister(TODSEC) === 0x00)
  assert(readRegister(TOD10TH) === 0x00)

  assert(bitSet(readRegister(ICR), ALRM))
  assert(bitClear(readRegister(ICR), IR))
  assert(!tr._IRQ.low)
}

export function todIrqFlagSet({ tr, writeRegister, readRegister }) {
  writeRegister(TODHR, 0x12)
  writeRegister(TODMIN, 0x59)
  writeRegister(TODSEC, 0x59)
  writeRegister(TOD10TH, 0x09)

  writeRegister(CRB, 1 << ALARM)

  writeRegister(TODHR, 0x01)
  writeRegister(TODMIN, 0x00)
  writeRegister(TODSEC, 0x00)
  writeRegister(TOD10TH, 0x00)

  writeRegister(ICR, (1 << SC) | (1 << ALRM))

  for (const _ of range(6)) {
    tr.TOD.set()
    tr.TOD.clear()
  }

  assert(tr._IRQ.low)
  const icr = readRegister(ICR)
  assert(bitSet(icr, ALRM))
  assert(bitSet(icr, IR))
}
