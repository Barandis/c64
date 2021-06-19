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

function produceValues(voice1, voice2, voice3, filter, ext, iterations = 500, gap = 50) {
  const wave1 = []
  const wave2 = []
  const wave3 = []
  const env1 = []
  const env2 = []
  const env3 = []
  const amp1 = []
  const amp2 = []
  const amp3 = []
  const filt = []
  const out = []

  function clock() {
    voice1.clock()
    voice2.clock()
    voice3.clock()

    filter.clock(voice1.output, voice2.output, voice3.output, 0)
    ext.clock(filter.output)
  }

  function push() {
    wave1.push(voice1.waveform.output)
    wave2.push(voice2.waveform.output)
    wave3.push(voice3.waveform.output)
    env1.push(voice1.envelope.output)
    env2.push(voice2.envelope.output)
    env3.push(voice3.envelope.output)
    amp1.push(voice1.output)
    amp2.push(voice2.output)
    amp3.push(voice3.output)
    filt.push(filter.output)
    out.push(ext.output)
  }

  voice1.frelo = 0xf7
  voice1.frehi = 0x99
  voice2.frelo = 0xfc
  voice2.frehi = 0xc1
  voice3.frelo = 0xb0
  voice3.frehi = 0xe6

  voice3.pwlo = 0x00
  voice3.pwhi = 0x08

  voice1.surel = 0xc0
  voice2.surel = 0xa0
  voice3.surel = 0x80

  filter.cutlo = 0x00
  filter.cuthi = 0x80
  filter.reson = 0x01
  filter.sigvol = 0x1f

  voice1.vcreg = 0x11
  voice2.vcreg = 0x21
  voice3.vcreg = 0x41

  for (const _ of range(iterations - 200)) {
    clock()
    push()

    for (const __ of range(gap)) {
      clock()
    }
  }

  voice1.vcreg = 0x10
  voice2.vcreg = 0x20
  voice3.vcreg = 0x40

  for (const _ of range(200)) {
    clock()
    push()

    for (const __ of range(gap)) {
      clock()
    }
  }

  return { wave1, wave2, wave3, env1, env2, env3, amp1, amp2, amp3, filt, out }
}

export default function graphChord({ voice1, voice2, voice3, filter, ext }) {
  const { wave1, wave2, wave3, env1, env2, env3, amp1, amp2, amp3, filt, out } = produceValues(
    voice1,
    voice2,
    voice3,
    filter,
    ext,
  )

  write('../../../../docs/chip/wave1.js', 'wave1', wave1)
  write('../../../../docs/chip/wave2.js', 'wave2', wave2)
  write('../../../../docs/chip/wave3.js', 'wave3', wave3)
  write('../../../../docs/chip/env1.js', 'env1', env1)
  write('../../../../docs/chip/env2.js', 'env2', env2)
  write('../../../../docs/chip/env3.js', 'env3', env3)
  write('../../../../docs/chip/amp1.js', 'amp1', amp1)
  write('../../../../docs/chip/amp2.js', 'amp2', amp2)
  write('../../../../docs/chip/amp3.js', 'amp3', amp3)
  write('../../../../docs/chip/filt.js', 'filt', filt)
  write('../../../../docs/chip/out.js', 'out', out)
}
