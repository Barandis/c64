// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  CIAPRA, CIAPRB, CIDDRA, CIACRA, CRA_PBON, CIDDRB, CIACRB, CRB_PBON,
} from "./constants"

import { setBit, clearBit, bitSet, range } from "utils"
import { OUTPUT, INPUT } from "components"

export function ports(chip, registers) {
  // -------------------------------------------------------------------
  // Data ports
  //
  // When an input pin of a data register has the data set to it change,
  // it fires off a listener that changes the data in the register as
  // well. Similarly, when data is pushed into a register, the output
  // pins associated with the register are changed to reflect that new
  // state. In other words, the contents of CIAPRA and CIAPRB are kept
  // synched with PA0...PA7 and PB0...PB7, respectively.
  //
  // Because of this, nothing special has to be done when reading a data
  // port register - the contents already match that of the pins. When
  // writing, the output pins need to be set by the writing function.
  //
  // NOTE: only the parallel ports are handled here. Since the serial
  // port is intimately linked to Timer A, its code appears in the timer
  // file.
  //
  // The parallel ports on CIA 1 are used entirely for keyboard
  // scanning. A program in the kernal ROM sends out bits from each of
  // Port A's pins one at a time; any bit returning to Port B must mean
  // that a key was pressed, and the pin that the bit appears on can be
  // cross-referenced with the pin that the bit had gone out on to
  // figure out which key was pressed. This mechanism is also used to
  // scan joysticks in the same way, and PB6 and PB7's timer-out
  // functions are used to control the transmission of the POT signals
  // (paddles) to the SID.
  //
  // The parallel ports on CIA 2 have much more varied use. Port B (and
  // PA2 from port A) are used for the parallel port provided at the
  // User Port. Though it does not necessarily have to be so, this port
  // is often used for RS-232 communications. When doing so, the pinouts
  // look like this:
  //
  //     PA2: RS-232 Transmitted Data (Sout)
  //     PB0: RS-232 Received Data (SIN)
  //     PB1: RS-232 Request to Send (RTS)
  //     PB2: RS-232 Data Terminal Read (DTR)
  //     PB3: RS-232 Ring Indicator (RI)
  //     PB4: RS-232 Carrier Detect (DCD)
  //     PB6: RS-232 Clear to Send (CTS)
  //     PB7: RS-232 Data Set Read (DSR)
  //
  // The remaining pins on Port A are used to service the C64's Serial
  // Port (PA3...PA7) and to provide memory bank switching (effectively,
  // address lines 14 and 15) for the VIC, which can on its own only
  // access 16k of memory (PA0...PA1).

  const paPins = [
    chip.PA0, chip.PA1, chip.PA2, chip.PA3,
    chip.PA4, chip.PA5, chip.PA6, chip.PA7,
  ]
  const pbPins = [
    chip.PB0, chip.PB1, chip.PB2, chip.PB3,
    chip.PB4, chip.PB5, chip.PB6, chip.PB7,
  ]

  // Returns a closure that can be used as a listener. That closure sets
  // a particular bit in the the given register if the listened-to pin
  // is high and clears that same bit if the pin is low.
  function portListener(index, bit) {
    return pin => {
      if (pin.high) {
        registers[index] = setBit(registers[index], bit)
      } else {
        registers[index] = clearBit(registers[index], bit)
      }
    }
  }
  for (const i of range(8)) {
    chip[`PA${i}`].addListener(portListener(CIAPRA, i))
    chip[`PB${i}`].addListener(portListener(CIAPRB, i))
  }

  // The write functions have to set the values in the registers but
  // then also set the same values to the associated pins. The masking
  // ensures that pins that should not be writable - meaning pins
  // designated as input by the DDR or pins designated as timer output
  // pins by the control registers - are not modified one way or the
  // other.
  function writePra(value) {
    const mask = registers[CIDDRA]
    registers[CIAPRA] = registers[CIAPRA] & ~mask | value & mask
    setPortPins(value, mask, paPins)
  }

  function writePrb(value) {
    const mask
      = registers[CIDDRB]
      & (bitSet(registers[CIACRB], CRB_PBON) ? 0x7f : 0xff)
      & (bitSet(registers[CIACRA], CRA_PBON) ? 0xbf : 0xff)
    registers[CIAPRB] = registers[CIAPRB] & ~mask | value & mask
    setPortPins(value, mask, pbPins)
    chip._PC.clear()
  }

  // A read function is only necessary for port B, and only because
  // reading the register lowers the _PC pin for a cycle.
  function readPrb() {
    chip._PC.clear()
    return registers[CIAPRB]
  }

  function setPortPins(value, mask, pins) {
    for (const bit of range(8)) {
      if (bitSet(mask, bit)) {
        pins[bit].level = bitSet(value, bit)
      }
    }
  }

  // Raises the _PC pin every cycle, as reading or writing the PB
  // register sets that pin low for one cycle
  chip.φ2.addListener(pin => {
    if (pin.high) {
      chip._PC.set()
    }
  })

  // -------------------------------------------------------------------
  // Data direction registers
  //
  // Reading from one of these simply returned its contents, so no
  // special functions are needed. Writing changes the contents of the
  // register normally, but it also sets the direction on the pins for
  // the appropriate port. This is reasonably straightforward; setting a
  // bit means the corresponding pin is an output, and clearing a bit
  // means it is an input. The only exception is for bits 6 and 7 of
  // port B; if the appropriate control flags are set, one or both of
  // these may override the setting of DDRB to instead be an output for
  // one of the timers.

  function writeDdra(value) {
    registers[CIDDRA] = value
    for (const bit of range(8)) {
      chip[`PA${bit}`].mode = bitSet(value, bit) ? OUTPUT : INPUT
    }
  }

  function writeDdrb(value) {
    registers[CIDDRB] = value
    for (const bit of range(8)) {
      if (
        !(
          bit === 6 && bitSet(registers[CIACRA], CRA_PBON)
          || bit === 7 && bitSet(registers[CIACRB], CRB_PBON)
        )
      ) {
        chip[`PB${bit}`].mode = bitSet(value, bit) ? OUTPUT : INPUT
      }
    }
  }

  return {
    readPrb,
    writePra,
    writePrb,
    writeDdra,
    writeDdrb,
  }
}
