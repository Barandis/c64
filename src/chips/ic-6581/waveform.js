// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { TEST, SYNC, RING, SAWTOOTH, TRIANGLE, NOISE, PULSE } from './constants'

import { bitSet, word, bitValue } from 'utils'

const ACC_MSB = 23
const LFSR_CLOCK = 19
const LFSR_TAP_1 = 17
const LFSR_TAP_2 = 22

export function WaveformGenerator(chip, base, readRegister) {
  const FRELO = base
  const FREHI = base + 1
  const PWLO = base + 2
  const PWHI = base + 3
  const VCREG = base + 4

  let acc = 0
  let lfsr = 0x13579b
  let prevMsb = false
  let lastClock = false

  let syncOsc = null

  function top12() {
    return acc >> 12 & 0xfff
  }

  function accumulate(pin) {
    if (pin.high) {
      const ctrl = readRegister(VCREG)
      const test = bitSet(ctrl, TEST)
      const sync = bitSet(ctrl, SYNC)
      const currMsb = bitSet(syncOsc.acc, ACC_MSB)
      const reset = test || sync && currMsb && !prevMsb
      prevMsb = currMsb

      if (reset) {
        acc = 0
      } else {
        const term = word(readRegister(FRELO), readRegister(FREHI))
        acc += term
        acc &= 0xffffff
      }
    }
  }

  function shift(pin) {
    if (pin.high) {
      const clock = bitSet(acc, LFSR_CLOCK)
      if (clock && !lastClock) {
        const reset = !chip._RES
        const test = bitSet(VCREG, TEST)

        lfsr <<= 1
        lfsr |= bitValue(lfsr, LFSR_TAP_1)
            ^ (reset | test | bitValue(lfsr, LFSR_TAP_2))
        lfsr &= 0x7fffff
      }
      lastClock = clock
    }
  }

  chip.φ2.addListener(pin => {
    accumulate(pin)
    shift(pin)
  })

  function sawtooth() {
    return top12()
  }

  function triangle() {
    const ring = bitSet(readRegister(VCREG), RING)
    const msb = bitSet(acc, ACC_MSB)
    const syncMsb = bitSet(syncOsc.acc, ACC_MSB)
    // logical XOR of (!syncMsb & ring) and msb
    const xor = (!syncMsb && ring ? !msb : msb) ? 0x7ff : 0x000

    return (top12() & 0x7ff ^ xor) << 1
  }

  function pulse() {
    const test = bitSet(readRegister(VCREG), TEST)
    const pulseWidth = word(readRegister(PWLO), readRegister(PWHI))
    return test || top12() < pulseWidth ? 0xfff : 0x000
  }

  function noise() {
    return bitValue(lfsr, 0) << 4
         | bitValue(lfsr, 2) << 5
         | bitValue(lfsr, 5) << 6
         | bitValue(lfsr, 9) << 7
         | bitValue(lfsr, 11) << 8
         | bitValue(lfsr, 14) << 9
         | bitValue(lfsr, 18) << 10
         | bitValue(lfsr, 20) << 11
  }

  function output() {
    const saw = bitSet(readRegister(VCREG), SAWTOOTH) ? sawtooth() : 0xfff
    const tri = bitSet(readRegister(VCREG), TRIANGLE) ? triangle() : 0xfff
    const pul = bitSet(readRegister(VCREG), PULSE) ? pulse() : 0xfff
    const noi = bitSet(readRegister(VCREG), NOISE) ? noise() : 0xfff

    return saw & tri & pul & noi
  }

  return {
    get acc() {
      return acc
    },

    get value() {
      return output()
    },

    sync(wg) {
      syncOsc = wg
      return this
    },
  }
}
