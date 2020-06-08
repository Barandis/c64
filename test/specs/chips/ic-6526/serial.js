// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert } from "test/helper"
import {
  CIASDR, TIMALO, TIMAHI, CIACRA, CRA_LOAD, CRA_SP, CRA_START, CIAICR, ICR_SP,
  ICR_IR,
} from "chips/ic-6526/constants"
import { bitSet, bitClear, range } from "utils"

export function spInput({ tr, readRegister }) {
  const data = 0x2f

  for (const i of range(7, 0, true)) {
    tr.SP.level = data >> i & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  assert(readRegister(CIASDR) === 0x2f)
}

export function spInputWrite({ tr, writeRegister, readRegister }) {
  const data = 0x2f
  writeRegister(CIASDR, 0xa9)

  for (const i of range(7, 0, true)) {
    tr.SP.level = data >> i & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  assert(readRegister(CIASDR) === 0x2f)
}

export function spOutput({ tr, writeRegister }) {
  const data = 0xaf

  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_SP | 1 << CRA_LOAD | 1 << CRA_START)

  writeRegister(CIASDR, data)

  // Initial clock, before first timer underflow
  tr.φ2.set()
  tr.φ2.clear()
  assert(tr.SP.low)
  assert(tr.CNT.low)

  // 8 loops for 8 bits, MSB first
  for (const bit of range(7, 0, true)) {
    // First underflow, CNT is high and SP is the bit value
    for (const _ of range(2)) {
      tr.φ2.set()
      tr.φ2.clear()
      assert(tr.CNT.high)
      assert(tr.SP.level === (data >> bit & 1))
    }
    // Second underflow, CNT drops (EXCEPT on the last pass, as CNT
    // stays high after a value is done being sent) but SP retains its
    // value
    for (const _ of range(2)) {
      tr.φ2.set()
      tr.φ2.clear()
      assert(tr.CNT.level === (bit === 0 ? 1 : 0))
      assert(tr.SP.level === (data >> bit & 1))
    }
  }
}

export function spReady({ tr, writeRegister }) {
  const data = 0xaf

  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_SP | 1 << CRA_LOAD | 1 << CRA_START)

  writeRegister(CIASDR, 0x00)

  // Initial clock, before first timer underflow
  tr.φ2.set()
  tr.φ2.clear()
  assert(tr.SP.low)
  assert(tr.CNT.low)

  // Dropping a new value into the SDR as the old one is being
  // transmitted; this one will automatically begin when the first one
  // finishes
  writeRegister(CIASDR, data)

  // pulse clock 32 times to shift out 8 bits from first value
  for (const _ of range(32)) {
    tr.φ2.set()
    tr.φ2.clear()
  }

  // 8 loops for 8 bits, MSB first
  for (const bit of range(7, 0, true)) {
    // First underflow, CNT is high and SP is the bit value
    for (const _ of range(2)) {
      tr.φ2.set()
      tr.φ2.clear()
      assert(tr.CNT.high)
      assert(tr.SP.level === (data >> bit & 1))
    }
    // Second underflow, CNT drops (EXCEPT on the last pass, as CNT
    // stays high after a value is done being sent) but SP retains its
    // value
    for (const _ of range(2)) {
      tr.φ2.set()
      tr.φ2.clear()
      assert(tr.CNT.level === (bit === 0 ? 1 : 0))
      assert(tr.SP.level === (data >> bit & 1))
    }
  }
}

export function spIrqRxDefault({ tr, readRegister }) {
  const data = 0x2f

  for (const i of range(7, 0, true)) {
    tr.SP.level = data >> i & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  assert(!tr._IRQ.low)
  const icr = readRegister(CIAICR)
  assert(bitSet(icr, ICR_SP))
  assert(bitClear(icr, ICR_IR))
}

export function spIrqTxDefault({ tr, writeRegister, readRegister }) {
  const data = 0xaf

  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_SP | 1 << CRA_LOAD | 1 << CRA_START)

  writeRegister(CIASDR, data)

  // Initial clock, before first timer underflow
  tr.φ2.set()
  tr.φ2.clear()
  assert(tr.SP.low)
  assert(tr.CNT.low)

  for (const _ of range(32)) {
    tr.φ2.set()
    tr.φ2.clear()
  }

  assert(!tr._IRQ.low)
  const icr = readRegister(CIAICR)
  assert(bitSet(icr, ICR_SP))
  assert(bitClear(icr, ICR_IR))
}

export function spIrqRxFlagSet({ tr, writeRegister, readRegister }) {
  const data = 0x2f
  writeRegister(CIAICR, 1 << ICR_IR | 1 << ICR_SP)

  for (const i of range(7, 0, true)) {
    tr.SP.level = data >> i & 1
    tr.CNT.set()
    tr.CNT.clear()
  }

  assert(tr._IRQ.low)
  const icr = readRegister(CIAICR)
  assert(bitSet(icr, ICR_SP))
  assert(bitSet(icr, ICR_IR))
}

export function spIrqTxFlagSet({ tr, writeRegister, readRegister }) {
  const data = 0xaf
  writeRegister(CIAICR, 1 << ICR_IR | 1 << ICR_SP)

  writeRegister(TIMALO, 2)
  writeRegister(TIMAHI, 0)
  writeRegister(CIACRA, 1 << CRA_SP | 1 << CRA_LOAD | 1 << CRA_START)

  writeRegister(CIASDR, data)

  // Initial clock, before first timer underflow
  tr.φ2.set()
  tr.φ2.clear()
  assert(tr.SP.low)
  assert(tr.CNT.low)

  for (const _ of range(32)) {
    tr.φ2.set()
    tr.φ2.clear()
  }

  assert(tr._IRQ.low)
  const icr = readRegister(CIAICR)
  assert(bitSet(icr, ICR_SP))
  assert(bitSet(icr, ICR_IR))
}
