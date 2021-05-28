// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { PULSE, SAWTOOTH, TRIANGLE } from 'chips/ic-6581/constants'
import { range } from 'utils'
import { assert } from 'test/helper'

const A4 = [0x1c, 0xd6]
const A7 = [0xe6, 0xb0]

// Number of CPU cycles (at 1 MHz) that it will take for a single wave at the chosen
// frequency (A4 frequency = 440 Hz, A7 frequency = 3520 Hz)
const A4_CYCLES = Math.floor(1000000 / 440)
const A7_CYCLES = Math.floor(1000000 / 3520)

export function sawtoothA4({ tr, osc1, setPitch, setWaveform }) {
  setPitch(A4)
  setWaveform(SAWTOOTH)

  for (const wave of range(5)) {
    let last = 0
    let current = 0
    let cycles = 0

    while (current >= last) {
      last = current
      tr.φ2.set()
      current = osc1.read()
      cycles += 1
      tr.φ2.clear()
    }
    assert.closeTo(
      cycles,
      A4_CYCLES,
      2,
      `wave ${wave} was not within 2 cycles of expected ${A4_CYCLES}: ${cycles}`,
    )
  }
}

export function sawtoothA7({ tr, osc1, setPitch, setWaveform }) {
  setPitch(A7)
  setWaveform(SAWTOOTH)

  for (const wave of range(5)) {
    let last = 0
    let current = 0
    let cycles = 0

    while (current >= last) {
      last = current
      tr.φ2.set()
      current = osc1.read()
      cycles += 1
      tr.φ2.clear()
    }
    assert.closeTo(
      cycles,
      A7_CYCLES,
      2,
      `wave ${wave} was not within 2 cycles of expected ${A4_CYCLES}: ${cycles}`,
    )
  }
}

export function triangleA4({ tr, osc1, setPitch, setWaveform }) {
  setPitch(A4)
  setWaveform(TRIANGLE)

  for (const wave of range(5)) {
    let last = 0
    let current = 0
    let cycles = 0

    while (current >= last) {
      last = current
      tr.φ2.set()
      current = osc1.read()
      cycles += 1
      tr.φ2.clear()
    }
    while (current < last) {
      last = current
      tr.φ2.set()
      current = osc1.read()
      cycles += 1
      tr.φ2.clear()
    }
    assert.closeTo(
      cycles,
      A4_CYCLES,
      2,
      `wave ${wave} was not within 2 cycles of expected ${A4_CYCLES}: ${cycles}`,
    )
  }
}

export function triangleA7({ tr, osc1, setPitch, setWaveform }) {
  setPitch(A7)
  setWaveform(TRIANGLE)

  for (const wave of range(5)) {
    let last = 0
    let current = 0
    let cycles = 0

    while (current >= last) {
      last = current
      tr.φ2.set()
      current = osc1.read()
      cycles += 1
      tr.φ2.clear()
    }
    while (current < last) {
      last = current
      tr.φ2.set()
      current = osc1.read()
      cycles += 1
      tr.φ2.clear()
    }
    assert.closeTo(
      cycles,
      A7_CYCLES,
      2,
      `wave ${wave} was not within 2 cycles of expected ${A7_CYCLES}: ${cycles}`,
    )
  }
}

export function pulseA4({ tr, osc1, setPitch, setWaveform, setPulseWidth }) {
  setPitch(A4)
  setWaveform(PULSE)
  setPulseWidth(0x800)

  for (const wave of range(5)) {
    let last = 4095
    let current = 4095
    let cycles = 0

    while (current === last) {
      last = current
      tr.φ2.set()
      current = osc1.read()
      cycles += 1
      tr.φ2.clear()
    }
    last = current
    while (current === last) {
      last = current
      tr.φ2.set()
      current = osc1.read()
      cycles += 1
      tr.φ2.clear()
    }
    assert.closeTo(
      cycles,
      A4_CYCLES,
      2,
      `wave ${wave} was not within 2 cycles of expected ${A4_CYCLES}: ${cycles}`,
    )
  }
}

export function pulseA7({ tr, osc1, setPitch, setWaveform, setPulseWidth }) {
  setPitch(A7)
  setWaveform(PULSE)
  setPulseWidth(0x800)

  for (const wave of range(5)) {
    let last = 4095
    let current = 4095
    let cycles = 0

    while (current === last) {
      last = current
      tr.φ2.set()
      current = osc1.read()
      cycles += 1
      tr.φ2.clear()
    }
    last = current
    while (current === last) {
      last = current
      tr.φ2.set()
      current = osc1.read()
      cycles += 1
      tr.φ2.clear()
    }
    assert.closeTo(
      cycles,
      A7_CYCLES,
      2,
      `wave ${wave} was not within 2 cycles of expected ${A7_CYCLES}: ${cycles}`,
    )
  }
}
