// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { bitSet, bitClear, setBit, clearBit } from 'utils'
import {
  START,
  INMODE,
  INMODE0,
  INMODE1,
  PBON,
  OUTMODE,
  TA,
  RUNMODE,
  TB,
  SPMODE,
  SP,
  IR,
} from './constants'

/** @typedef {import('./index').default} Ic6526 */
/** @typedef {import('components/registers').default} Registers */

export default class Timers {
  /** @type {Ic6526} */
  #pins

  /** @type {Registers} */
  #registers

  /** @type {Registers} */
  #latches

  // The shift register from which the value is sent out over the SP pin bit-by-bit. This is
  // the value in the shift register (`shift`) and the last bit to have been sent out
  // (`bit`).
  /** @type {number} */
  #shift = 0

  /** @type {number} */
  #bit = 0

  // Flag to tell whether to skip transmission on the next undeflow. This happens every
  // other underflow (the send rate is defined to be half the underflow rate). If an
  // undeflow is skipped, the CNT pin will be cleared instead.
  /** @type {boolean} */
  #skip = false

  // Indicates whether transmission is finshed. This happens if the shift register has all 8
  // bits sent out and there is not a new 8 bits waiting in the SDR to be sent out.
  /** @type {boolean} */
  #done = true

  // Flag to indicate whether the value in the SDR is waiting to be sent out the serial
  // port.
  /** @type {boolean} */
  #ready = false

  constructor(pins, registers, latches) {
    this.#pins = pins
    this.#registers = registers
    this.#latches = latches

    // -------------------------------------------------------------------
    // Timers
    //
    // Timers decrement their registers on each source event until they reach zero, when they
    // have the option of presenting an output on one of the PB pins, firing an interrupt, or
    // both. The two timers are quite similar, only differing in the pin on which they present
    // their output and in that Timer B has the option of using Timer A completions as a
    // counting source.
    //
    // The timer values are always available for reading from the appropriate register. If
    // these registers are written to, the contents of the register don't actually change; the
    // value gets latched and becomes the new value that the timer resets itself to after
    // completion.

    pins.φ2.addListener(pin => {
      if (pin.high) {
        const cra = registers.CRA
        const crb = registers.CRB

        // Reset PB6 if on and output mode = pulse
        if (bitSet(cra, PBON) && bitClear(cra, OUTMODE)) {
          pins.PB6.clear()
        }
        // Reset PB7 if on and output mode = pulse
        if (bitSet(crb, PBON) && bitClear(crb, OUTMODE)) {
          pins.PB7.clear()
        }

        // Decrement Timer A if its input is clock pulses and timer is started
        if (bitSet(cra, START) && bitClear(cra, INMODE)) {
          this.#decrementTimerA()
        }
        // Decrement Timer B if its input is clock pulses and timer is started
        if (bitSet(crb, START) && bitClear(crb, INMODE0) && bitClear(crb, INMODE1)) {
          this.#decrementTimerB()
        }
      }
    })

    pins.CNT.addListener(pin => {
      if (pin.high) {
        const cra = registers.CRA
        const crb = registers.CRB

        // Decrement Timer A if its input is CNT pulses
        if (bitSet(cra, START) && bitSet(cra, INMODE)) {
          this.#decrementTimerA()
        }
        // Decrement Timer B if its input is CNT pulses
        if (bitSet(crb, START) && bitSet(crb, INMODE0) && bitClear(crb, INMODE1)) {
          this.#decrementTimerB()
        }
      }
    })

    // -------------------------------------------------------------------
    // Serial port
    //
    // If the port is set to input, a bit is read into the shift register (MSB first) each
    // time the CNT pin transitions high from an outside source. Once 8 bits have been read,
    // the contents of the shift register are dumped into the Serial Data Register and an
    // interrupt is fired off.
    //
    // If the port is set to output, the clock used will be Timer A. Every *other* time it
    // underflows (the data rate out is half the Timer A underflow rate), the next bit (MSB
    // first) will be put onto the SP pin and the CNT pin will go high. Once all 8 bits have
    // been sent, an interrupt fires and, if new data had already been loaded into the SDR,
    // the process will immediately repeat.
    //
    // The code for the serial port appears here because output is dependent upon the timers
    // located here as well.

    pins.CNT.addListener(pin => {
      // Only do anything if CNT is transitioning high and the serial port is set to input
      if (pin.high && bitClear(registers.CRA, SPMODE)) {
        if (this.#bit === 0) {
          this.#bit = 8
        }
        this.#bit -= 1
        if (pins.SP.high) {
          this.#shift = setBit(this.#shift, this.#bit)
        }
        // If the last bit of the byte has been read, push the byte to the SP register and, if
        // the ICR says so, fire off an IRQ
        if (this.#bit === 0) {
          registers.SDR = this.#shift
          this.#shift = 0
          registers.ICR = setBit(registers.ICR, SP)
          if (bitSet(latches.ICR, SP)) {
            registers.ICR = setBit(registers.ICR, IR)
            pins._IRQ.clear()
          }
        }
      }
    })
  }

  #underflowTimerA() {
    const cra = this.#registers.CRA
    const crb = this.#registers.CRB

    // Set PB6 to appropriate level if on
    if (bitSet(cra, PBON)) {
      if (bitSet(cra, OUTMODE)) {
        this.#pins.PB6.toggle()
      } else {
        this.#pins.PB6.set()
      }
    }

    // Decrement Timer B if CRB says so
    if (bitSet(crb, INMODE1)) {
      if (bitSet(crb, INMODE0) ? this.#pins.CNT.high : true) {
        this.#decrementTimerB()
      }
    }

    // Potentially send a bit out the serial port if it is set to output mode and if the
    // timer is set to run continuously
    if (bitSet(cra, SPMODE) && bitClear(cra, RUNMODE)) {
      this.#handleSpOut()
    }

    // Set the ICR bit, and fire interrupt if the ICR says so
    this.#registers.ICR = setBit(this.#registers.ICR, TA)
    if (bitSet(this.#latches.ICR, TA)) {
      this.#registers.ICR = setBit(this.#registers.ICR, IR)
      this.#pins._IRQ.clear()
    }

    // Reset value to that in latch
    this.#registers.TALO = this.#latches.TALO
    this.#registers.TAHI = this.#latches.TAHI

    // Clear start bit if in one-shot mode
    if (bitSet(cra, RUNMODE)) {
      this.#registers.CRA = clearBit(this.#registers.CRA, START)
    }
  }

  #underflowTimerB() {
    const crb = this.#registers.CRB

    // Set PB7 to appropriate value if on
    if (bitSet(crb, PBON)) {
      if (bitSet(crb, OUTMODE)) {
        this.#pins.PB7.toggle()
      } else {
        this.#pins.PB7.set()
      }
    }

    // Set the interrupt bit, and fire interrupt if the ICR says so
    this.#registers.ICR = setBit(this.#registers.ICR, TB)
    if (bitSet(this.#latches.ICR, TB)) {
      this.#registers.ICR = setBit(this.#registers.ICR, IR)
      this.#pins._IRQ.clear()
    }

    // Reset value to that in latch
    this.#registers.TBLO = this.#latches.TBLO
    this.#registers.TBHI = this.#latches.TBHI

    // Clear start bit if in one-shot mode
    if (bitSet(crb, RUNMODE)) {
      this.#registers.CRB = clearBit(this.#registers.CRB, START)
    }
  }

  #decrementTimerA() {
    this.#registers.TALO -= 1
    if (this.#registers.TALO === 0 && this.#registers.TAHI === 0) {
      this.#underflowTimerA()
    } else if (this.#registers.TALO === 255) {
      this.#registers.TAHI -= 1
    }
  }

  #decrementTimerB() {
    this.#registers.TBLO -= 1
    if (this.#registers.TBLO === 0 && this.#registers.TBHI === 0) {
      this.#underflowTimerB()
    } else if (this.#registers.TBLO === 255) {
      this.#registers.TBHI -= 1
    }
  }

  #handleSpOut() {
    if (!this.#done) {
      if (this.#skip) {
        // On skipped underflows, CNT is cleared in preparation for setting it on the next
        // underflow when data goes out the SP pin.
        this.#pins.CNT.clear()
      } else {
        if (this.#bit === 0) {
          this.#bit = 8
        }
        this.#bit -= 1
        // Put the next bit of the shift register on the SP pin and set the CNT pin to
        // indicate that new data is available
        this.#pins.SP.level = bitSet(this.#shift, this.#bit)
        this.#pins.CNT.set()

        // When the shift register has been completely transmitted:
        if (this.#bit === 0) {
          if (this.#ready) {
            // If there is a new value ready to be loaded into the shift register, do it
            this.#ready = false
            this.#shift = this.#registers.SDR
          } else {
            // Otherwise clear the shift register and record that there is nothing new to
            // send
            this.#done = true
            this.#shift = 0
          }

          // Set the interrupt bit and then fire off an interrupt if the ICR says to
          this.#registers.ICR = setBit(this.#registers.ICR, SP)
          if (bitSet(this.#latches.ICR, SP)) {
            this.#registers.ICR = setBit(this.#registers.ICR, IR)
            this.#pins._IRQ.clear()
          }
        }
      }
      this.#skip = !this.#skip
    }
  }

  writeSdr(value) {
    this.#registers.SDR = value
    // If the serial port is configured to send (i.e., if it's set to output mode and if
    // Timer A is set to continuous mode)
    if (bitSet(this.#registers.CRA, SPMODE) && bitClear(this.#registers.CRA, RUNMODE)) {
      if (this.#done) {
        this.#done = false
        this.#shift = value
      } else {
        this.#ready = true
      }
    }
  }

  reset() {
    this.#shift = 0
    this.#bit = 0

    this.#skip = false
    this.#done = true
    this.#ready = false
  }
}
