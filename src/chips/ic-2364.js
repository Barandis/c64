// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 2364 8k x 8-bit ROM.
//
// This, along with the similar 23632, is far and away the simplest memory chip in the
// Commodore 64. With its full complement of address pins and full 8 data pins, there is no
// need to use multiple chips or to multiplex addresses.
//
// Timing of the read cycle (there is, of course, no write cycle in a read-only memory chip)
// is based solely on the chip select pin `CS`. When this pin goes low, the chip reads its
// address pins and makes the value at that location available on its data pins.
//
// The chip comes in a 24-pin dual in-line package with the following pin assignments.
//
//         +-----+--+-----+
//      A7 |1    +--+   24| Vcc
//      A6 |2           23| A8
//      A5 |3           22| A9
//      A4 |4           21| A12
//      A3 |5           20| CS
//      A2 |6           19| A10
//      A1 |7    2364   18| A11
//      A0 |8           17| D7
//      D0 |9           16| D6
//      D1 |10          15| D5
//      D2 |11          14| D4
//     GND |12          13| D3
//         +--------------+
//
// *(`GND` and `Vcc` are ground and power supply pins respectively, and they are not
// emulated.)*
//
// In the Commodore 64, U3 and U4 are both 2364A's (a variant with slightly faster data
// access). U3 stores the BASIC interpreter and U4 stores the kernal.

import Chip from 'components/chip'
import Pin from 'components/pin'
import { pinsToValue, valueToPins, range } from 'utils'

const { INPUT, OUTPUT } = Pin

// Unlike any other chip (except for the cousin Ic2332), this one takes a parameter. Since
// this memory chip is read-only, the argument is the contents of that memory as an array of
// bytes. It is immediately loaded into the internal memory array, which afterwards does not
// change.
export default function Ic2364(buffer) {
  const chip = Chip(
    // Address pins A0...A12
    Pin(8, 'A0', INPUT),
    Pin(7, 'A1', INPUT),
    Pin(6, 'A2', INPUT),
    Pin(5, 'A3', INPUT),
    Pin(4, 'A4', INPUT),
    Pin(3, 'A5', INPUT),
    Pin(2, 'A6', INPUT),
    Pin(1, 'A7', INPUT),
    Pin(23, 'A8', INPUT),
    Pin(22, 'A9', INPUT),
    Pin(18, 'A10', INPUT),
    Pin(19, 'A11', INPUT),
    Pin(21, 'A12', INPUT),

    // Data pins D0...D7
    Pin(9, 'D0', OUTPUT),
    Pin(10, 'D1', OUTPUT),
    Pin(11, 'D2', OUTPUT),
    Pin(13, 'D3', OUTPUT),
    Pin(14, 'D4', OUTPUT),
    Pin(15, 'D5', OUTPUT),
    Pin(16, 'D6', OUTPUT),
    Pin(17, 'D7', OUTPUT),

    // Chip select pin. When this goes low, a read cycle is executed based on the address
    // on pins A0...A12. When it's high, the data pins are put into hi-Z.
    Pin(20, 'CS', INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(24, 'VCC'),
    Pin(12, 'GND'),
  )

  const addrPins = [...range(13)].map(pin => chip[`A${pin}`])
  const dataPins = [...range(8)].map(pin => chip[`D${pin}`])
  const memory = new Uint8Array(buffer)

  // Reads the 8-bit value at the location indicated by the address pins and puts that value
  // on the data pins.
  const read = () => {
    const value = memory[pinsToValue(...addrPins)]
    valueToPins(value, ...dataPins)
  }

  const enableListener = () => pin => {
    if (pin.high) {
      valueToPins(null, ...dataPins)
    } else {
      read()
    }
  }

  chip.CS.addListener(enableListener())

  return chip
}
