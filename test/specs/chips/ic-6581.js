// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { writeFile } from 'fs'

import { resolve } from 'path'

import Oscillator from 'chips/ic-6581/oscillator'
import { Ic6581 } from 'chips/index'
import { deviceTraces } from 'test/helper'
import { SAWTOOTH, TRIANGLE, PULSE, NOISE, SYNC, RING } from 'chips/ic-6581/constants'
import { range, setBit } from 'utils'
import {
  pulseA4,
  pulseA7,
  sawtoothA4,
  sawtoothA7,
  triangleA4,
  triangleA7,
} from './ic-6581/oscillator'

const A4 = [0x1c, 0xd6]
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

describe('6581 SID', () => {
  describe('oscillator', () => {
    let chip
    let tr
    let registers
    let osc1
    let osc2
    let osc3

    function setPitch([hi, lo]) {
      registers[0] = lo
      registers[1] = hi
    }

    function setWaveform(...waveforms) {
      let value = 0
      waveforms.forEach(bit => (value = setBit(value, bit)))
      registers[4] = value
    }

    function setPulseWidth(pw) {
      registers[2] = pw & 0xff
      registers[3] = (pw >> 8) & 0x0f
    }

    function readRegister(index) {
      return registers[index]
    }

    function produceValues(iterations = 500) {
      const values = []

      for (const _ of range(iterations)) {
        tr.φ2.set()
        values.push(osc1.read())
        tr.φ2.clear()

        for (const __ of range(20)) {
          tr.φ2.set().clear()
        }
      }

      return values
    }

    beforeEach(() => {
      chip = new Ic6581()
      tr = deviceTraces(chip)
      registers = new Uint8Array(15)

      osc1 = new Oscillator(chip, 0, readRegister)
      osc2 = new Oscillator(chip, 5, readRegister)
      osc3 = new Oscillator(chip, 10, readRegister)

      osc1.sync(osc3)
      osc2.sync(osc1)
      osc3.sync(osc2)

      tr._RES.set()
      tr._CS.set()
      tr.R__W.set()
    })

    const test = fn => () =>
      fn({
        chip,
        tr,
        readRegister,
        setPitch,
        setWaveform,
        setPulseWidth,
        osc1,
        osc2,
        osc3,
      })

    describe('oscillator and waveform generator', () => {
      describe('sawtooth generator', () => {
        it('produces a 440Hz A', test(sawtoothA4))
        it('produces a 3520Hz A', test(sawtoothA7))
      })
      describe('triangle generator', () => {
        it('produces a 440Hz A', test(triangleA4))
        it('produces a 3520Hz A', test(triangleA7))
      })
      describe('pulse generator', () => {
        it('produces a 440Hz A', test(pulseA4))
        it('produces a 3520Hz A', test(pulseA7))
      })
    })

    describe.only('graph production', () => {
      it('produces a sawtooth waveform', () => {
        setPitch(A4)
        setWaveform(SAWTOOTH)

        const values = produceValues()

        const path = '../../../docs/waveforms/sawtooth.js'
        write(path, 'sawtooth', values)
      })

      it('produces a high-frequency sawtooth waveform', () => {
        setPitch(A7)
        setWaveform(SAWTOOTH)

        const values = produceValues()

        const path = '../../../docs/waveforms/sawtoothhigh.js'
        write(path, 'sawtoothhigh', values)
      })

      it('produces a triangle waveform', () => {
        setPitch(A4)
        setWaveform(TRIANGLE)

        const values = produceValues()

        const path = '../../../docs/waveforms/triangle.js'
        write(path, 'triangle', values)
      })

      it('produces a high-frequency triangle waveform', () => {
        setPitch(A7)
        setWaveform(TRIANGLE)

        const values = produceValues()

        const path = '../../../docs/waveforms/trianglehigh.js'
        write(path, 'trianglehigh', values)
      })

      it('produces a pulse waveform', () => {
        setPitch(A4)
        setWaveform(PULSE)
        setPulseWidth(0x800)

        const values = produceValues()

        const path = '../../../docs/waveforms/pulse.js'
        write(path, 'pulse', values)
      })

      it('produces a pulse waveform', () => {
        setPitch(A7)
        setWaveform(PULSE)
        setPulseWidth(0x800)

        const values = produceValues()

        const path = '../../../docs/waveforms/pulsehigh.js'
        write(path, 'pulsehigh', values)
      })

      it('produces a noise waveform', () => {
        setPitch(A4)
        setWaveform(NOISE)

        const values = produceValues()

        const path = '../../../docs/waveforms/noise.js'
        write(path, 'noise', values)
      })

      it('produces a higher-frequency noise waveform', () => {
        setPitch(A7)
        setWaveform(NOISE)

        const values = produceValues()

        const path = '../../../docs/waveforms/noisehigh.js'
        write(path, 'noisehigh', values)
      })

      const widths = [...range(1000, 3001, 1000)]
      widths.forEach(pw => {
        it(`produces a pulse with width ${pw}`, () => {
          setPitch(A4)
          setWaveform(PULSE)
          setPulseWidth(pw)

          const values = produceValues()

          const path = `../../../docs/waveforms/pulse${pw}.js`
          write(path, `pulse${pw}`, values)
        })
      })

      it('produces sawtooth + triangle', () => {
        setPitch(A4)
        setWaveform(SAWTOOTH, TRIANGLE)

        const values = produceValues()

        const path = '../../../docs/waveforms/sawtri.js'
        write(path, 'sawtri', values)
      })

      it('produces sawtooth + pulse', () => {
        setPitch(A4)
        setWaveform(SAWTOOTH, PULSE)
        setPulseWidth(0x800)

        const values = produceValues()

        const path = '../../../docs/waveforms/sawpul.js'
        write(path, 'sawpul', values)
      })

      it('produces triangle + pulse', () => {
        setPitch(A4)
        setWaveform(TRIANGLE, PULSE)
        setPulseWidth(0x800)

        const values = produceValues()

        const path = '../../../docs/waveforms/tripul.js'
        write(path, 'tripul', values)
      })

      it('produces triangle + pulse + sawtooth', () => {
        setPitch(A4)
        setWaveform(TRIANGLE, PULSE, SAWTOOTH)
        setPulseWidth(0x800)

        const values = produceValues()

        const path = '../../../docs/waveforms/tripulsaw.js'
        write(path, 'tripulsaw', values)
      })

      it('produces a hard sync with osc 3', () => {
        setPitch(A4)
        setWaveform(SAWTOOTH, SYNC)
        registers[10] = 0x25
        registers[11] = 0x11

        const values = produceValues()

        const path = '../../../docs/waveforms/sync.js'
        write(path, 'sync', values)
      })

      it('produces ring modulation with osc 3', () => {
        setPitch(A4)
        setWaveform(TRIANGLE, RING)
        registers[10] = 0x25
        registers[11] = 0x11

        const values = produceValues()

        const path = '../../../docs/waveforms/ring.js'
        write(path, 'ring', values)
      })
    })
  })
})
