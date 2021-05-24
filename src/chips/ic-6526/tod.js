// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { bitSet, toggleBit, setBit } from 'utils'
import {
  CRB,
  ALARM,
  TOD10TH,
  CRA,
  TODIN,
  TODMIN,
  TODSEC,
  TODHR,
  ICR,
  ALRM,
  IR,
  PM,
} from './constants'

/** @typedef {import('./index').default} Ic6526 */

// -------------------------------------------------------------------
// Time-of-day clock
//
// This is a more human-usable clock than the microsecond timers. It stores parts of the
// current time in four registers, corresponding to hours, minutes, seconds, and tenths of
// seconds. It runs off 60Hz (default, can be set to 50Hz) pulses at the chip's TOD pin.
//
// If the hour is read, then the registers do not update further until the tenths of
// seconds are read (this keeps the time from advancing during the four reads, possibly
// creating reads that can be up to an hour off). The clock does continue running in this
// case, just in the background. If the hour is *written*, then the clock stops running
// entirely until the tenths of seconds are written.
//
// There is an alarm available, and it can be set by writing to the same TOD registers
// with the Alarm bit in Control Register B set. In this implementation the alarm is being
// kept in the latches.

// Adds 1 to a BCD number, accounting for carry. Rolling over the tens digit isn't
// implemented because we never have a number over 59 anyway.
function bcdIncrement(value) {
  let digit0 = (value & 0x0f) + 1
  let digit1 = (value & 0xf0) >> 4

  if (digit0 === 0x0a) {
    digit0 = 0
    digit1 += 1
  }

  return (digit1 << 4) | digit0
}

// Tests a BCD number to see if it's greater than or equal to a decimal number.
function bcdGte(bcd, decimal) {
  return decimal <= (bcd & 0x0f) + 10 * ((bcd & 0xf0) >> 4)
}
export default class TodClock {
  /** @type {Ic6526} */
  #pins

  /** @type {Uint8Array} */
  #registers

  /** @type {Uint8Array} */
  #latches

  // Whether or not the TOD clock is running or updating its registers. Both of these
  // `false` is normal operation; `todLatched` being `true` means that the clock continues
  // to run even though it is not updating its registers as it does so, and `todHalted`
  // being true means the clock is not running at all.
  /** @type {boolean} */
  #latched = false

  /** @type {boolean} */
  #halted = false

  // Internal count of the number of TOD pulses since the last tenth-of-seconds update.
  /** @type {number} */
  #pulseCount = 0

  // Values of the actual running clock. These are necessary because the clock does not
  // always update its registers, so the values need to be kept somewhere. For convenience,
  // these are encoded as 8-bit unsigned numbers representing two BCD digits, the same
  // format used in the registers.
  //
  // Also just as with the registers, bit 7 of `hours` is the AM (0)/PM (1) flag.
  /** @type {number} */
  #tenths = 0

  /** @type {number} */
  #seconds = 0

  /** @type {number} */
  #minutes = 0

  /** @type {number} */
  #hours = 0

  /**
   * @param {Ic6526} pins
   * @param {Uint8Array} registers
   * @param {Uint8Array} latches
   */
  constructor(pins, registers, latches) {
    this.#pins = pins
    this.#registers = registers
    this.#latches = latches

    pins.TOD.addListener(pin => {
      if (pin.high && !this.#halted) {
        this.#pulseCount += 1
        // runs if 1/10 second has elapsed, counting pulses for that time at either 50Hz or
        // 60Hz
        if (this.#pulseCount === (bitSet(registers[CRA], TODIN) ? 5 : 6)) {
          this.#pulseCount = 0
          this.#incrementTenths()
          if (!this.#latched) {
            // Update registers with the new time
            registers[TOD10TH] = this.#tenths
            registers[TODSEC] = this.#seconds
            registers[TODMIN] = this.#minutes
            registers[TODHR] = this.#hours
          }
          // If time === alarm, fire an interrupt if it's enabled in the ICR
          if (
            this.#tenths === latches[TOD10TH] &&
            this.#seconds === latches[TODSEC] &&
            this.#minutes === latches[TODMIN] &&
            this.#hours === latches[TODHR]
          ) {
            registers[ICR] = setBit(registers[ICR], ALRM)
            if (bitSet(latches[ICR], ALRM)) {
              registers[ICR] = setBit(registers[ICR], IR)
              pins._IRQ.clear()
            }
          }
        }
      }
    })
  }

  #incrementTenths() {
    this.#tenths = bcdIncrement(this.#tenths)
    if (bcdGte(this.#tenths, 10)) {
      this.#tenths = 0
      this.#incrementSeconds()
    }
  }

  #incrementSeconds() {
    this.#seconds = bcdIncrement(this.#seconds)
    if (bcdGte(this.#seconds, 60)) {
      this.#seconds = 0
      this.#incrementMinutes()
    }
  }

  #incrementMinutes() {
    this.#minutes = bcdIncrement(this.#minutes)
    if (bcdGte(this.#minutes, 60)) {
      this.#minutes = 0
      this.#incrementHours()
    }
  }

  #incrementHours() {
    const pmMask = 1 << PM

    this.#hours = bcdIncrement(this.#hours)
    if ((this.#hours & ~pmMask) === 0x12) {
      this.#hours = toggleBit(this.#hours, PM)
    } else if (bcdGte(this.#hours & ~pmMask, 13)) {
      this.#hours = (this.#hours & pmMask) | 1
    }
  }

  reset() {
    this.#latched = false
    this.#halted = false

    this.#pulseCount = 0

    this.#tenths = 0
    this.#seconds = 0
    this.#minutes = 0
    this.#hours = 0
  }

  writeTenths(value) {
    const masked = value & 0x0f
    if (bitSet(this.#registers[CRB], ALARM)) {
      this.#latches[TOD10TH] = masked
    } else {
      this.#registers[TOD10TH] = masked
      this.#tenths = masked
      this.#halted = false
    }
  }

  readTenths() {
    if (this.#latched) {
      this.#latched = false
      this.#registers[TOD10TH] = this.#tenths
      this.#registers[TODSEC] = this.#seconds
      this.#registers[TODMIN] = this.#minutes
      this.#registers[TODHR] = this.#hours
    }
    return this.#registers[TOD10TH]
  }

  writeSeconds(value) {
    const masked = value & 0x7f
    if (bitSet(this.#registers[CRB], ALARM)) {
      this.#latches[TODSEC] = masked
    } else {
      this.#registers[TODSEC] = masked
      this.#seconds = masked
    }
  }

  writeMinutes(value) {
    const masked = value & 0x7f
    if (bitSet(this.#registers[CRB], ALARM)) {
      this.#latches[TODMIN] = masked
    } else {
      this.#registers[TODMIN] = masked
      this.#minutes = masked
    }
  }

  writeHours(value) {
    const masked = value & 0x9f
    if (bitSet(this.#registers[CRB], ALARM)) {
      this.#latches[TODHR] = masked
    } else {
      this.#registers[TODHR] = masked
      this.#hours = masked
      this.#halted = true
    }
  }

  readHours() {
    this.#latched = true
    return this.#registers[TODHR]
  }
}
