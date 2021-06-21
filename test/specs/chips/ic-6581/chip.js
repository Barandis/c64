// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  CUTHI,
  CUTLO,
  ENV3,
  FREHI1,
  FREHI2,
  FREHI3,
  FRELO1,
  FRELO2,
  FRELO3,
  RANDOM,
  RESON,
  SIGVOL,
  SUREL1,
  SUREL2,
  SUREL3,
  VCREG1,
  VCREG2,
  VCREG3,
} from 'chips/ic-6581/constants'
import { Ic6581 } from 'chips/index'
import { writeFile } from 'fs'
import { resolve } from 'path'
import { deviceTraces } from 'test/helper'
import { pinsToValue, range, valueToPins } from 'utils'

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

function writeRegister(tr, index, value) {
  valueToPins(index, tr.A0, tr.A1, tr.A2, tr.A3, tr.A4)
  valueToPins(value, tr.D0, tr.D1, tr.D2, tr.D3, tr.D4, tr.D5, tr.D6, tr.D7)
  tr.R__W.clear()
  tr._CS.clear()
  tr._CS.set()
  tr.R__W.set()
}

function readRegister(tr, index) {
  valueToPins(index, tr.A0, tr.A1, tr.A2, tr.A3, tr.A4)
  tr._CS.clear()
  const result = pinsToValue(tr.D0, tr.D1, tr.D2, tr.D3, tr.D4, tr.D5, tr.D6, tr.D7)
  tr._CS.set()
  return result
}

export default function graphFull() {
  const chip = new Ic6581()
  const tr = deviceTraces(chip)

  // Set voice 1 pitch to D7 (0x99f7)
  writeRegister(tr, FRELO1, 0xf7)
  writeRegister(tr, FREHI1, 0x99)
  // Set voice 1 sustain to 70%
  writeRegister(tr, SUREL1, 0xc0)

  // Set voice 2 pitch to F#7 (0xc1fc)
  writeRegister(tr, FRELO2, 0xfc)
  writeRegister(tr, FREHI2, 0xc1)
  // Set voice 2 sustain to 20%
  writeRegister(tr, SUREL2, 0x40)

  // Set voice 3 pitch to A7 (0xe6b0)
  writeRegister(tr, FRELO3, 0xb0)
  writeRegister(tr, FREHI3, 0xe6)
  // Set voice 3 sustain to 50%
  writeRegister(tr, SUREL3, 0x80)

  // Set filter frequency to about 6kHz
  writeRegister(tr, CUTLO, 0x00)
  writeRegister(tr, CUTHI, 0x88)
  // Set filter 2 on, resonance to 50%
  writeRegister(tr, RESON, 0x82)
  // Set filter to low pass, set volume to max, disable voice 3
  writeRegister(tr, SIGVOL, 0x9f)

  const osc3 = []
  const env3 = []
  const audio = []

  // Set voice 1 to ring-modulated triangle and gate
  writeRegister(tr, VCREG1, 0x15)
  // Set voice 2 to sawtooth and gate
  writeRegister(tr, VCREG2, 0x21)
  // Set voice 3 to noise and gate (this is just to test osc3, env3, as the waveform is
  // zeroed by the filter since voice 3 is disabled)
  writeRegister(tr, VCREG3, 0x81)

  // Graph valuus for attack, decay, and sustain phases
  for (const _ of range(300)) {
    tr.φ2.set().clear()
    osc3.push(readRegister(tr, RANDOM))
    env3.push(readRegister(tr, ENV3))
    audio.push(tr.AUDIO.level)

    for (const __ of range(50)) {
      tr.φ2.set().clear()
    }
  }

  // Ungate all three voices, leaving other settings the same
  writeRegister(tr, VCREG1, 0x14)
  writeRegister(tr, VCREG2, 0x20)
  writeRegister(tr, VCREG3, 0x80)

  // Graph values for release phase
  for (const _ of range(200)) {
    tr.φ2.set().clear()
    osc3.push(readRegister(tr, RANDOM))
    env3.push(readRegister(tr, ENV3))
    audio.push(tr.AUDIO.level)

    for (const __ of range(50)) {
      tr.φ2.set().clear()
    }
  }

  write('../../../../docs/6581/osc3.js', 'osc3', osc3)
  write('../../../../docs/6581/env3.js', 'env3', env3)
  write('../../../../docs/6581/audio.js', 'audio', audio)
}
