// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { writeFile } from 'fs'
import { resolve } from 'path'
import { range } from 'utils'

const D7 = [0x99, 0xf7]
const FG7 = [0xc1, 0xfc]
const A7 = [0xe6, 0xb0]

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

function produceOneVoice(voice1, filter, clock, iterations = 500, gap = 50) {
  const values = []

  voice1.surel = 0x80

  voice1.vcreg = 0x11

  for (const _ of range(iterations - 200)) {
    clock()
    values.push(filter.output)

    for (const __ of range(gap)) {
      clock()
    }
  }

  voice1.vcreg = 0x10

  for (const _ of range(200)) {
    clock()
    values.push(filter.output)

    for (const __ of range(gap)) {
      clock()
    }
  }

  return values
}

function produceThreeVoices(voice1, voice2, voice3, filter, clock, iterations = 500, gap = 50) {
  const values = []

  voice1.surel = 0x80
  voice2.surel = 0x80
  voice3.surel = 0x80

  voice1.vcreg = 0x11
  voice2.vcreg = 0x11
  voice3.vcreg = 0x11

  for (const _ of range(iterations - 200)) {
    clock()
    values.push(filter.output)

    for (const __ of range(gap)) {
      clock()
    }
  }

  voice1.vcreg = 0x10
  voice2.vcreg = 0x10
  voice3.vcreg = 0x10

  for (const _ of range(200)) {
    clock()
    values.push(filter.output)

    for (const __ of range(gap)) {
      clock()
    }
  }

  return values
}

export function graphSingleNoFilter({ voice1, filter, clock }) {
  ;[voice1.frehi, voice1.frelo] = D7
  filter.sigvol = 0x0f

  const values = produceOneVoice(voice1, filter, clock)

  const path = '../../../../docs/filters/nofilter.js'
  write(path, 'nofilter', values)
}

export function graphSingleLowPass({ voice1, filter, clock }) {
  ;[voice1.frehi, voice1.frelo] = D7
  filter.cuthi = 0x70
  filter.reson = 0x01
  filter.sigvol = 0x1f

  const values = produceOneVoice(voice1, filter, clock)

  const path = '../../../../docs/filters/lowpass.js'
  write(path, 'lowpass', values)
}

export function graphSingleBandPass({ voice1, filter, clock }) {
  ;[voice1.frehi, voice1.frelo] = D7
  filter.cuthi = 0x70
  filter.reson = 0x01
  filter.sigvol = 0x2f

  const values = produceOneVoice(voice1, filter, clock)

  const path = '../../../../docs/filters/bandpass.js'
  write(path, 'bandpass', values)
}

export function graphSingleHighPass({ voice1, filter, clock }) {
  ;[voice1.frehi, voice1.frelo] = D7
  filter.cuthi = 0x70
  filter.reson = 0x01
  filter.sigvol = 0x4f

  const values = produceOneVoice(voice1, filter, clock)

  const path = '../../../../docs/filters/highpass.js'
  write(path, 'highpass', values)
}

export function graphTripleNoFilter({ voice1, voice2, voice3, filter, clock }) {
  ;[voice1.frehi, voice1.frelo] = D7
  ;[voice2.frehi, voice2.frelo] = FG7
  ;[voice3.frehi, voice3.frelo] = A7
  filter.sigvol = 0x0f

  const values = produceThreeVoices(voice1, voice2, voice3, filter, clock)

  const path = '../../../../docs/filters/nofilter3.js'
  write(path, 'nofilter3', values)
}

export function graphTripleLowPass({ voice1, voice2, voice3, filter, clock }) {
  ;[voice1.frehi, voice1.frelo] = D7
  ;[voice2.frehi, voice2.frelo] = FG7
  ;[voice3.frehi, voice3.frelo] = A7
  filter.cuthi = 0x70
  filter.reson = 0x01
  filter.sigvol = 0x1f

  const values = produceThreeVoices(voice1, voice2, voice3, filter, clock)

  const path = '../../../../docs/filters/lowpass3.js'
  write(path, 'lowpass3', values)
}

export function graphTripleBandPass({ voice1, voice2, voice3, filter, clock }) {
  ;[voice1.frehi, voice1.frelo] = D7
  ;[voice2.frehi, voice2.frelo] = FG7
  ;[voice3.frehi, voice3.frelo] = A7
  filter.cuthi = 0x70
  filter.reson = 0x01
  filter.sigvol = 0x2f

  const values = produceThreeVoices(voice1, voice2, voice3, filter, clock)

  const path = '../../../../docs/filters/bandpass3.js'
  write(path, 'bandpass3', values)
}

export function graphTripleHighPass({ voice1, voice2, voice3, filter, clock }) {
  ;[voice1.frehi, voice1.frelo] = D7
  ;[voice2.frehi, voice2.frelo] = FG7
  ;[voice3.frehi, voice3.frelo] = A7
  filter.cuthi = 0x70
  filter.reson = 0x01
  filter.sigvol = 0x4f

  const values = produceThreeVoices(voice1, voice2, voice3, filter, clock)

  const path = '../../../../docs/filters/highpass3.js'
  write(path, 'highpass3', values)
}
