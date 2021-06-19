// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { writeFile } from 'fs'
import { resolve } from 'path'

import { NOISE, PULSE, RING, SAWTOOTH, SYNC, TRIANGLE } from 'chips/ic-6581/constants'
import { range } from 'utils'
import { assert } from 'test/helper'

const A4 = [0x1c, 0xd6]
const A7 = [0xe6, 0xb0]
const C4 = [0x11, 0x25]

// Number of CPU cycles (at 1 MHz) that it will take for a single wave at the chosen
// frequency (A4 frequency = 440 Hz, A7 frequency = 3520 Hz)
const A4_CYCLES = Math.floor(1000000 / 440)
const A7_CYCLES = Math.floor(1000000 / 3520)

/* eslint-disable no-console */
function write(path, name, value) {
  const text = `const ${name} = [${value.join(',')}]`
  writeFile(resolve(__dirname, path), text, err => {
    if (err) {
      console.log(err)
      return
    }
    console.log(`Wrote ${path}`)
  })
}
/* eslint-enable no-console */

function produceWaveform(wave, clock, iterations = 500) {
  const values = []

  for (const _ of range(iterations)) {
    clock()
    values.push(wave.output)

    for (const __ of range(20)) {
      clock()
    }
  }

  return values
}

export function sawtoothA4({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, SAWTOOTH)

  for (const wave of range(5)) {
    let last = 0
    let current = 0
    let cycles = 0

    while (current >= last) {
      last = current
      clock()
      current = wave1.output
      cycles += 1
    }
    assert.closeTo(
      cycles,
      A4_CYCLES,
      3,
      `wave ${wave} was not within 2 cycles of expected ${A4_CYCLES}: ${cycles}`,
    )
  }
}

export function sawtoothA7({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A7)
  setControl(wave1, SAWTOOTH)

  for (const wave of range(5)) {
    let last = 0
    let current = 0
    let cycles = 0

    while (current >= last) {
      last = current
      clock()
      current = wave1.output
      cycles += 1
    }
    assert.closeTo(
      cycles,
      A7_CYCLES,
      3,
      `wave ${wave} was not within 2 cycles of expected ${A4_CYCLES}: ${cycles}`,
    )
  }
}

export function triangleA4({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, TRIANGLE)

  for (const wave of range(5)) {
    let last = 0
    let current = 0
    let cycles = 0

    while (current >= last) {
      last = current
      clock()
      current = wave1.output
      cycles += 1
    }
    while (current < last) {
      last = current
      clock()
      current = wave1.output
      cycles += 1
    }
    assert.closeTo(
      cycles,
      A4_CYCLES,
      3,
      `wave ${wave} was not within 2 cycles of expected ${A4_CYCLES}: ${cycles}`,
    )
  }
}

export function triangleA7({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A7)
  setControl(wave1, TRIANGLE)

  for (const wave of range(5)) {
    let last = 0
    let current = 0
    let cycles = 0

    while (current >= last) {
      last = current
      clock()
      current = wave1.output
      cycles += 1
    }
    while (current < last) {
      last = current
      clock()
      current = wave1.output
      cycles += 1
    }
    assert.closeTo(
      cycles,
      A7_CYCLES,
      3,
      `wave ${wave} was not within 2 cycles of expected ${A7_CYCLES}: ${cycles}`,
    )
  }
}

export function pulseA4({ wave1, setPitch, setControl, setPulseWidth, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, PULSE)
  setPulseWidth(wave1, 0x800)

  for (const wave of range(5)) {
    let last = 4095
    let current = 4095
    let cycles = 0

    while (current === last) {
      last = current
      clock()
      current = wave1.output
      cycles += 1
    }
    last = current
    while (current === last) {
      last = current
      clock()
      current = wave1.output
      cycles += 1
    }
    assert.closeTo(
      cycles,
      A4_CYCLES,
      3,
      `wave ${wave} was not within 2 cycles of expected ${A4_CYCLES}: ${cycles}`,
    )
  }
}

export function pulseA7({ wave1, setPitch, setControl, setPulseWidth, clock }) {
  setPitch(wave1, A7)
  setControl(wave1, PULSE)
  setPulseWidth(wave1, 0x800)

  for (const wave of range(5)) {
    let last = 4095
    let current = 4095
    let cycles = 0

    while (current === last) {
      last = current
      clock()
      current = wave1.output
      cycles += 1
    }
    last = current
    while (current === last) {
      last = current
      clock()
      current = wave1.output
      cycles += 1
    }
    assert.closeTo(
      cycles,
      A7_CYCLES,
      3,
      `wave ${wave} was not within 2 cycles of expected ${A7_CYCLES}: ${cycles}`,
    )
  }
}

export function graphSawtooth({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, SAWTOOTH)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/sawtooth.js'
  write(path, 'sawtooth', values)
}

export function graphSawtoothHigh({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A7)
  setControl(wave1, SAWTOOTH)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/sawtoothhigh.js'
  write(path, 'sawtoothhigh', values)
}

export function graphTriangle({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, TRIANGLE)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/triangle.js'
  write(path, 'triangle', values)
}

export function graphTriangleHigh({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A7)
  setControl(wave1, TRIANGLE)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/trianglehigh.js'
  write(path, 'trianglehigh', values)
}

export function graphPulse({ wave1, setPitch, setControl, setPulseWidth, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, PULSE)
  setPulseWidth(wave1, 0x800)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/pulse.js'
  write(path, 'pulse', values)
}

export function graphPulseHigh({ wave1, setPitch, setControl, setPulseWidth, clock }) {
  setPitch(wave1, A7)
  setControl(wave1, PULSE)
  setPulseWidth(wave1, 0x800)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/pulsehigh.js'
  write(path, 'pulsehigh', values)
}

export function graphNoise({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, NOISE)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/noise.js'
  write(path, 'noise', values)
}

export function graphNoiseHigh({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A7)
  setControl(wave1, NOISE)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/noisehigh.js'
  write(path, 'noisehigh', values)
}

export function graphPulseVary({ wave1, setPitch, setControl, setPulseWidth, clock }, pw) {
  setPitch(wave1, A4)
  setControl(wave1, PULSE)
  setPulseWidth(wave1, pw)

  const values = produceWaveform(wave1, clock)

  const path = `../../../../docs/waveforms/pulse${pw}.js`
  write(path, `pulse${pw}`, values)
}

export function graphSawTri({ wave1, setPitch, setControl, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, SAWTOOTH, TRIANGLE)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/sawtri.js'
  write(path, 'sawtri', values)
}

export function graphSawPul({ wave1, setPitch, setControl, setPulseWidth, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, SAWTOOTH, PULSE)
  setPulseWidth(wave1, 0x800)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/sawpul.js'
  write(path, 'sawpul', values)
}

export function graphTriPul({ wave1, setPitch, setControl, setPulseWidth, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, TRIANGLE, PULSE)
  setPulseWidth(wave1, 0x800)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/tripul.js'
  write(path, 'tripul', values)
}

export function graphTriPulSaw({ wave1, setPitch, setControl, setPulseWidth, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, TRIANGLE, PULSE, SAWTOOTH)
  setPulseWidth(wave1, 0x800)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/tripulsaw.js'
  write(path, 'tripulsaw', values)
}

export function graphSync({ wave1, wave3, setPitch, setControl, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, SAWTOOTH, SYNC)
  setPitch(wave3, C4)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/sync.js'
  write(path, 'sync', values)
}

export function graphRing({ wave1, wave3, setPitch, setControl, clock }) {
  setPitch(wave1, A4)
  setControl(wave1, TRIANGLE, RING)
  setPitch(wave3, C4)

  const values = produceWaveform(wave1, clock)

  const path = '../../../../docs/waveforms/ring.js'
  write(path, 'ring', values)
}
