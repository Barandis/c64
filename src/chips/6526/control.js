// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  CIAICR,
  ICR_SC,
  CIACRA,
  CRA_LOAD,
  CRA_PBON,
  CIDDRA,
  TIMALO,
  TIMAHI,
  CRA_SP,
  CIACRB,
  CRB_LOAD,
  CRB_PBON,
  CIDDRB,
  TIMBLO,
  TIMBHI,
} from "./constants"
import { bitSet } from "utils"
import { OUTPUT, INPUT } from "components/pin"

export function control(chip, registers, latches) {
  // -----------------------------------------------------------------------------------------------
  // Interrupt Control Register
  //
  // Controls sending interrupts from the five sources available in the 6526: Timer A underflow,
  // Timer B underflow, TOD alarm, serial port full/empty, and _FLAG pin clearing. One bit in the
  // register is assigned to each source; if an interrupt is generated, the bit corresponding to the
  // source(s) will be set.
  //
  // Writing to the register is slightly more complicated. The write affects an internal latch
  // rather than the register itself and sets or clears one or more bits; whether it is set or clear
  // depends on bit 7 of the written value (1 = set, 0 = clear). Any set bit in the rest of the
  // value determines *which* ICR bit is set or cleared (except for bits 5 and 6, which are ignored
  // because there are only five settable bits). These bits then act as a mask; if the bit in this
  // latch corresponding to the interrupt event is set, then the interrupt will fire. If that bit is
  // not set, the interrupt will be ignored.
  //
  // When the register is read, it is cleared, so it is the responsibility of the reader to store
  // this information elsewhere if it needs it. Reading the register also resets the _IRQ pin.

  function readIcr() {
    const result = registers[CIAICR]
    registers[CIAICR] = 0
    chip._IRQ.float()
    return result
  }

  function writeIcr(value) {
    const mask = value & 0x1f
    if (bitSet(value, ICR_SC)) {
      latches[CIAICR] |= mask
    } else {
      latches[CIAICR] &= ~mask
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Control registers A and B
  //
  // These two registers are primarily for controlling the two timers, though they also help control
  // the serial port and the TOD alarm.

  function writeCra(value) {
    // The LOAD bit (bit 4) is a strobe and does not get recorded
    registers[CIACRA] = value & ~(1 << CRA_LOAD)

    // If bit 1 is set, PB6 becomes an output for Timer A, otherwise bit 6 of the DDR controls it
    if (bitSet(value, CRA_PBON)) {
      chip.PB6.mode = OUTPUT
      chip.PB6.level = 0
    } else {
      chip.PB6.mode = bitSet(registers[CIDDRA], 6) ? OUTPUT : INPUT
    }

    // If bit 4 is set, the contents of the timer latch are forced into the timer register
    // immediately (normally the latches are loaded into the register on underflow)
    if (bitSet(value, CRA_LOAD)) {
      registers[TIMALO] = latches[TIMALO]
      registers[TIMAHI] = latches[TIMAHI]
    }

    // If bit 6 is set, SP is set to output. Since CNT is then used to signal new data, it must
    // also be set to output.
    if (bitSet(value, CRA_SP)) {
      chip.SP.mode = OUTPUT
      chip.CNT.mode = OUTPUT
      chip.SP.level = 0
      chip.CNT.level = 0
    } else {
      chip.SP.mode = INPUT
      chip.CNT.mode = INPUT
    }
  }

  function writeCrb(value) {
    // The LOAD bit (bit 4) is a strobe and does not get recorded
    registers[CIACRB] = value & ~(1 << CRB_LOAD)

    // If bit 1 is set, PB7 becomes an output for Timer B, otherwise bit 6 of the DDR controls it
    if (bitSet(value, CRB_PBON)) {
      chip.PB7.mode = OUTPUT
      chip.PB7.level = 0
    } else {
      chip.PB7.mode = bitSet(registers[CIDDRB], 7) ? OUTPUT : INPUT
    }

    // If bit 4 is set, the contents of the timer latch are forced into the timer register
    // immediately (normally the latches are loaded into the register on underflow)
    if (bitSet(value, CRB_LOAD)) {
      registers[TIMBLO] = latches[TIMBLO]
      registers[TIMBHI] = latches[TIMBHI]
    }
  }

  return { readIcr, writeIcr, writeCra, writeCrb }
}
