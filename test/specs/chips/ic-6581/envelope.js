// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { writeFile } from 'fs'
import { resolve } from 'path'
import { range } from 'utils'

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
  env.vcreg = 1

  for (const _ of range(iterations - 200)) {
    clock()
    values.push(env.output)

    for (const __ of range(gap)) {
      clock()
    }
  }

  env.vcreg = 0

  for (const _ of range(200)) {
    clock()
    values.push(env.output)

    for (const __ of range(gap)) {
      clock()
    }
  }

  return values
}

export function graphMinimum({ env1, clock }) {
  env1.atdcy = 0x00
  env1.surel = 0x80

  const values = produceEnvelope(env1, clock)

  const path = '../../../../docs/envelopes/minimum.js'
  write(path, 'minimum', values)
}

export function graphZeroSustain({ env1, clock }) {
  env1.atdcy = 0x00
  env1.surel = 0x00

  const values = produceEnvelope(env1, clock)

  const path = '../../../../docs/envelopes/zerosus.js'
  write(path, 'zerosus', values)
}

export function graphFullSustain({ env1, clock }) {
  env1.atdcy = 0x00
  env1.surel = 0xf0

  const values = produceEnvelope(env1, clock)

  const path = '../../../../docs/envelopes/fullsus.js'
  write(path, 'fullsus', values)
}
