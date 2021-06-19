// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { GATE, PULSE } from 'chips/ic-6581/constants'
import { writeFile } from 'fs'
import { resolve } from 'path'
import { range, setBit } from 'utils'

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

function produceValues(voice, clock, iterations = 500, gap = 50) {
  const waves = []
  const envs = []
  const voices = []

  voice.vcreg = setBit(setBit(0, PULSE), GATE)

  for (const _ of range(iterations - 200)) {
    clock()
    waves.push(voice.waveform.output)
    envs.push(voice.envelope.output)
    voices.push(voice.output)

    for (const __ of range(gap)) {
      clock()
    }
  }

  voice.vcreg = setBit(0, PULSE)

  for (const _ of range(200)) {
    clock()
    waves.push(voice.waveform.output)
    envs.push(voice.envelope.output)
    voices.push(voice.output)

    for (const __ of range(gap)) {
      clock()
    }
  }

  return { waves, envs, voices }
}

export function graphVoice({ voice1, clock }) {
  voice1.frelo = 0xb0
  voice1.frehi = 0xe6
  voice1.pwlo = 0x00
  voice1.pwhi = 0x08
  voice1.atdcy = 0x00
  voice1.surel = 0x80

  const { waves, envs, voices } = produceValues(voice1, clock)

  write('../../../../docs/voices/waveform.js', 'waveform', waves)
  write('../../../../docs/voices/envelope.js', 'envelope', envs)
  write('../../../../docs/voices/voice.js', 'voice', voices)
}

export function dummy() {}
