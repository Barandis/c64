// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// A single tone oscillator/waveform generator used in the 6581 SID.
//
// The oscillator consists of a phase accumulator followed by logic to turn the output of
// that oscillator into a waveform of a particular shape.
//
// A phase accumulator is simply a 23-bit value to which a certain number is added on every
// clock cycle (each time the φ2 pin transitions high). The accumulator is allowed to
// overflow and lose the most significant bit, which has the result of "resetting" it to
// near zero on a regular basis. This produces a sawtooth-shaped waveform.
//
// The number that is added to the PAO on each clock cycle is the value in the FREHI and
// FRELO registers. A higher number will cause the oscillator to overflow more frequently,
// producing a waveform of a higher frequency.
//
// This is known as a "phase accumulator" because the normal *next* step in waveform
// generation is to consult a lookup table with the values of sines for the accumulator
// value. Thus, the PA is actually determining the phase of the sine wave so produced. The
// 6581 does not produce sine waves because there was not enough room on the chip to add
// such a sine lookup table (the PA waveform itself is output as a sawtooth wave), but it is
// still referred to as a phase accumulator.
//
// The PA result is then fed into four waveform generators, one each for triangle, sawtooth,
// pulse, and noise waveforms. Which if these is enabled is controlled by the VCREG
// register. Multiple waveform generators can be enabled at once; when this is done, the
// output value at each clock cycle is the values of all enabled waveform generators,
// logically ANDed together.

import { bitSet, bitValue } from 'utils'
import { TEST, SYNC, RING } from './constants'
import psData from './wavetable-ps'
import pstData from './wavetable-pst'
import ptData from './wavetable-pt'
import stData from './wavetable-st'

// The position of the most significant bit of the accumulator. The SID uses a 24-bit
// accumulator.
const ACC_MSB = 23

// The position of the accumulator bit used to provide the clock to the shift register.
// When this bit changes state (0 to 1 or 1 to 0), the shift register calculates its next
// generation.
const LFSR_CLOCK = 19

// The positions of the shift register bits that are fed back to the beginning of the
// shift register on clock. If either the _RES pin is low or the TEST bit of VCREG is set,
// then the inverse of the bit value at `LFSR_TAP_1` becomes the new value pushed into bit
// 0 of the shift register. Otherwise, these two bit values are xored, and that value is
// pushed to bit 0.
const LFSR_TAP_1 = 17
const LFSR_TAP_2 = 22

// The positions of the shift register bits that are used as output for the noise waveform.
// Eight bits are used and then shifted four bits to the left to create a 12-bit value with
// 0's in the lower four bits.
const LFSR_OUT_0 = 0
const LFSR_OUT_1 = 2
const LFSR_OUT_2 = 5
const LFSR_OUT_3 = 9
const LFSR_OUT_4 = 11
const LFSR_OUT_5 = 14
const LFSR_OUT_6 = 18
const LFSR_OUT_7 = 20

export default function WaveformGenerator() {
  // The current value of the phase accumulator used to determine the oscillator output.
  let acc = 0

  // The current value of the linear feedback shift register used to produce pseudo-random
  // noise. The LFSR is constructed like this:
  //
  //       +---XOR------------------+
  //       |    |                   |
  // BIT:  2221111111111            |
  //       21098765432109876543210<-+
  //         | |   |  | |   |  | |
  // OUTPUT: 7 6   5  4 3   2  1 0
  //
  // The eight output bits are the values on any given read of bits 0, 2, 5, 9, 11, 14, 18,
  // and 20 of the shift register. On shift, each bit value is moved one to the left, and
  // then the values of bits 17 and 22 are exclusive-ored and used for the new value of bit
  // 0 (unless the TEST bit of #vcreg is high, or the RES pin is low, in which case bit 0
  // will always take the value of 1).
  //
  // A shift will occur each time the value of bit 19 of the accumulator transitions from 0
  // to 1. Since that frequency is determined by the values of frehi and frelo, the "pitch"
  // of the noise can be tuned just like the pitch of any of the other waveforms.
  let lfsr = 0x7ffff8

  // Tracks the previous value of the most significant bit of the oscillator to which this
  // oscillator is synched. If sync is enabled, this oscillator will be forcibly reset each
  // time the synched oscillator's MSB changes.
  let prevMsb = false

  // Tracks the previous value of the 19th bit of the phase accumulator. This bit is used as
  // a clock by the LFSR. Each time this bit transitions high, the LFSR shifts once.
  let lastClock = false

  // The value of the SID's frequency registers. This is the number that is added to the
  // accumulator on each clock cycle.
  let freq = 0

  // The value of the SID's pulse width registers. This is a 12-bit number that determines
  // when a pulse waveform's value shifts from zero to max.
  let pw = 0

  // The value of the TEST bit of the control register, as a boolean. If this is true, the
  // accumulator value will always be 0, 1's will be shifted into the noise LFSR, and the
  // pulse waveform output will be all 1's.
  let test = false

  // The value of the RING bit of the control register, as a boolean. If this is true, the
  // frequency of the synched oscillator will be used to ring-modulate this oscillator, as
  // long as the triangle waveform is selected.
  let ring = false

  // The value of the SYNC bit of the control register, as a boolean. If this is true, the
  // accumulator will be reset to 0 each time the MSB of the synched oscillator's
  // accumulator transitions from 0 to 1.
  let sync = false

  // The top four bits of the control register, which determine the waveform(s) produced.
  // This is stored as a combined number to make selection of multiple waveforms easier.
  let waveform = 0

  // Indicates whether the generator is in the process of resetting. This corresponds to the
  // time when the chip's RES pin is held low. The LFSR acts differently during this time.
  let resetting = false

  // The generator to which this generator is synched. This is predetermined on the 6581;
  // generator 1 is synched to generator 3, 2 to 1, and 3 to 2. This value will be set by
  // the Ic6581 code itself after all three generators are created, so it should never be
  // `null` during actual operation.
  let syncTarget = null

  // Advances the accumulator by adding the word comprised of the values of FREHI and FRELO.
  // This method handles the TEST bit (which sets the output of the oscillator to 0 as long
  // as it is set) and the SYNC bit (which causes the synched oscillator to reset the
  // accumulator when its MSB changes) of the VCREG control register. Any bits beyond the
  // 24 that make up the accumulator are discarded, meaning that when the accumulator
  // overflows, it returns to a value near zero.
  const accumulate = () => {
    const currMsb = bitSet(syncTarget?.acc, ACC_MSB)
    const reset = test || (sync && currMsb && !prevMsb)
    prevMsb = currMsb

    acc = reset ? 0 : (acc + freq) & 0xffffff
  }

  // Potentially advances the pseudo-random noise shift register one generation. This shift
  // only occurs if bit 19 of the phase accumulator has transitioned high since the last
  // time this method was called, meaning that bit 19 of the PA acts as the LFSR's clock.
  //
  // Bit 0 of a linear feedback shift register (LFSR) is determined by the shift register's
  // previous state. In this case, the values of bit positions 17 and 22 are exclusive-ored
  // to produce the value that is fed back into bit 0. This means that the value of the
  // shift register at any given time is completely deterministic and not random at all, but
  // it does a fine job of producing pseudo-random noise.
  const shift = () => {
    const clock = bitSet(acc, LFSR_CLOCK)
    if (clock && !lastClock) {
      lfsr <<= 1
      // This is a little weird on the physical 6581 chip.
      //
      // The code here replicates the result by oring three values, written in this order:
      //
      // 1. The xored result of the values of the two taps (at bit positions 17 and 22)
      // 2. An internal signal that is effectively the inverse of the RES pin
      // 3. The value of the TEST bit of the VCREG register
      //
      // This ensures that the value being fed back into bit 0 of the shift register is
      // always a 1 if either _RES is pulled low or TEST is set high. Otherwise, the value
      // being fed back is the xored values of the bits at the tap positions.
      //
      // An analysis of the silicon of a 6581 suggests that the second tap value is first
      // ored with the inverse of RES and the value of TEST, and that result is then xored
      // with the first tap value. This would not ensure that only 1's are injected if RES
      // is held low or TEST is set high, yet only 1's are injected. The mechanism that
      // causes this to happen on the chip is unknown.
      //
      // http://forum.6502.org/viewtopic.php?f=8&t=4150&start=30 near the bottom
      lfsr |= resetting | test | (bitValue(lfsr, LFSR_TAP_1) ^ bitValue(lfsr, LFSR_TAP_2))
      lfsr &= 0x7fffff
    }
    lastClock = clock
  }

  // The top 12 bits of the phase accumulator are directly used as the sawtooth waveform.
  const sawtooth = () => (acc >> 12) & 0xfff

  // For the triangle waveform, the MSB is xored against the other 11 of the top 12 bits
  // from the phase accumulator. Those 11 bits are then shifted one to the left. When the
  // MSB is high, this results in a reversal of the upward slope of the waveform, resulting
  // in a triangle. The shift means that the triangle retains the same frequency and
  // amplitude of the sawtooth original, but the fact that it's 11 bits means that it has
  // half the resolution.
  //
  // If the RING bit in VCREG is set, then the MSB of the synched oscillator is used to
  // potentially invert the slope one more time. Having the frequencies of the two
  // oscillators differ will produce complex waveforms. This is "ring modulation". Ring
  // modulation only works on the triangle waveform, and only if the synched oscillator has
  // a non-zero frequency set. No other attribute of the synched oscillator is used.
  const triangle = () => {
    const msb = bitSet(ring ? acc ^ syncTarget.acc : acc, ACC_MSB)
    return ((msb ? ~acc : acc) >> 11) & 0xfff
  }

  // A pulse waveform is generated by comparing the value of the top 12 bits of the
  // oscillator with the 12 bits from PWHI (top 4 bits are unused) and PWLO. All output bits
  // are then set to 1's or 0's based on that comparison.
  //
  // If the TEST bit of VCREG is set, the pulse waveform generator will output all 1's until
  // TEST is cleared.
  const pulse = () => (test || ((acc >> 12) & 0xfff) < pw ? 0xfff : 0x000)

  // Generates a pseudo-random noise waveform. This takes 8 particular bits from the LFSR
  // and uses them as the top 8 of the 12 produced by the waveform generator (the bottom 4
  // bits are zeros).
  const noise = () =>
    (bitValue(lfsr, LFSR_OUT_0) << 4) |
    (bitValue(lfsr, LFSR_OUT_1) << 5) |
    (bitValue(lfsr, LFSR_OUT_2) << 6) |
    (bitValue(lfsr, LFSR_OUT_3) << 7) |
    (bitValue(lfsr, LFSR_OUT_4) << 8) |
    (bitValue(lfsr, LFSR_OUT_5) << 9) |
    (bitValue(lfsr, LFSR_OUT_6) << 10) |
    (bitValue(lfsr, LFSR_OUT_7) << 11)

  return {
    // Sets the low 8 bits of the frequency. The Ic6581 object should set this each time the
    // appropriate FRELO register changes.
    frelo(value) {
      freq = (freq & 0xff00) | (value & 0x00ff)
    },

    // Sets the high 8 bits of the frequency. The Ic6581 object should set this each time
    // the appropriate FREHI register changes.
    frehi(value) {
      freq = (freq & 0x00ff) | ((value << 8) & 0xff00)
    },

    // Sets the low 8 bits of the pulse width. The Ic6581 object should set this each time
    // the appropriate PWLO register changes.
    pwlo(value) {
      pw = (pw & 0xf00) | (value & 0x0ff)
    },

    // Sets the high 4 bits of the pulse width. The Ic6581 object should set this each time
    // the appropriate PWHI register changes.
    pwhi(value) {
      pw = (pw & 0x0ff) | ((value << 8) & 0xf00)
    },

    // Sets the values of the test, ring, and sync bits, along with the waveform. The Ic6581
    // object should set this each time the appropriate VCREG register changes.
    vcreg(value) {
      test = bitSet(value, TEST)
      ring = bitSet(value, RING)
      sync = bitSet(value, SYNC)
      waveform = (value >> 4) & 0x0f
    },

    // Resets the generator. What happens depends on the `value` argument; this is meant to
    // be the current value of the chip's RES pin. If it's held low, the LFSR acts
    // differently; it's only when it returns high that the waveform generator is actually
    // reset to its default internal values.
    reset(value = true) {
      if (value) {
        acc = 0
        lfsr = 0x7ffff8
        lastClock = false

        freq = 0
        pw = 0
        test = false
        ring = false
        sync = false
        waveform = 0

        resetting = false
      } else {
        resetting = true
      }
    },

    // Each clock cycle, the accumulator is advanced one generation and the LFSR is
    // potentially shifted once.
    clock() {
      accumulate()
      shift()
    },

    // Registers an oscillator as the one to which this oscillator is synched. It is used by
    // the Ic6581 class itself during setup.
    sync(value) {
      syncTarget = value
    },

    // Generates the output of the oscillator.
    //
    // A lot of documentation says that if more than one waveform is selected, the output is
    // the bitwise AND of the selected waveforms. This real picture is much more complex;
    // zero bits, for example, can bleed into adjacent one bits and flip them to zero. The
    // mechanism by which this happens is not currently known.
    //
    // This isn't modeled directly as the details aren't known. Instead, for combined
    // waveforms, samples of actual data from the ENV3 register of a physical 6581 are used.
    // These are 4096-entry tables, one for each of the possible output values from the
    // single waveform generators. The result is an 8-bit number that is shifted into a
    // 12-bit number, so the bottom four bits are lost and therefore this is not an exact
    // reproduction. But it's all you can get from the ENV3 register.
    //
    // Noise is handled differently. When noise is combined with any other waveform, the
    // result (after a short time) is always values of 0. It is conjectured that this is
    // because combining noise with another waveform causes the shift register to fill with
    // zeros, meaning the noise waveform itself will be all zeroes. In the real 6581, this
    // actually necessitates a chip reset in order for the shift register to be able to have
    // any non-zero values from then on.
    //
    // There is no model known for this behavior, so this method just returns 0. The
    // original 6581 documentation warned against combining noise with any other waveform,
    // and that warning is repeated here.
    get output() {
      switch (waveform) {
        case 1:
          // Triangle
          return triangle()
        case 2:
          // Sawtooth
          return sawtooth()
        case 3:
          // Triangle + sawtooth
          return stData[sawtooth()] << 4
        case 4:
          // Pulse
          return pulse()
        case 5:
          // Pulse + triangle
          return (ptData[triangle() >> 1] << 4) & pulse()
        case 6:
          // Pulse + sawtooth
          return (psData[sawtooth()] << 4) & pulse()
        case 7:
          // Pulse + sawtooth + triangle
          return (pstData[sawtooth()] << 4) & pulse()
        case 8:
          // Noise
          return noise()
        default:
          // No waveform (0) and all combinations with noise (9+)
          return 0
      }
    },

    // Returns the current value of the phase accumulator. This is used internally by the
    // waveform generator that this one is synched to.
    get acc() {
      return acc
    },
  }
}
