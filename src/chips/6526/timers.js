// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  CIACRA,
  CIACRB,
  CRA_START,
  CRA_IN,
  CRB_START,
  CRB_IN0,
  CRB_IN1,
  CRA_PBON,
  CRA_OUT,
  CRB_PBON,
  CRB_OUT,
  TIMALO,
  TIMAHI,
  TIMBLO,
  TIMBHI,
  CIAICR,
  ICR_TA,
  CRA_RUN,
  ICR_TB,
  CRB_RUN,
  CRA_SP,
  CIASDR,
  ICR_SP,
  ICR_IR,
} from "./constants"
import { bitSet, bitClear, setBit, clearBit } from "utils"

export function timers(chip, registers, latches) {
  // -----------------------------------------------------------------------------------------------
  // Timers
  //
  // Timers decrement their registers on each source event until they reach zero, when they have the
  // option of presenting an output on one of the PB pins, firing an interrupt, or both. The two
  // timers are quite similar, only differing in the pin on which they present their output and in
  // that Timer B has the option of using Timer A completions as a counting source.
  //
  // The timer values are always available for reading from the appropriate register. If these
  // registers are written to, the contents of the register don't actually change; the value gets
  // latched and becomes the new value that the timer resets itself to after completion.

  chip.O2.addListener(pin => {
    if (pin.high) {
      const cra = registers[CIACRA]
      const crb = registers[CIACRB]

      // Reset PB6 if on and output mode = pulse
      if (bitSet(cra, CRA_PBON) && bitClear(cra, CRA_OUT)) {
        chip.PB6.clear()
      }
      // Reset PB7 if on and output mode = pulse
      if (bitSet(crb, CRB_PBON) && bitClear(crb, CRB_OUT)) {
        chip.PB7.clear()
      }

      // Decrement Timer A if its input is clock pulses and timer is started
      if (bitSet(cra, CRA_START) && bitClear(cra, CRA_IN)) {
        decrementTimerA()
      }
      // Decrement Timer B if its input is clock pulses and timer is started
      if (bitSet(crb, CRB_START) && bitClear(crb, CRB_IN0) && bitClear(crb, CRB_IN1)) {
        decrementTimerB()
      }
    }
  })

  chip.CNT.addListener(pin => {
    if (pin.high) {
      const cra = registers[CIACRA]
      const crb = registers[CIACRB]

      // Decrement Timer A if its input is CNT pulses
      if (bitSet(cra, CRA_START) && bitSet(cra, CRA_IN)) {
        decrementTimerA()
      }
      // Decrement Timer B if its input is CNT pulses
      if (bitSet(crb, CRB_START) && bitSet(crb, CRB_IN0) && bitClear(crb, CRB_IN1)) {
        decrementTimerB()
      }
    }
  })

  function decrementTimerA() {
    registers[TIMALO]--
    if (registers[TIMALO] === 0 && registers[TIMAHI] === 0) {
      underflowTimerA()
    } else if (registers[TIMALO] === 255) {
      registers[TIMAHI]--
    }
  }

  function decrementTimerB() {
    registers[TIMBLO]--
    if (registers[TIMBLO] === 0 && registers[TIMBHI] === 0) {
      underflowTimerB()
    } else if (registers[TIMBLO] === 255) {
      registers[TIMBHI]--
    }
  }

  function underflowTimerA() {
    const cra = registers[CIACRA]
    const crb = registers[CIACRB]

    // Set PB6 to appropriate level if on
    if (bitSet(cra, CRA_PBON)) {
      if (bitSet(cra, CRA_OUT)) {
        chip.PB6.toggle()
      } else {
        chip.PB6.set()
      }
    }

    // Decrement Timer B if CRB says so
    if (bitSet(crb, CRB_IN1)) {
      if (bitSet(crb, CRB_IN0) ? chip.CNT.high : true) {
        decrementTimerB()
      }
    }

    // Potentially send a bit out the serial port if it is set to output mode and if the timer is
    // set to run continuously
    if (bitSet(cra, CRA_SP) && bitClear(cra, CRA_RUN)) {
      handleSpOut()
    }

    // Set the ICR bit, and fire interrupt if the ICR says so
    registers[CIAICR] = setBit(registers[CIAICR], ICR_TA)
    if (bitSet(latches[CIAICR], ICR_TA)) {
      registers[CIAICR] = setBit(registers[CIAICR], ICR_IR)
      chip._IRQ.clear()
    }

    // Reset value to that in latch
    registers[TIMALO] = latches[TIMALO]
    registers[TIMAHI] = latches[TIMAHI]

    // Clear start bit if in one-shot mode
    if (bitSet(cra, CRA_RUN)) {
      registers[CIACRA] = clearBit(registers[CIACRA], CRA_START)
    }
  }

  function underflowTimerB() {
    const crb = registers[CIACRB]

    // Set PB7 to appropriate value if on
    if (bitSet(crb, CRB_PBON)) {
      if (bitSet(crb, CRB_OUT)) {
        chip.PB7.toggle()
      } else {
        chip.PB7.set()
      }
    }

    // Set the interrupt bit, and fire interrupt if the ICR says so
    registers[CIAICR] = setBit(registers[CIAICR], ICR_TB)
    if (bitSet(latches[CIAICR], ICR_TB)) {
      registers[CIAICR] = setBit(registers[CIAICR], ICR_IR)
      chip._IRQ.clear()
    }

    // Reset value to that in latch
    registers[TIMBLO] = latches[TIMBLO]
    registers[TIMBHI] = latches[TIMBHI]

    // Clear start bit if in one-shot mode
    if (bitSet(crb, CRB_RUN)) {
      registers[CIACRB] = clearBit(registers[CIACRB], CRB_START)
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Serial port
  //
  // If the port is set to input, a bit is read into the shift register (MSB first) each time the
  // CNT pin transitions high from an outside source. Once 8 bits have been read, the contents of
  // the shift register are dumped into the Serial Data Register and an interrupt is fired off.
  //
  // If the port is set to output, the clock used will be Timer A. Every *other* time it underflows
  // (the data rate out is half the Timer A underflow rate), the next bit (MSB first) will be put
  // onto the SP pin and the CNT pin will go high. Once all 8 bits have been sent, an interrupt
  // fires and, if new data had already been loaded into the SDR, the process will immediately
  // repeat.
  //
  // The code for the serial port appears here because output is dependent upon the timers located
  // here as well.

  // The shift register from which the value is sent out over the SP pin bit-by-bit. This is the
  // value in the shift register (`shift`) and the last bit to have been sent out (`bit`).
  let shift = 0
  let bit = 0

  // Flag to tell whether to skip transmission on the next undeflow. This happens every other
  // underflow (the send rate is defined to be half the underflow rate). If an undeflow is skipped,
  // the CNT pin will be cleared instead.
  let skip = false

  // Indicates whether transmission is finshed. This happens if the shift register has all 8 bits
  // sent out and there is not a new 8 bits waiting in the SDR to be sent out.
  let done = false

  // Flag to indicate whether the value in the SDR is waiting to be sent out the serial port.
  let ready = false

  chip.CNT.addListener(pin => {
    // Only do anything if CNT is transitioning high and the serial port is set to input
    if (pin.high && bitClear(registers[CIACRA], CRA_SP)) {
      if (bit === 0) {
        bit = 8
      }
      bit--
      if (chip.SP.high) {
        setBit(shift, bit)
      }
      // If the last bit of the byte has been read, push the byte to the SP register and, if the
      // ICR says so, fire off an IRQ
      if (bit === 0) {
        registers[CIASDR] = shift
        shift = 0
        setBit(registers[CIAICR], ICR_SP)
        if (bitSet(latches[CIAICR], ICR_SP)) {
          setBit(registers[CIAICR], ICR_IR)
          chip._IRQ.clear()
        }
      }
    }
  })

  function handleSpOut() {
    if (!done) {
      if (skip) {
        // On skipped underflows, CNT is cleared in preparation for setting it on the next undeflow
        // when data goes out the SP pin.
        chip.CNT.clear()
      } else {
        if (bit === 0) {
          bit = 8
        }
        bit--
        // Put the next bit of the shift register on the SP pin and set the CNT pin to indicate that
        // new data is available
        chip.SP.level = bitSet(shift, bit)
        chip.CNT.set()

        // When the shift register has been completely transmitted:
        if (bit === 0) {
          if (ready) {
            // If there is a new value ready to be loaded into the shift register, do it
            ready = false
            shift = registers[CIASDR]
          } else {
            // Otehrwise clear the shift register and record that there is nothing new to send
            done = true
            shift = 0
          }

          // Set the interrupt bit and then fire off an interrupt if the ICR says to
          setBit(registers[CIAICR], ICR_SP)
          if (bitSet(latches[CIAICR], ICR_SP)) {
            setBit(registers[CIAICR], ICR_IR)
            chip._IRQ.clear()
          }
        }
      }
      skip = !skip
    }
  }

  function writeSdr(value) {
    registers[CIASDR] = value
    // If the serial port is configured to send (i.e., if it's set to output mode and if Timer A is
    // set to continuous mode)
    if (bitSet(registers[CIACRA], CRA_SP) && bitClear(registers[CIACRA], CRA_RUN)) {
      ready = true
      if (done) {
        // Restart transmission if it had previously stopped due to lack of data to send
        done = false
        handleSpOut()
      }
    }
  }

  return { writeSdr }
}
