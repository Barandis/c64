// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { bitSet, bitClear, setBit, clearBit } from 'utils'
import {
  INMODE,
  INMODE0,
  INMODE1,
  IR,
  OUTMODE,
  PBON,
  RUNMODE,
  SDR,
  SP,
  SPMODE,
  START,
  TA,
  TB,
} from './constants'

export default function TimerModule(pins, registers, latches) {
  // The shift register from which the value is sent out over the SP pin bit-by-bit. This is
  // the value in the shift register (`shift`) and the last bit to have been sent out
  // (`bit`).
  let shift = 0
  let bit = 0

  // Flag to tell whether to skip transmission on the next undeflow. This happens every
  // other underflow (the send rate is defined to be half the underflow rate). If an
  // undeflow is skipped, the CNT pin will be cleared instead.
  let skip = false

  // Indicates whether transmission is finshed. This happens if the shift register has all 8
  // bits sent out and there is not a new 8 bits waiting in the SDR to be sent out.
  let done = true

  // Flag to indicate whether the value in the SDR is waiting to be sent out the serial
  // port.
  let ready = false

  // --------------------------------------------------------------------------------------
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

  // Handles the shifting of bits out the serial port pin, as described above. This also
  // controls the output on the CNT pin, which will alternate high to low each time this
  // function is called.
  const handleSpOut = () => {
    if (!done) {
      if (skip) {
        // On skipped underflows, CNT is cleared in preparation for setting it on the next
        // underflow when data goes out the SP pin.
        pins.CNT.clear()
      } else {
        if (bit === 0) {
          bit = 8
        }
        bit -= 1
        // Put the next bit of the shift register on the SP pin and set the CNT pin to
        // indicate that new data is available
        pins.SP.level = bitSet(shift, bit)
        pins.CNT.set()

        // When the shift register has been completely transmitted:
        if (bit === 0) {
          if (ready) {
            // If there is a new value ready to be loaded into the shift register, do it
            ready = false
            shift = registers[SDR]
          } else {
            // Otherwise clear the shift register and record that there is nothing new to
            // send
            done = true
            shift = 0
          }

          // Set the interrupt bit and then fire off an interrupt if the ICR says to
          registers.ICR = setBit(registers.ICR, SP)
          if (bitSet(latches.ICR, SP)) {
            registers.ICR = setBit(registers.ICR, IR)
            pins.IRQ.clear()
          }
        }
      }
      skip = !skip
    }
  }

  // Responds to the CNT pin transitioning high *if* the serial port is set to input mode.
  // This will read a bit off the serial port into the internal serial shift register; once
  // that shift register is full (i.e., once 8 bits have been read), the SDR is updated and
  // an interrupt is potentially signalled.
  const serialListener = () => pin => {
    // Only do anything if CNT is transitioning high and the serial port is set to input
    if (pin.high && bitClear(registers.CRA, SPMODE)) {
      if (bit === 0) bit = 8
      bit -= 1
      if (pins.SP.high) shift = setBit(shift, bit)

      // If the last bit of the byte has been read, push the byte to the SP register and, if
      // the ICR says so, fire off an IRQ
      if (bit === 0) {
        registers.SDR = shift
        shift = 0
        registers.ICR = setBit(registers.ICR, SP)
        if (bitSet(latches.ICR, SP)) {
          registers.ICR = setBit(registers.ICR, IR)
          pins.IRQ.clear()
        }
      }
    }
  }

  // --------------------------------------------------------------------------------------
  // Timer B

  // Handles an underflow of timer B. This is run any time timer B's counter reaches zero.
  // It resets the timer to the value in its latch and does an number of optional things
  // depending on register settings (e.g., manipulates the PB7 output, fires an interrupt,
  // or resets the start bit if the timer is in one-shot mode).
  const underflowTimerB = () => {
    const crb = registers.CRB

    // Set PB7 to appropriate value if on
    if (bitSet(crb, PBON)) {
      if (bitSet(crb, OUTMODE)) {
        pins.PB7.toggle()
      } else {
        pins.PB7.set()
      }
    }

    // Set the interrupt bit, and fire interrupt if the ICR says so
    registers.ICR = setBit(registers.ICR, TB)
    if (bitSet(latches.ICR, TB)) {
      registers.ICR = setBit(registers.ICR, IR)
      pins.IRQ.clear()
    }

    // Reset value to that in latch
    registers.TBLO = latches.TBLO
    registers.TBHI = latches.TBHI

    // Clear start bit if in one-shot mode
    if (bitSet(crb, RUNMODE)) {
      registers.CRB = clearBit(registers.CRB, START)
    }
  }

  // Called on clock to decrement timer B. This will call underflowTimerB once both TBLO and
  // TBHI are 0.
  const decrementTimerB = () => {
    registers.TBLO -= 1
    if (registers.TBLO === 0 && registers.TBHI === 0) {
      underflowTimerB()
    } else if (registers.TBLO === 255) {
      registers.TBHI -= 1
    }
  }

  // --------------------------------------------------------------------------------------
  // Timer A

  // Handles an underflow of timer A. This is run any time timer A's counter reaches zero.
  // It resets the timer to the value in its latch and does an number of optional things
  // depending on register settings (e.g., manipulates the PB6 output, fires an interrupt,
  // or resets the start bit if the timer is in one-shot mode).
  //
  // Timer A can also be set to decrement timer B when the former reaches 0, letting the
  // timers be chained together. This happens in this function as well.
  //
  // Notably, if the serial port is in output mode and timer A is in continuous mode, it is
  // used as the baud rate generator for the serial port. In that case, underflow will call
  // handleSpOut, which will send a bit out the serial port (and set the CNT pin high) every
  // *other* time it's called (data is shifted out the serial port at one-half the timer A
  // underflow rate).
  const underflowTimerA = () => {
    const cra = registers.CRA
    const crb = registers.CRB

    // Set PB6 to appropriate level if on
    if (bitSet(cra, PBON)) {
      if (bitSet(cra, OUTMODE)) {
        pins.PB6.toggle()
      } else {
        pins.PB6.set()
      }
    }

    // Decrement Timer B if CRB says so
    if (bitSet(crb, INMODE1)) {
      if (bitSet(crb, INMODE0) ? pins.CNT.high : true) {
        decrementTimerB()
      }
    }

    // Potentially send a bit out the serial port if it is set to output mode and if the
    // timer is set to run continuously
    if (bitSet(cra, SPMODE) && bitClear(cra, RUNMODE)) {
      handleSpOut()
    }

    // Set the ICR bit, and fire interrupt if the ICR says so
    registers.ICR = setBit(registers.ICR, TA)
    if (bitSet(latches.ICR, TA)) {
      registers.ICR = setBit(registers.ICR, IR)
      pins.IRQ.clear()
    }

    // Reset value to that in latch
    registers.TALO = latches.TALO
    registers.TAHI = latches.TAHI

    // Clear start bit if in one-shot mode
    if (bitSet(cra, RUNMODE)) {
      registers.CRA = clearBit(registers.CRA, START)
    }
  }

  // Called on clock to decrement timer A. This will call underflowTimerA once both TALO and
  // TAHI are 0.
  const decrementTimerA = () => {
    registers.TALO -= 1
    if (registers.TALO === 0 && registers.TAHI === 0) {
      underflowTimerA()
    } else if (registers.TALO === 255) {
      registers.TAHI -= 1
    }
  }

  // Handles timer tasks that must be handled on each clock cycle. This does two things to
  // each timer: 1) it decrements the timer register(s) if that timer is set to use clock
  // pulses as input, and 2) it sets PB6 or PB7 to low if the timer is set to use that pin
  // as an output *and* the output mode is pulse. Pulse output mode causes the PB6/7 pin to
  // go high for one cycle; the underflow code handles setting it high, and this sets it
  // back low on the next clock.
  const clockListener = () => pin => {
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
        decrementTimerA()
      }
      // Decrement Timer B if its input is clock pulses and timer is started
      if (bitSet(crb, START) && bitClear(crb, INMODE0) && bitClear(crb, INMODE1)) {
        decrementTimerB()
      }
    }
  }

  // Handles decrementing the timers if they're set to use CNT pulses as input.
  const countListener = () => pin => {
    if (pin.high) {
      const cra = registers.CRA
      const crb = registers.CRB

      // Decrement Timer A if its input is CNT pulses
      if (bitSet(cra, START) && bitSet(cra, INMODE)) {
        decrementTimerA()
      }
      // Decrement Timer B if its input is CNT pulses
      if (bitSet(crb, START) && bitSet(crb, INMODE0) && bitClear(crb, INMODE1)) {
        decrementTimerB()
      }
    }
  }

  pins.PHI2.addListener(clockListener())
  pins.CNT.addListener(countListener())
  pins.CNT.addListener(serialListener())

  return {
    writeSdr(value) {
      registers.SDR = value
      // If the serial port is configured to send (i.e., if it's set to output mode and if
      // Timer A is set to continuous mode)
      if (bitSet(registers.CRA, SPMODE) && bitClear(registers.CRA, RUNMODE)) {
        if (done) {
          done = false
          shift = value
        } else {
          ready = true
        }
      }
    },

    reset() {
      shift = 0
      bit = 0

      skip = false
      done = true
      ready = false
    },
  }
}
