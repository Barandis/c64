// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { bitSet, toggleBit, setBit } from "utils"
import {
  CIACRB,
  CRB_ALRM,
  TODTEN,
  CIACRA,
  CRA_TOD,
  TODMIN,
  TODSEC,
  TODHRS,
  CIAICR,
  ICR_ALRM,
  ICR_IR,
} from "./constants"

export function tod(chip, registers, latches) {
  // -----------------------------------------------------------------------------------------------
  // Time-of-day clock
  //
  // This is a more human-usable clock than the microsecond timers. It stores parts of the current
  // time in four registers, corresponding to hours, minutes, seconds, and tenths of seconds. It
  // runs off 60Hz (default, can be set to 50Hz) pulses at the chip's TOD pin.
  //
  // If the hour is read, then the registers do not update further until the tenths of seconds are
  // read (this keeps the time from advancing during the four reads, possibly creating reads that
  // can be up to an hour off). The clock does continue running in this case, just in the
  // background. If the hour is *written*, then the clock stops running entirely until the tenths of
  // seconds are written.
  //
  // There is an alarm available, and it can be set by writing to the same TOD registers with the
  // Alarm bit in Control Register B set. In this implementation the alarm is being kept in the
  // latches.

  // Whether or not the TOD clock is running or updating its registers. Both of these `false` is
  // normal operation; `todLatched` being `true` means that the clock continues to run even though
  // it is not updating its registers as it does so, and `todHalted` being true means the clock is
  // not running at all.
  let todLatched = false
  let todHalted = false

  // Internal count of the number of TOD pulses since the last tenth-of-seconds update.
  let pulseCount = 0

  // Values of the actual running clock. These are necessary because the clock does not always
  // update its registers, so the values need to be kept somewhere. For convenience, these are
  // encoded as 8-bit unsigned numbers representing two BCD digits, the same format used in the
  // registers.
  //
  // Also just as with the registers, bit 7 of `hours` is the AM (0)/PM (1) flag.
  let tenths = 0
  let seconds = 0
  let minutes = 0
  let hours = 0

  chip.TOD.addListener(pin => {
    if (pin.high && !todHalted) {
      pulseCount++
      // runs if 1/10 second has elapsed, counting pulses for that time at either 50Hz or 60Hz
      if (pulseCount === bitSet(registers[CIACRA], CRA_TOD) ? 5 : 6) {
        pulseCount = 0
        incrementTenths()
        if (!todLatched) {
          // Update registers with the new time
          registers[TODTEN] = tenths
          registers[TODSEC] = seconds
          registers[TODMIN] = minutes
          registers[TODHRS] = hours
        }
        // If time === alarm, fire an interrupt if it's enabled in the ICR
        setBit(registers[CIAICR], ICR_ALRM)
        if (
          tenths === latches[TODTEN] &&
          seconds === latches[TODSEC] &&
          minutes === latches[TODMIN] &&
          hours === latches[TODHRS] &&
          bitSet(latches[CIAICR], ICR_ALRM)
        ) {
          setBit(registers[CIAICR], ICR_IR)
          chip._IRQ.lower()
        }
      }
    }
  })

  function incrementTenths() {
    tenths = bcdIncrement(tenths)
    if (bcdGte(tenths, 10)) {
      tenths = 0
      incrementSeconds()
    }
  }

  function incrementSeconds() {
    seconds = bcdIncrement(seconds)
    if (bcdGte(seconds, 60)) {
      seconds = 0
      incrementMinutes()
    }
  }

  function incrementMinutes() {
    minutes = bcdIncrement(minutes)
    if (bcdGte(minutes, 60)) {
      minutes = 0
      incrementHours()
    }
  }

  function incrementHours() {
    hours = bcdIncrement(hours)
    if (bcdGte(hours & 0x7f, 13)) {
      hours = (hours & 0x80) | 1
      toggleBit(hours, 7)
    }
  }

  // Adds 1 to a BCD number, accounting for carry. Rolls over to 0 if the prior value was 99.
  function bcdIncrement(value) {
    let digit0 = (value & 0x0f) + 1
    let digit1 = (value & 0xf0) >> 4

    if (digit0 === 10) {
      digit0 = 0
      digit1++
      if (digit1 === 10) {
        digit1 = 0
      }
    }

    return (digit1 << 4) | digit0
  }

  // Tests a BCD number to see if it's greater than or equal to a decimal number.
  function bcdGte(bcd, decimal) {
    return decimal <= (bcd & 0x0f) + 10 * ((bcd & 0xf0) >> 4)
  }

  function writeTenths(value) {
    const masked = value & 0x0f
    if (bitSet(registers[CIACRB], CRB_ALRM)) {
      latches[TODTEN] = masked
    } else {
      registers[TODTEN] = masked
      tenths = masked
      todHalted = false
    }
  }

  function readTenths() {
    todLatched = false
    return registers[TODTEN]
  }

  function writeSeconds(value) {
    const masked = value & 0x7f
    if (bitSet(registers[CIACRB], CRB_ALRM)) {
      latches[TODSEC] = masked
    } else {
      registers[TODSEC] = masked
      seconds = masked
    }
  }

  function writeMinutes(value) {
    const masked = value & 0x0f
    if (bitSet(registers[CIACRB], CRB_ALRM)) {
      latches[TODMIN] = masked
    } else {
      registers[TODMIN] = masked
      minutes = masked
    }
  }

  function writeHours(value) {
    const masked = value & 0x9f
    if (bitSet(registers[CIACRB], CRB_ALRM)) {
      latches[TODHRS] = masked
    } else {
      registers[TODHRS] = masked
      hours = masked
      todHalted = true
    }
  }

  function readHours() {
    todLatched = true
    return registers[TODHRS]
  }

  return { readTenths, readHours, writeTenths, writeSeconds, writeMinutes, writeHours }
}
