// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import EnvelopeGenerator from 'chips/ic-6581/envelope'
import ExternalFilter from 'chips/ic-6581/external'
import Filter from 'chips/ic-6581/filter'
import Ic6581 from 'chips/ic-6581/index'
import Voice from 'chips/ic-6581/voice'
import WaveformGenerator from 'chips/ic-6581/waveform'
import { deviceTraces } from 'test/helper'
import { pinsToValue, range, setBit, valueToPins } from 'utils'
import graphFull from './ic-6581/chip'
import {
  envMaxSustain,
  envMinimum,
  envNoSustain,
  graphFullSustain,
  graphMinimum,
  graphZeroSustain,
} from './ic-6581/envelope'
import graphChord from './ic-6581/external'
import {
  graphSingleBandPass,
  graphSingleHighPass,
  graphSingleLowPass,
  graphSingleNoFilter,
  graphTripleBandPass,
  graphTripleHighPass,
  graphTripleLowPass,
  graphTripleNoFilter,
} from './ic-6581/filter'
import {
  readEnvRegister,
  readOscRegister,
  readPotRegisters,
  readWriteOnly,
  writeFcRegisters,
  writeOtherRegisters,
  writePwRegisters,
  writeReadOnly,
} from './ic-6581/registers'
import { graphVoice } from './ic-6581/voice'
import {
  graphNoise,
  graphNoiseHigh,
  graphPulse,
  graphPulseHigh,
  graphPulseVary,
  graphRing,
  graphSawPul,
  graphSawtooth,
  graphSawtoothHigh,
  graphSawTri,
  graphSync,
  graphTriangle,
  graphTriangleHigh,
  graphTriPul,
  graphTriPulSaw,
  pulseA4,
  pulseA7,
  sawtoothA4,
  sawtoothA7,
  triangleA4,
  triangleA7,
} from './ic-6581/waveform'

const RUN_GRAPHS = false

describe('6581 SID', () => {
  let chip
  let tr
  let addrTraces
  let dataTraces

  beforeEach(() => {
    chip = Ic6581()
    tr = deviceTraces(chip)

    addrTraces = [...range(5)].map(i => tr[`A${i}`])
    dataTraces = [...range(8)].map(i => tr[`D${i}`])

    tr.R_W.set()
    tr.RES.set()
    tr.CS.set()
  })

  function writeRegister(register, value) {
    valueToPins(value, ...dataTraces)
    valueToPins(register, ...addrTraces)
    tr.R_W.clear()
    tr.CS.clear()
    tr.CS.set()
    tr.R_W.set()
  }

  function readRegister(register) {
    valueToPins(register, ...addrTraces)
    tr.CS.clear()
    const value = pinsToValue(...dataTraces)
    tr.CS.set()
    return value
  }

  const test = fn => () =>
    fn({
      chip,
      tr,
      writeRegister,
      readRegister,
    })

  describe('external interface', () => {
    describe('writing registers', () => {
      it('removes the top 4 bits from PWHI registers', test(writePwRegisters))
      it('removes the top 5 bits from the CUTLO register', test(writeFcRegisters))
      it('writes other registers without changes', test(writeOtherRegisters))
      it('does not write to read-only registers', test(writeReadOnly))
    })
    describe('reading registers', () => {
      it('reads changes to POTX and POTY', test(readPotRegisters))
      it('reads voice 3 envelope from ENV3', test(readEnvRegister))
      it('reads voice 3 waveform from RANDOM', test(readOscRegister))
      it('reads last written value from write-only registers', test(readWriteOnly))
    })
  })

  describe('waveform generator', () => {
    let wave1
    let wave2
    let wave3

    beforeEach(() => {
      wave1 = WaveformGenerator()
      wave2 = WaveformGenerator()
      wave3 = WaveformGenerator()

      wave1.sync(wave3)
      wave2.sync(wave1)
      wave3.sync(wave2)
    })

    function setPitch(wave, [hi, lo]) {
      wave.frelo(lo)
      wave.frehi(hi)
    }

    function setControl(wave, ...ctrl) {
      let value = 0
      ctrl.forEach(bit => (value = setBit(value, bit)))
      wave.vcreg(value)
    }

    function setPulseWidth(wave, pw) {
      wave.pwlo(pw & 0xff)
      wave.pwhi((pw >> 8) & 0x0f)
    }

    function clock() {
      wave1.clock()
      wave2.clock()
      wave3.clock()
    }

    const testWave =
      (fn, ...args) =>
      () =>
        fn(
          {
            setPitch,
            setControl,
            setPulseWidth,
            clock,
            wave1,
            wave2,
            wave3,
          },
          ...args,
        )

    describe('sawtooth generator', () => {
      it('produces a 440Hz A', testWave(sawtoothA4))
      it('produces a 3520Hz A', testWave(sawtoothA7))
    })
    describe('triangle generator', () => {
      it('produces a 440Hz A', testWave(triangleA4))
      it('produces a 3520Hz A', testWave(triangleA7))
    })
    describe('pulse generator', () => {
      it('produces a 440Hz A', testWave(pulseA4))
      it('produces a 3520Hz A', testWave(pulseA7))
    })

    if (RUN_GRAPHS) {
      describe('graph production', () => {
        it('graphs a sawtooth waveform', testWave(graphSawtooth))
        it('graphs a high-frequency sawtooth waveform', testWave(graphSawtoothHigh))
        it('graphs a triangle waveform', testWave(graphTriangle))
        it('graphs a high-frequency triangle waveform', testWave(graphTriangleHigh))
        it('graphs a pulse waveform', testWave(graphPulse))
        it('graphs a high-frequency pulse waveform', testWave(graphPulseHigh))
        it('graphs a noise waveform', testWave(graphNoise))
        it('graphs a higher-frequency noise waveform', testWave(graphNoiseHigh))

        const widths = [...range(1000, 3001, 1000)]
        widths.forEach(pw => {
          it(`graphs a pulse with width ${pw}`, testWave(graphPulseVary, pw))
        })
        it('graphs sawtooth + triangle', testWave(graphSawTri))
        it('graphs sawtooth + pulse', testWave(graphSawPul))
        it('graphs triangle + pulse', testWave(graphTriPul))
        it('graphs triangle + pulse + sawtooth', testWave(graphTriPulSaw))
        it('graphs a hard sync with wave 3', testWave(graphSync))
        it('graphs ring modulation with wave 3', testWave(graphRing))
      })
    }
  })

  describe('envelope generator', () => {
    let env1
    let env2
    let env3

    function clock() {
      env1.clock()
      env2.clock()
      env3.clock()
    }

    beforeEach(() => {
      env1 = EnvelopeGenerator()
      env2 = EnvelopeGenerator()
      env3 = EnvelopeGenerator()
    })

    const testEnv =
      (fn, ...args) =>
      () =>
        fn(
          {
            clock,
            env1,
            env2,
            env3,
          },
          ...args,
        )

    describe('envelope values', () => {
      it('generates an envelope with minmum ADR values', testEnv(envMinimum))
      it('generates an envelope with no sustain', testEnv(envNoSustain))
      it('generates an envelope with max sustain', testEnv(envMaxSustain))
    })

    if (RUN_GRAPHS) {
      describe('graph production', () => {
        it('graphs a minimum-parameter envelope', testEnv(graphMinimum))
        it('graphs a zero-sustain envelope', testEnv(graphZeroSustain))
        it('graphs a full-sustain envelope', testEnv(graphFullSustain))
      })
    }
  })

  describe('voice', () => {
    let voice1
    let voice2
    let voice3

    beforeEach(() => {
      voice1 = Voice()
      voice2 = Voice()
      voice3 = Voice()

      voice1.sync(voice3)
      voice2.sync(voice1)
      voice3.sync(voice2)
    })

    function clock() {
      voice1.clock()
      voice2.clock()
      voice3.clock()
    }

    const testVoice =
      (fn, ...args) =>
      () =>
        fn(
          {
            clock,
            voice1,
            voice2,
            voice3,
          },
          ...args,
        )

    if (RUN_GRAPHS) {
      describe('graph production', () => {
        it('graphs waveform, envelope, and voice', testVoice(graphVoice))
      })
    }
  })

  describe('filter', () => {
    let voice1
    let voice2
    let voice3
    let filter

    beforeEach(() => {
      voice1 = Voice()
      voice2 = Voice()
      voice3 = Voice()

      voice1.sync(voice3)
      voice2.sync(voice1)
      voice3.sync(voice2)

      filter = Filter()
    })

    function clock() {
      voice1.clock()
      voice2.clock()
      voice3.clock()
      filter.clock(voice1.output, voice2.output, voice3.output, 0)
    }

    const testFilter =
      (fn, ...args) =>
      () =>
        fn(
          {
            clock,
            voice1,
            voice2,
            voice3,
            filter,
          },
          ...args,
        )

    if (RUN_GRAPHS) {
      describe('graph production', () => {
        describe('filter a single note', () => {
          it('graphs a no-filter tone', testFilter(graphSingleNoFilter))
          it('graphs a low-pass tone', testFilter(graphSingleLowPass))
          it('graphs a band-pass tone', testFilter(graphSingleBandPass))
          it('graphs a high-pass tone', testFilter(graphSingleHighPass))
          it('graphs a no-filter chord', testFilter(graphTripleNoFilter))
          it('graphs a low-pass chord', testFilter(graphTripleLowPass))
          it('graphs a band-pass chord', testFilter(graphTripleBandPass))
          it('graphs a high-pass chord', testFilter(graphTripleHighPass))
        })
      })
    }
  })

  describe('full chip', () => {
    let voice1
    let voice2
    let voice3
    let filter
    let ext

    beforeEach(() => {
      voice1 = Voice()
      voice2 = Voice()
      voice3 = Voice()

      voice1.sync(voice3)
      voice2.sync(voice1)
      voice3.sync(voice2)

      filter = Filter()
      ext = ExternalFilter()
    })

    const testExt =
      (fn, ...args) =>
      () =>
        fn(
          {
            voice1,
            voice2,
            voice3,
            filter,
            ext,
          },
          ...args,
        )

    if (RUN_GRAPHS) {
      describe('graph production', () => {
        describe('produce a chord', () => {
          it('graphs a D major chord', testExt(graphChord))
        })
      })
    }
  })

  describe('packaged 6581', () => {
    if (RUN_GRAPHS) {
      describe.skip('graph production', () => {
        it('graphs registers and output for a D major chord', graphFull)
      })
    }
  })
})
