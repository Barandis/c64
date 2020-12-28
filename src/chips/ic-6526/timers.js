// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  CRA, CRB, START, INMODE, INMODE0, INMODE1, PBON, OUTMODE, TALO, TAHI, TBLO,
  TBHI, ICR, TA, RUNMODE, TB, SPMODE, SDR, SP, IR,
} from './constants'

import { bitSet, bitClear, setBit, clearBit } from 'utils'

export function timers(chip, registers, latches) {
  // -------------------------------------------------------------------
  // Timers
  //
  // Timers decrement their registers on each source event until they
  // reach zero, when they have the option of presenting an output on
  // one of the PB pins, firing an interrupt, or both. The two timers
  // are quite similar, only differing in the pin on which they present
  // their output and in that Timer B has the option of using Timer A
  // completions as a counting source.
  //
  // The timer values are always available for reading from the
  // appropriate register. If these registers are written to, the
  // contents of the register don't actually change; the value gets
  // latched and becomes the new value that the timer resets itself to
  // after completion.

  chip.φ2.addListener(pin => {
    if (pin.high) {
      const cra = registers[CRA]
      const crb = registers[CRB]

      // Reset PB6 if on and output mode = pulse
      if (bitSet(cra, PBON) && bitClear(cra, OUTMODE)) {
        chip.PB6.clear()
      }
      // Reset PB7 if on and output mode = pulse
      if (bitSet(crb, PBON) && bitClear(crb, OUTMODE)) {
        chip.PB7.clear()
      }

      // Decrement Timer A if its input is clock pulses and timer is
      // started
      if (bitSet(cra, START) && bitClear(cra, INMODE)) {
        decrementTimerA()
      }
      // Decrement Timer B if its input is clock pulses and timer is
      // started
      if (bitSet(crb, START)
          && bitClear(crb, INMODE0)
          && bitClear(crb, INMODE1)) {
        decrementTimerB()
      }
    }
  })

  chip.CNT.addListener(pin => {
    if (pin.high) {
      const cra = registers[CRA]
      const crb = registers[CRB]

      // Decrement Timer A if its input is CNT pulses
      if (bitSet(cra, START) && bitSet(cra, INMODE)) {
        decrementTimerA()
      }
      // Decrement Timer B if its input is CNT pulses
      if (bitSet(crb, START)
          && bitSet(crb, INMODE0)
          && bitClear(crb, INMODE1)) {
        decrementTimerB()
      }
    }
  })

  function decrementTimerA() {
    registers[TALO]--
    if (registers[TALO] === 0 && registers[TAHI] === 0) {
      underflowTimerA()
    } else if (registers[TALO] === 255) {
      registers[TAHI]--
    }
  }

  function decrementTimerB() {
    registers[TBLO]--
    if (registers[TBLO] === 0 && registers[TBHI] === 0) {
      underflowTimerB()
    } else if (registers[TBLO] === 255) {
      registers[TBHI]--
    }
  }

  function underflowTimerA() {
    const cra = registers[CRA]
    const crb = registers[CRB]

    // Set PB6 to appropriate level if on
    if (bitSet(cra, PBON)) {
      if (bitSet(cra, OUTMODE)) {
        chip.PB6.toggle()
      } else {
        chip.PB6.set()
      }
    }

    // Decrement Timer B if CRB says so
    if (bitSet(crb, INMODE1)) {
      if (bitSet(crb, INMODE0) ? chip.CNT.high : true) {
        decrementTimerB()
      }
    }

    // Potentially send a bit out the serial port if it is set to output
    // mode and if the timer is set to run continuously
    if (bitSet(cra, SPMODE) && bitClear(cra, RUNMODE)) {
      handleSpOut()
    }

    // Set the ICR bit, and fire interrupt if the ICR says so
    registers[ICR] = setBit(registers[ICR], TA)
    if (bitSet(latches[ICR], TA)) {
      registers[ICR] = setBit(registers[ICR], IR)
      chip._IRQ.clear()
    }

    // Reset value to that in latch
    registers[TALO] = latches[TALO]
    registers[TAHI] = latches[TAHI]

    // Clear start bit if in one-shot mode
    if (bitSet(cra, RUNMODE)) {
      registers[CRA] = clearBit(registers[CRA], START)
    }
  }

  function underflowTimerB() {
    const crb = registers[CRB]

    // Set PB7 to appropriate value if on
    if (bitSet(crb, PBON)) {
      if (bitSet(crb, OUTMODE)) {
        chip.PB7.toggle()
      } else {
        chip.PB7.set()
      }
    }

    // Set the interrupt bit, and fire interrupt if the ICR says so
    registers[ICR] = setBit(registers[ICR], TB)
    if (bitSet(latches[ICR], TB)) {
      registers[ICR] = setBit(registers[ICR], IR)
      chip._IRQ.clear()
    }

    // Reset value to that in latch
    registers[TBLO] = latches[TBLO]
    registers[TBHI] = latches[TBHI]

    // Clear start bit if in one-shot mode
    if (bitSet(crb, RUNMODE)) {
      registers[CRB] = clearBit(registers[CRB], START)
    }
  }

  // -------------------------------------------------------------------
  // Serial port
  //
  // If the port is set to input, a bit is read into the shift register
  // (MSB first) each time the CNT pin transitions high from an outside
  // source. Once 8 bits have been read, the contents of the shift
  // register are dumped into the Serial Data Register and an interrupt
  // is fired off.
  //
  // If the port is set to output, the clock used will be Timer A. Every
  // *other* time it underflows (the data rate out is half the Timer A
  // underflow rate), the next bit (MSB first) will be put onto the SP
  // pin and the CNT pin will go high. Once all 8 bits have been sent,
  // an interrupt fires and, if new data had already been loaded into
  // the SDR, the process will immediately repeat.
  //
  // The code for the serial port appears here because output is
  // dependent upon the timers located here as well.

  // The shift register from which the value is sent out over the SP pin
  // bit-by-bit. This is the value in the shift register (`shift`) and
  // the last bit to have been sent out (`bit`).
  let shift = 0
  let bit = 0

  // Flag to tell whether to skip transmission on the next undeflow.
  // This happens every other underflow (the send rate is defined to be
  // half the underflow rate). If an undeflow is skipped, the CNT pin
  // will be cleared instead.
  let skip = false

  // Indicates whether transmission is finshed. This happens if the
  // shift register has all 8 bits sent out and there is not a new 8
  // bits waiting in the SDR to be sent out.
  let done = true

  // Flag to indicate whether the value in the SDR is waiting to be sent
  // out the serial port.
  let ready = false

  chip.CNT.addListener(pin => {
    // Only do anything if CNT is transitioning high and the serial port
    // is set to input
    if (pin.high && bitClear(registers[CRA], SPMODE)) {
      if (bit === 0) {
        bit = 8
      }
      bit--
      if (chip.SP.high) {
        shift = setBit(shift, bit)
      }
      // If the last bit of the byte has been read, push the byte to the
      // SP register and, if the ICR says so, fire off an IRQ
      if (bit === 0) {
        registers[SDR] = shift
        shift = 0
        registers[ICR] = setBit(registers[ICR], SP)
        if (bitSet(latches[ICR], SP)) {
          registers[ICR] = setBit(registers[ICR], IR)
          chip._IRQ.clear()
        }
      }
    }
  })

  function handleSpOut() {
    if (!done) {
      if (skip) {
        // On skipped underflows, CNT is cleared in preparation for
        // setting it on the next underflow when data goes out the SP
        // pin.
        chip.CNT.clear()
      } else {
        if (bit === 0) {
          bit = 8
        }
        bit--
        // Put the next bit of the shift register on the SP pin and set
        // the CNT pin to indicate that new data is available
        chip.SP.level = bitSet(shift, bit)
        chip.CNT.set()

        // When the shift register has been completely transmitted:
        if (bit === 0) {
          if (ready) {
            // If there is a new value ready to be loaded into the shift
            // register, do it
            ready = false
            shift = registers[SDR]
          } else {
            // Otherwise clear the shift register and record that there
            // is nothing new to send
            done = true
            shift = 0
          }

          // Set the interrupt bit and then fire off an interrupt if the
          // ICR says to
          registers[ICR] = setBit(registers[ICR], SP)
          if (bitSet(latches[ICR], SP)) {
            registers[ICR] = setBit(registers[ICR], IR)
            chip._IRQ.clear()
          }
        }
      }
      skip = !skip
    }
  }

  function writeSdr(value) {
    registers[SDR] = value
    // If the serial port is configured to send (i.e., if it's set to
    // output mode and if Timer A is set to continuous mode)
    if (bitSet(registers[CRA], SPMODE)
        && bitClear(registers[CRA], RUNMODE)) {
      if (done) {
        done = false
        shift = value
      } else {
        ready = true
      }
    }
  }

  return { writeSdr }
}
