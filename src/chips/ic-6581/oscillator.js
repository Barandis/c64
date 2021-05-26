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

import { bitSet, word, bitValue } from 'utils'
import { TEST, SYNC, RING, SAWTOOTH, TRIANGLE, NOISE, PULSE } from './constants'

/** @typedef {import('./index').default} Ic6581 */

// The position of the most significant bit of the accumulator. The SID uses a 23-bit
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

export default class Oscillator {
  // The Ic6581 object itself, though it's used only for access to its pins.
  /** @type {Ic6581} */
  #pins

  // A function used to read any of the registers of the chip. This is necessary because
  // there is some special behavior when trying to read a write-only register, and we ensure
  // that gets (sorta) emulated.
  /** @type {function(number):number} */
  #readRegister

  // The actual address of the FRELO register for this oscillator. This is derived
  // from the base address for the oscillator, allowing multiple oscillators to use different
  // registers.
  /** @type {number} */
  #FRELO

  // The actual address of the FREHI register for this oscillator. This is derived
  // from the base address for the oscillator, allowing multiple oscillators to use different
  // registers.
  /** @type {number} */
  #FREHI

  // The actual address of the PWLO register for this oscillator. This is derived
  // from the base address for the oscillator, allowing multiple oscillators to use different
  // registers.
  /** @type {number} */
  #PWLO

  // The actual address of the PWHI register for this oscillator. This is derived
  // from the base address for the oscillator, allowing multiple oscillators to use different
  // registers.
  /** @type {number} */
  #PWHI

  // The actual address of the VCREG register for this oscillator. This is derived
  // from the base address for the oscillator, allowing multiple oscillators to use different
  // registers.
  /** @type {number} */
  #VCREG

  // The current value of the phase accumulator used to determine the oscillator output.
  /** @type {number} */
  #acc = 0

  // The current value of the linear feedback shift register used to produce pseudo-random
  // noise.
  /** @type {number} */
  #lfsr = 0x13579b

  // Tracks the previous value of the most significant bit of the oscillator to which this
  // oscillator is synched. If sync is enabled, this oscillator will be forcibly reset each
  // time the synched oscillator's MSB changes.
  #prevMsb = false

  // Tracks the previous value of the 19th bit of the phase accumulator. This bit is used as
  // a clock by the LFSR. Each time this bit changes, the LFSR shifts once.
  #lastClock = false

  // The oscillator to which this oscillator is synched. This is predetermined on the 6581;
  // oscillator 1 is synched to oscillator 3, 2 to 1, and 3 to 2. This value will be set by
  // the Ic6581 code itself after all three oscillators are created, so it should never be
  // `null` during actual operation.
  #syncOsc = null

  /**
   * @param {Ic6581} pins
   * @param {number} base
   * @param {function(number):number} readRegister
   */
  constructor(pins, base, readRegister) {
    this.#FRELO = base
    this.#FREHI = base + 1
    this.#PWLO = base + 2
    this.#PWHI = base + 3
    this.#VCREG = base + 4

    this.#pins = pins
    this.#readRegister = readRegister

    // Each clock cycle, the accumulator is advanced one generation and the LFSR is
    // potentially shifted once.
    pins.φ2.addListener(pin => {
      if (pin.high) {
        this.#accumulate()
        this.#shift()
      }
    })
  }

  // Returns the top 12 bits of the 23-bit phase accumulator. These 12 bits are all that are
  // actually used for waveform generation.
  #top12() {
    return (this.#acc >> 12) & 0xfff
  }

  // Advances the accumulator by adding the word comprised of the values of FREHI and FRELO.
  // This method handles the TEST bit (which sets the output of the oscillator to 0 as long
  // as it is set) and the SYNC bit (which causes the synched oscillator to reset the
  // accumulator when its MSB changes) of the VCREG control register. Any bits beyond the
  // 23 that make up the accumulator are discarded, meaning that when the accumulator
  // overflows, it returns to a value near zero.
  #accumulate() {
    const ctrl = this.#readRegister(this.#VCREG)
    const test = bitSet(ctrl, TEST)
    const sync = bitSet(ctrl, SYNC)
    const currMsb = bitSet(this.#syncOsc?.acc, ACC_MSB)
    const reset = test || (sync && currMsb && !this.#prevMsb)
    this.#prevMsb = currMsb

    if (reset) {
      this.#acc = 0
    } else {
      const term = word(this.#readRegister(this.#FRELO), this.#readRegister(this.#FREHI))
      this.#acc += term
      this.#acc &= 0xffffff
    }
  }

  // Potentially advances the pseudo-random noise shift register one generation. This shift
  // only occurs if bit 19 of the phase accumulator has changed value since the last time
  // this method was called, meaning that bit 19 of the PA acts as the LFSR's clock.
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
        (bitValue(this.#lfsr, LFSR_TAP_1) ^ bitValue(this.#lfsr, LFSR_TAP_2)) |
        this.#pins._RES.low |
        bitSet(this.#VCREG, TEST)
      this.#lfsr &= 0x7fffff
    }
    this.#lastClock = clock
  }

  // The top 12 bits of the phase accumulator are directly used as the sawtooth waveform.
  #sawtooth() {
    return this.#top12()
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
    const ring = bitSet(this.#readRegister(this.#VCREG), RING)
    const msb = bitSet(this.#acc, ACC_MSB)
    const syncMsb = bitSet(this.#syncOsc?.acc, ACC_MSB)
    // logical (not bitwise) XOR of (!syncMsb & ring) and msb
    const xor = (!syncMsb && ring ? !msb : msb) ? 0x7ff : 0x000

    return ((this.#top12() & 0x7ff) ^ xor) << 1
  }

  // A pulse waveform is generated by comparing the value of the top 12 bits of the
  // oscillator with the 12 bits from PWHI (top 4 bits are unused) and PWLO. All output bits
  // are then set to 1's or 0's based on that comparison.
  //
  // If the TEST bit of VCREG is set, the pulse waveform generator will output all 1's until
  // TEST is cleared.
  #pulse() {
    const test = bitSet(this.#readRegister(this.#VCREG), TEST)
    const pulseWidth = word(this.#readRegister(this.#PWLO), this.#readRegister(this.#PWHI))
    return test || this.#top12() < pulseWidth ? 0xfff : 0x000
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

  // Generates the output of the oscillator. This simply bitwise-ands the current values of
  // the enabled waveform generators.
  #output() {
    const saw = bitSet(this.#readRegister(this.#VCREG), SAWTOOTH) ? this.#sawtooth() : 0xfff
    const tri = bitSet(this.#readRegister(this.#VCREG), TRIANGLE) ? this.#triangle() : 0xfff
    const pul = bitSet(this.#readRegister(this.#VCREG), PULSE) ? this.#pulse() : 0xfff
    const noi = bitSet(this.#readRegister(this.#VCREG), NOISE) ? this.#noise() : 0xfff

    return saw & tri & pul & noi
  }

  /**
   * Returns the current value of the oscillator output.
   */
  read() {
    return this.#output()
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
   * @param {Oscillator} wg The oscillator to which this oscillator should be synched.
   * @returns {Oscillator} This oscillator, for chaining.
   */
  sync(wg) {
    this.#syncOsc = wg
    return this
  }
}
