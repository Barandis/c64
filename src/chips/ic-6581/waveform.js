// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * A single tone oscillator/waveform generator used in the 6581 SID.
 *
 * The oscillator consists of a phase accumulator followed by logic to turn the output of
 * that oscillator into a waveform of a particular shape.
 *
 * A phase accumulator is simply a 23-bit value to which a certain number is added on every
 * clock cycle (each time the φ2 pin transitions high). The accumulator is allowed to
 * overflow and lose the most significant bit, which has the result of "resetting" it to
 * near zero on a regular basis. This produces a sawtooth-shaped waveform.
 *
 * The number that is added to the PAO on each clock cycle is the value in the FREHI and
 * FRELO registers. A higher number will cause the oscillator to overflow more frequently,
 * producing a waveform of a higher frequency.
 *
 * This is known as a "phase accumulator" because the normal *next* step in waveform
 * generation is to consult a lookup table with the values of sines for the accumulator
 * value. Thus, the PA is actually determining the phase of the sine wave so produced. The
 * 6581 does not produce sine waves because there was not enough room on the chip to add
 * such a sine lookup table (the PA waveform itself is output as a sawtooth wave), but it is
 * still referred to as a phase accumulator.
 *
 * The PA result is then fed into four waveform generators, one each for triangle, sawtooth,
 * pulse, and noise waveforms. Which if these is enabled is controlled by the VCREG
 * register. Multiple waveform generators can be enabled at once; when this is done, the
 * output value at each clock cycle is the values of all enabled waveform generators,
 * logically ANDed together.
 */

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

export default class WaveformGenerator {
  // The current value of the phase accumulator used to determine the oscillator output.
  /** @type {number} */
  #acc

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
  // 0 (unless the TEST bit of #vcreg is high, or the _RES pin is low, in which case bit 0
  // will always take the value of 1).
  //
  // A shift will occur each time the value of bit 19 of the accumulator transitions from 0
  // to 1. Since that frequency is determined by the values of #frehi and #frelo, the
  // "pitch" of the noise can be tuned just like the pitch of any of the other waveforms.
  /** @type {number} */
  #lfsr

  // Tracks the previous value of the most significant bit of the oscillator to which this
  // oscillator is synched. If sync is enabled, this oscillator will be forcibly reset each
  // time the synched oscillator's MSB changes.
  /** @type {boolean} */
  #prevMsb = false

  // Tracks the previous value of the 19th bit of the phase accumulator. This bit is used as
  // a clock by the LFSR. Each time this bit transitions high, the LFSR shifts once.
  /** @type {boolean} */
  #lastClock

  // The oscillator to which this oscillator is synched. This is predetermined on the 6581;
  // oscillator 1 is synched to oscillator 3, 2 to 1, and 3 to 2. This value will be set by
  // the Ic6581 code itself after all three oscillators are created, so it should never be
  // `null` during actual operation.
  /** @type {WaveformGenerator} */
  #syncTarget = null

  // Indicates whether the generator is in the process of resetting. This corresponds to the
  // time when the chip's _RES pin is held low. The LFSR acts differently during this time.
  /** @type {boolean} */
  #resetting

  // The value of the SID's frequency registers. This is the number that is added to the
  // accumulator on each clock cycle.
  /** @type {number} */
  #freq

  // The value of the SID's pulse width registers.
  /** @type {number} */
  #pw

  // The value of the TEST bit of the control register, as a boolean. If this is true, the
  // accumulator value will always be 0, 1's will be shifted into the noise LFSR, and the
  // pulse waveform output will be all 1's.
  /** @type {boolean} */
  #test

  // The value of the RING bit of the control register, as a boolean. If this is true, the
  // frequency of the synched oscillator will be used to ring-modulate this oscillator, as
  // long as the triangle waveform is selected.
  /** @type {boolean} */
  #ring

  // The value of the SYNC bit of the control register, as a boolean. If this is true, the
  // accumulator will be reset to 0 each time the MSB of the synched oscillator's
  // accumulator transitions from 0 to 1.
  /** @type {boolean} */
  #sync

  // The top four bits of the control register, which determine the waveform(s) produced.
  // This is stored as a combined number to make selection of multiple waveforms easier.
  /** @type {number} */
  #waveform

  constructor() {
    this.reset()
  }

  reset(value = true) {
    if (value) {
      this.#acc = 0
      this.#lfsr = 0x7ffff8
      this.#lastClock = false

      this.#freq = 0
      this.#pw = 0
      this.#test = false
      this.#ring = false
      this.#sync = false
      this.#waveform = 0

      this.#resetting = false
    } else {
      this.#resetting = true
    }
  }

  // Sets the low 8 bits of the frequency. The Ic6581 object should set this each time the
  // appropriate FRELO register changes.
  set frelo(value) {
    this.#freq = (this.#freq & 0xff00) | (value & 0x00ff)
  }

  // Sets the high 8 bits of the frequency. The Ic6581 object should set this each time the
  // appropriate FREHI register changes.
  set frehi(value) {
    this.#freq = (this.#freq & 0x00ff) | ((value << 8) & 0xff00)
  }

  // Sets the low 8 bits of the pulse width. The Ic6581 object should set this each time the
  // appropriate PWLO register changes.
  set pwlo(value) {
    this.#pw = (this.#pw & 0xf00) | (value & 0x0ff)
  }

  // Sets the high 4 bits of the pulse width. The Ic6581 object should set this each time
  // the appropriate PWHI register changes.
  set pwhi(value) {
    this.#pw = (this.#pw & 0x0ff) | ((value << 8) & 0xf00)
  }

  // Sets the values of the test, ring, and sync bits, along with the waveform. The Ic6581
  // object should set this each time the appropriate VCREG register changes.
  set vcreg(value) {
    this.#test = bitSet(value, TEST)
    this.#ring = bitSet(value, RING)
    this.#sync = bitSet(value, SYNC)
    this.#waveform = (value >> 4) & 0x0f
  }

  // Each clock cycle, the accumulator is advanced one generation and the LFSR is
  // potentially shifted once.
  clock() {
    this.#accumulate()
    this.#shift()
  }

  // Advances the accumulator by adding the word comprised of the values of FREHI and FRELO.
  // This method handles the TEST bit (which sets the output of the oscillator to 0 as long
  // as it is set) and the SYNC bit (which causes the synched oscillator to reset the
  // accumulator when its MSB changes) of the VCREG control register. Any bits beyond the
  // 24 that make up the accumulator are discarded, meaning that when the accumulator
  // overflows, it returns to a value near zero.
  #accumulate() {
    const currMsb = bitSet(this.#syncTarget?.acc, ACC_MSB)
    const reset = this.#test || (this.#sync && currMsb && !this.#prevMsb)
    this.#prevMsb = currMsb

    if (reset) {
      this.#acc = 0
    } else {
      this.#acc += this.#freq
      this.#acc &= 0xffffff
    }
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
  #shift() {
    const clock = bitSet(this.#acc, LFSR_CLOCK)
    if (clock && !this.#lastClock) {
      this.#lfsr <<= 1
      // This is a little weird on the physical 6581 chip.
      //
      // The code here replicates the result by oring three values, written in this order:
      //
      // 1. The xored result of the values of the two taps (at bit positions 17 and 22)
      // 2. An internal signal that is effectively the inverse of the _RES pin
      // 3. The value of the TEST bit of the VCREG register
      //
      // This ensures that the value being fed back into bit 0 of the shift register is
      // always a 1 if either _RES is pulled low or TEST is set high. Otherwise, the value
      // being fed back is the xored values of the bits at the tap positions.
      //
      // An analysis of the silicon of a 6581 suggests that the second tap value is first
      // ored with the inverse of _RES and the value of TEST, and that result is then xored
      // with the first tap value. This would not ensure that only 1's are injected if _RES
      // is held low or TEST is set high, yet only 1's are injected. The mechanism that
      // causes this to happen on the chip is unknown.
      //
      // http://forum.6502.org/viewtopic.php?f=8&t=4150&start=30 near the bottom
      this.#lfsr |=
        this.#resetting |
        this.#test |
        (bitValue(this.#lfsr, LFSR_TAP_1) ^ bitValue(this.#lfsr, LFSR_TAP_2))
      this.#lfsr &= 0x7fffff
    }
    this.#lastClock = clock
  }

  // The top 12 bits of the phase accumulator are directly used as the sawtooth waveform.
  #sawtooth() {
    return (this.#acc >> 12) & 0xfff
  }

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
  #triangle() {
    const msb = bitSet(this.#ring ? this.#acc ^ this.#syncTarget.acc : this.#acc, ACC_MSB)
    return ((msb ? ~this.#acc : this.#acc) >> 11) & 0xfff
  }

  // A pulse waveform is generated by comparing the value of the top 12 bits of the
  // oscillator with the 12 bits from PWHI (top 4 bits are unused) and PWLO. All output bits
  // are then set to 1's or 0's based on that comparison.
  //
  // If the TEST bit of VCREG is set, the pulse waveform generator will output all 1's until
  // TEST is cleared.
  #pulse() {
    return this.#test || ((this.#acc >> 12) & 0xfff) < this.#pw ? 0xfff : 0x000
  }

  // Generates a pseudo-random noise waveform. This takes 8 particular bits from the LFSR
  // and uses them as the top 8 of the 12 produced by the waveform generator (the bottom 4
  // bits are zeros).
  #noise() {
    return (
      (bitValue(this.#lfsr, 0) << 4) |
      (bitValue(this.#lfsr, 2) << 5) |
      (bitValue(this.#lfsr, 5) << 6) |
      (bitValue(this.#lfsr, 9) << 7) |
      (bitValue(this.#lfsr, 11) << 8) |
      (bitValue(this.#lfsr, 14) << 9) |
      (bitValue(this.#lfsr, 18) << 10) |
      (bitValue(this.#lfsr, 20) << 11)
    )
  }

  // Generates the output of the oscillator.
  //
  // A lot of documentation says that if more than one waveform is selected, the output is
  // the bitwise AND of the selected waveforms. This real picture is much more complex; zero
  // bits, for example, can bleed into adjacent one bits and flip them to zero. The
  // mechanism by which this happens is not currently known.
  //
  // This isn't modeled directly as the details aren't known. Instead, for combined
  // waveforms, samples of actual data from the ENV3 register of a physical 6581 are used.
  // These are 4096-entry tables, one for each of the possible output values from the single
  // waveform generators. The result is an 8-bit number that is shifted into a 12-bit
  // number, so the bottom four bits are lost and therefore this is not an exact
  // reproduction. But it's all you can get from the ENV3 register.
  //
  // Noise is handled differently. When noise is combined with any other waveform, the
  // result (after a short time) is always values of 0. It is conjectured that this is
  // because combining noise with another waveform causes the shift register to fill with
  // zeros, meaning the noise waveform itself will be all zeroes. In the real 6581, this
  // actually necessitates a chip reset in order for the shift register to be able to have
  // any non-zero values from then on.
  //
  // There is no model known for this behavior, so this method just returns 0. The original
  // 6581 documentation warned against combining noise with any other waveform, and that
  // warning is repeated here.
  get output() {
    switch (this.#waveform) {
      case 1:
        // Triangle
        return this.#triangle()
      case 2:
        // Sawtooth
        return this.#sawtooth()
      case 3:
        // Triangle + sawtooth
        return stData[this.#sawtooth()] << 4
      case 4:
        // Pulse
        return this.#pulse()
      case 5:
        // Pulse + triangle
        return (ptData[this.#triangle() >> 1] << 4) & this.#pulse()
      case 6:
        // Pulse + sawtooth
        return (psData[this.#sawtooth()] << 4) & this.#pulse()
      case 7:
        // Pulse + sawtooth + triangle
        return (pstData[this.#sawtooth()] << 4) & this.#pulse()
      case 8:
        // Noise
        return this.#noise()
      default:
        // No waveform (0) and all combinations with noise (9+)
        return 0
    }
  }

  /**
   * Returns the current value of the phase accumulator. This is used internally by the
   * oscillator that this one is synched to.
   */
  get acc() {
    return this.#acc
  }

  /**
   * Registers an oscillator as the one to which this oscillator is synched. It is used by
   * the Ic6581 class itself during setup.
   *
   * @param {WaveformGenerator} value The oscillator to which this oscillator should be
   *     synched.
   */
  set sync(value) {
    this.#syncTarget = value
  }
}
