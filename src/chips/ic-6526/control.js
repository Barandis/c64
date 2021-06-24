// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import { bitSet } from 'utils'
import { LOAD, PBON, SC, SPMODE } from './constants'

const { INPUT, OUTPUT } = Pin

export default function ControlModule(pins, registers, latches) {
  return {
    // -------------------------------------------------------------------
    // Interrupt Control Register
    //
    // Controls sending interrupts from the five sources available in the 6526: Timer A
    // underflow, Timer B underflow, TOD alarm, serial port full/empty, and _FLAG pin
    // clearing. One bit in the register is assigned to each source; if an interrupt is
    // generated, the bit corresponding to the source(s) will be set.
    //
    // Writing to the register is slightly more complicated. The write affects an internal
    // latch rather than the register itself and sets or clears one or more bits; whether it
    // is set or clear depends on bit 7 of the written value (1 = set, 0 = clear). Any set bit
    // in the rest of the value determines *which* ICR bit is set or cleared (except for bits
    // 5 and 6, which are ignored because there are only five settable bits). These bits then
    // act as a mask; if the bit in this latch corresponding to the interrupt event is set,
    // then the interrupt will fire. If that bit is not set, the interrupt will be ignored.
    //
    // When the register is read, it is cleared, so it is the responsibility of the reader to
    // store this information elsewhere if it needs it. Reading the register also resets the
    // IRQ pin.

    readIcr() {
      const result = registers.ICR
      registers.ICR = 0
      pins.IRQ.float()
      return result
    },

    writeIcr(value) {
      const mask = value & 0x1f
      if (bitSet(value, SC)) {
        latches.ICR |= mask
      } else {
        latches.ICR &= ~mask
      }
    },

    // -------------------------------------------------------------------
    // Control registers A and B
    //
    // These two registers are primarily for controlling the two timers, though they also help
    // control the serial port and the TOD alarm.

    writeCra(value) {
      // The LOAD bit (bit 4) is a strobe and does not get recorded
      registers.CRA = value & ~(1 << LOAD)

      // If bit 1 is set, PB6 becomes an output for Timer A, otherwise bit 6 of the DDR
      // controls it
      if (bitSet(value, PBON)) {
        pins.PB6.mode = OUTPUT
        pins.PB6.level = 0
      } else {
        pins.PB6.mode = bitSet(registers.DDRA, 6) ? OUTPUT : INPUT
      }

      // If bit 4 is set, the contents of the timer latch are forced into the timer register
      // immediately (normally the latches are loaded into the register on underflow)
      if (bitSet(value, LOAD)) {
        registers.TALO = latches.TALO
        registers.TAHI = latches.TAHI
      }

      // If bit 6 is set, SP is set to output. Since CNT is then used to signal new data, it
      // must also be set to output.
      if (bitSet(value, SPMODE)) {
        pins.SP.mode = OUTPUT
        pins.CNT.mode = OUTPUT
        pins.SP.level = 0
        pins.CNT.level = 0
      } else {
        pins.SP.mode = INPUT
        pins.CNT.mode = INPUT
      }
    },

    writeCrb(value) {
      // The LOAD bit (bit 4) is a strobe and does not get recorded
      registers.CRB = value & ~(1 << LOAD)

      // If bit 1 is set, PB7 becomes an output for Timer B, otherwise bit 6 of the DDR
      // controls it
      if (bitSet(value, PBON)) {
        pins.PB7.mode = OUTPUT
        pins.PB7.level = 0
      } else {
        pins.PB7.mode = bitSet(registers.DDRB, 7) ? OUTPUT : INPUT
      }

      // If bit 4 is set, the contents of the timer latch are forced into the timer register
      // immediately (normally the latches are loaded into the register on underflow)
      if (bitSet(value, LOAD)) {
        registers.TBLO = latches.TBLO
        registers.TBHI = latches.TBHI
      }
    },
  }
}
