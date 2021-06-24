// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import EnvelopeGenerator from 'chips/ic-6581/envelope'
import ExternalFilter from 'chips/ic-6581/external'
import Filter from 'chips/ic-6581/filter'
import Voice from 'chips/ic-6581/voice'
import WaveformGenerator from 'chips/ic-6581/waveform'
import { range, setBit } from 'utils'
import graphFull from './ic-6581/chip'
import { graphFullSustain, graphMinimum, graphZeroSustain } from './ic-6581/envelope'
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

describe('6581 SID', () => {
  describe('waveform generator', () => {
    let wave1
    let wave2
    let wave3

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

    beforeEach(() => {
      wave1 = WaveformGenerator()
      wave2 = WaveformGenerator()
      wave3 = WaveformGenerator()

      wave1.sync(wave3)
      wave2.sync(wave1)
      wave3.sync(wave2)
    })

    const test =
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

    describe.skip('graph production', () => {
      it('graphs a sawtooth waveform', test(graphSawtooth))
      it('graphs a high-frequency sawtooth waveform', test(graphSawtoothHigh))
      it('graphs a triangle waveform', test(graphTriangle))
      it('graphs a high-frequency triangle waveform', test(graphTriangleHigh))
      it('graphs a pulse waveform', test(graphPulse))
      it('graphs a high-frequency pulse waveform', test(graphPulseHigh))
      it('graphs a noise waveform', test(graphNoise))
      it('graphs a higher-frequency noise waveform', test(graphNoiseHigh))

      const widths = [...range(1000, 3001, 1000)]
      widths.forEach(pw => {
        it(`graphs a pulse with width ${pw}`, test(graphPulseVary, pw))
      })
      it('graphs sawtooth + triangle', test(graphSawTri))
      it('graphs sawtooth + pulse', test(graphSawPul))
      it('graphs triangle + pulse', test(graphTriPul))
      it('graphs triangle + pulse + sawtooth', test(graphTriPulSaw))
      it('graphs a hard sync with wave 3', test(graphSync))
      it('graphs ring modulation with wave 3', test(graphRing))
    })
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

    const test =
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

    describe.skip('graph production', () => {
      it('graphs a minimum-parameter envelope', test(graphMinimum))
      it('graphs a zero-sustain envelope', test(graphZeroSustain))
      it('graphs a full-sustain envelope', test(graphFullSustain))
    })
  })

  describe('voice', () => {
    let voice1
    let voice2
    let voice3

    function clock() {
      voice1.clock()
      voice2.clock()
      voice3.clock()
    }

    beforeEach(() => {
      voice1 = Voice()
      voice2 = Voice()
      voice3 = Voice()

      voice1.sync(voice3)
      voice2.sync(voice1)
      voice3.sync(voice2)
    })

    const test =
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

    describe.skip('graph production', () => {
      it('graphs waveform, envelope, and voice', test(graphVoice))
    })
  })

  describe('filter', () => {
    let voice1
    let voice2
    let voice3
    let filter

    function clock() {
      voice1.clock()
      voice2.clock()
      voice3.clock()
      filter.clock(voice1.output, voice2.output, voice3.output, 0)
    }

    beforeEach(() => {
      voice1 = Voice()
      voice2 = Voice()
      voice3 = Voice()

      voice1.sync(voice3)
      voice2.sync(voice1)
      voice3.sync(voice2)

      filter = Filter()
    })

    const test =
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

    describe.skip('graph production', () => {
      describe('filter a single note', () => {
        it('graphs a no-filter tone', test(graphSingleNoFilter))
        it('graphs a low-pass tone', test(graphSingleLowPass))
        it('graphs a band-pass tone', test(graphSingleBandPass))
        it('graphs a high-pass tone', test(graphSingleHighPass))
        it('graphs a no-filter chord', test(graphTripleNoFilter))
        it('graphs a low-pass chord', test(graphTripleLowPass))
        it('graphs a band-pass chord', test(graphTripleBandPass))
        it('graphs a high-pass chord', test(graphTripleHighPass))
      })
    })
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

    const test =
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

    describe.skip('graph production', () => {
      describe('produce a chord', () => {
        it('graphs a D major chord', test(graphChord))
      })
    })
  })

  describe('packaged 6581', () => {
    describe.skip('graph production', () => {
      it('graphs registers and output for a D major chord', graphFull)
    })
  })
})
