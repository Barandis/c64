// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { writeFile } from 'fs'
import { resolve } from 'path'
import { assert } from 'test/helper'
import { range } from 'utils'

const FALLOFF_BREAKPOINTS = [0x5d, 0x36, 0x1a, 0x0e, 0x06]

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

function produceEnvelope(env, clock, iterations = 500, gap = 100) {
  const values = []
  env.vcreg(1)

  for (const _ of range(iterations - 200)) {
    clock()
    values.push(env.output)

    for (const __ of range(gap)) {
      clock()
    }
  }

  env.vcreg(0)

  for (const _ of range(200)) {
    clock()
    values.push(env.output)

    for (const __ of range(gap)) {
      clock()
    }
  }

  return values
}

export function envMinimum({ env1, clock }) {
  env1.atdcy(0x00) // Minimum attack/decay
  env1.surel(0x80) // 0x88 sustain level, minimum release

  env1.vcreg(1)

  let envelope = 0
  // attack phase; increasing until 255
  while (envelope < 255) {
    // Minimum attack goes 9 cycles between increases in envelope value
    for (const _ of range(9)) {
      assert.equal(env1.output, envelope)
      clock()
    }
    envelope += 1
  }

  // decay phase, descending until sustain level (0x88)
  while (envelope > 0x88) {
    // Minimum decay goes 9 cycles between decreases in envelope value
    for (const _ of range(9)) {
      assert.equal(env1.output, envelope)
      clock()
    }
    envelope -= 1
  }

  // sustain phase, stays at sustain level
  // 261 is a multiple of the rate target (9), so it'll make release testing easier by
  // keeping envelope changes on the right cycle
  for (const _ of range(261)) {
    assert.equal(env1.output, envelope)
    clock()
  }

  // release phase, descends until 0
  let falloff = 1
  env1.vcreg(0)

  while (envelope > 0) {
    for (const _ of range(9 * falloff)) {
      assert.equal(env1.output, envelope)
      clock()
    }
    envelope -= 1
    if (FALLOFF_BREAKPOINTS.includes(envelope)) {
      falloff = Math.min(falloff * 2, 30)
    }
  }

  // release phase, stays at 0
  for (const _ of range(256)) {
    assert.equal(env1.output, envelope)
    clock()
  }
}

export function envNoSustain({ env1, clock }) {
  env1.atdcy(0x00) // Minimum attack/decay
  env1.surel(0x00) // Zero sustain level, minimum release

  env1.vcreg(1)

  let envelope = 0
  // attack phase; increasing until 255
  while (envelope < 255) {
    // Minimum attack goes 9 cycles between increases in envelope value
    for (const _ of range(9)) {
      assert.equal(env1.output, envelope)
      clock()
    }
    envelope += 1
  }

  // decay phase, descends until sustain level (0)
  let falloff = 1

  while (envelope > 0) {
    for (const _ of range(9 * falloff)) {
      assert.equal(env1.output, envelope)
      clock()
    }
    envelope -= 1
    if (FALLOFF_BREAKPOINTS.includes(envelope)) {
      falloff = Math.min(falloff * 2, 30)
    }
  }

  // decay phase, stays at 0
  for (const _ of range(256)) {
    assert.equal(env1.output, envelope)
    clock()
  }
}

export function envMaxSustain({ env1, clock }) {
  env1.atdcy(0x00) // Minimum attack/decay
  env1.surel(0xf0) // Max sustain level, minimum release

  env1.vcreg(1)

  let envelope = 0
  // attack phase; increasing until 255
  while (envelope < 255) {
    // Minimum attack goes 9 cycles between increases in envelope value
    for (const _ of range(9)) {
      assert.equal(env1.output, envelope)
      clock()
    }
    envelope += 1
  }

  // decay phase gets skipped since envelope is already at sustain level
  // sustain phase, stays at sustain level
  // 261 is a multiple of the rate target (9), so it'll make release testing easier by
  // keeping envelope changes on the right cycle
  for (const _ of range(261)) {
    assert.equal(env1.output, envelope)
    clock()
  }

  // release phase, descends until 0
  let falloff = 1
  env1.vcreg(0)

  while (envelope > 0) {
    for (const _ of range(9 * falloff)) {
      assert.equal(env1.output, envelope)
      clock()
    }
    envelope -= 1
    if (FALLOFF_BREAKPOINTS.includes(envelope)) {
      falloff = Math.min(falloff * 2, 30)
    }
  }

  // release phase, stays at 0
  for (const _ of range(256)) {
    assert.equal(env1.output, envelope)
    clock()
  }
}

export function graphMinimum({ env1, clock }) {
  env1.atdcy(0x00)
  env1.surel(0x80)

  const values = produceEnvelope(env1, clock)

  const path = '../../../../docs/envelopes/minimum.js'
  write(path, 'minimum', values)
}

export function graphZeroSustain({ env1, clock }) {
  env1.atdcy(0x00)
  env1.surel(0x00)

  const values = produceEnvelope(env1, clock)

  const path = '../../../../docs/envelopes/zerosus.js'
  write(path, 'zerosus', values)
}

export function graphFullSustain({ env1, clock }) {
  env1.atdcy(0x00)
  env1.surel(0xf0)

  const values = produceEnvelope(env1, clock)

  const path = '../../../../docs/envelopes/fullsus.js'
  write(path, 'fullsus', values)
}
