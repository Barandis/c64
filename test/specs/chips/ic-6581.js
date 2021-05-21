// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { writeFile } from 'fs'

import { resolve } from 'path'

import WaveformGenerator from 'chips/ic-6581/waveform'
import { Ic6581 } from 'chips/index'
import { deviceTraces } from 'test/helper'
import { SAWTOOTH, TRIANGLE, PULSE, NOISE, SYNC, RING } from 'chips/ic-6581/constants'
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

describe('6581 SID', () => {
  describe('waveform generator', () => {
    let chip
    let tr
    let registers
    let gen1
    let gen2
    let gen3

    function readRegister(index) {
      return registers[index]
    }

    function produceValues() {
      const values = []

      for (const _ of range(500)) {
        tr.φ2.set()
        values.push(gen1.value)
        tr.φ2.clear()

        for (const __ of range(20)) {
          tr.φ2.set().clear()
        }
      }

      return values
    }

    beforeEach(() => {
      chip = Ic6581()
      tr = deviceTraces(chip)
      registers = new Uint8Array(15)

      gen1 = WaveformGenerator(chip, 0, readRegister)
      gen2 = WaveformGenerator(chip, 5, readRegister)
      gen3 = WaveformGenerator(chip, 10, readRegister)

      gen1.sync(gen3)
      gen2.sync(gen1)
      gen3.sync(gen2)

      tr._RES.set()
      tr._CS.set()
      tr.R__W.set()
    })

    describe.skip('graph production', () => {
      it('produces a sawtooth waveform', () => {
        registers[0] = 0xd6
        registers[1] = 0x1c
        registers[4] = 1 << SAWTOOTH

        const values = produceValues()

        const path = '../../../docs/waveforms/sawtooth.js'
        write(path, 'sawtooth', values)
      })

      it('produces a high-frequency sawtooth waveform', () => {
        registers[0] = 0xb0
        registers[1] = 0xe6
        registers[4] = 1 << SAWTOOTH

        const values = produceValues()

        const path = '../../../docs/waveforms/sawtoothhigh.js'
        write(path, 'sawtoothhigh', values)
      })

      it('produces a triangle waveform', () => {
        registers[0] = 0xd6
        registers[1] = 0x1c
        registers[4] = 1 << TRIANGLE

        const values = produceValues()

        const path = '../../../docs/waveforms/triangle.js'
        write(path, 'triangle', values)
      })

      it('produces a high-frequency triangle waveform', () => {
        registers[0] = 0xb0
        registers[1] = 0xe6
        registers[4] = 1 << TRIANGLE

        const values = produceValues()

        const path = '../../../docs/waveforms/trianglehigh.js'
        write(path, 'trianglehigh', values)
      })

      it('produces a pulse waveform', () => {
        registers[0] = 0xd6
        registers[1] = 0x1c
        registers[2] = 0x00
        registers[3] = 0x08
        registers[4] = 1 << PULSE

        const values = produceValues()

        const path = '../../../docs/waveforms/pulse.js'
        write(path, 'pulse', values)
      })

      it('produces a pulse waveform', () => {
        registers[0] = 0xb0
        registers[1] = 0xe6
        registers[2] = 0x00
        registers[3] = 0x08
        registers[4] = 1 << PULSE

        const values = produceValues()

        const path = '../../../docs/waveforms/pulsehigh.js'
        write(path, 'pulsehigh', values)
      })

      it('produces a noise waveform', () => {
        registers[0] = 0xd6
        registers[1] = 0x1c
        registers[4] = 1 << NOISE

        const values = produceValues()

        const path = '../../../docs/waveforms/noise.js'
        write(path, 'noise', values)
      })

      it('produces a higher-frequency noise waveform', () => {
        registers[0] = 0xb0
        registers[1] = 0xe6
        registers[4] = 1 << NOISE

        const values = produceValues()

        const path = '../../../docs/waveforms/noisehigh.js'
        write(path, 'noisehigh', values)
      })

      const widths = [...range(1000, 3001, 1000)]
      widths.forEach(pw => {
        it(`produces a pulse with width ${pw}`, () => {
          registers[0] = 0xd6
          registers[1] = 0x1c
          registers[2] = pw & 0xff
          registers[3] = (pw & 0xff00) >> 8
          registers[4] = 1 << PULSE

          const values = produceValues()

          const path = `../../../docs/waveforms/pulse${pw}.js`
          write(path, `pulse${pw}`, values)
        })
      })

      it('produces sawtooth + triangle', () => {
        registers[0] = 0xd6
        registers[1] = 0x1c
        registers[4] = (1 << SAWTOOTH) | (1 << TRIANGLE)

        const values = produceValues()

        const path = '../../../docs/waveforms/sawtri.js'
        write(path, 'sawtri', values)
      })

      it('produces sawtooth + pulse', () => {
        registers[0] = 0xd6
        registers[1] = 0x1c
        registers[2] = 0x00
        registers[3] = 0x08
        registers[4] = (1 << SAWTOOTH) | (1 << PULSE)

        const values = produceValues()

        const path = '../../../docs/waveforms/sawpul.js'
        write(path, 'sawpul', values)
      })

      it('produces triangle + pulse', () => {
        registers[0] = 0xd6
        registers[1] = 0x1c
        registers[2] = 0x00
        registers[3] = 0x08
        registers[4] = (1 << TRIANGLE) | (1 << PULSE)

        const values = produceValues()

        const path = '../../../docs/waveforms/tripul.js'
        write(path, 'tripul', values)
      })

      it('produces a hard sync with osc 3', () => {
        registers[0] = 0xd6
        registers[1] = 0x1c
        registers[4] = (1 << SAWTOOTH) | (1 << SYNC)
        registers[10] = 0x25
        registers[11] = 0x11

        const values = produceValues()

        const path = '../../../docs/waveforms/sync.js'
        write(path, 'sync', values)
      })

      it('produces ring modulation with osc 3', () => {
        registers[0] = 0xd6
        registers[1] = 0x1c
        registers[4] = (1 << TRIANGLE) | (1 << RING)
        registers[10] = 0x25
        registers[11] = 0x11

        const values = produceValues()

        const path = '../../../docs/waveforms/ring.js'
        write(path, 'ring', values)
      })
    })
  })
})
