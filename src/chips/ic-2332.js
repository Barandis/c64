// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 2332 4k x 8-bit ROM.
//
// This, along with the similar 2364, is far and away the simplest memory chip in the
// Commodore 64. With its full complement of address pins and full 8 data pins, there is no
// need to use multiple chips or to multiplex addresses.
//
// Timing of the read cycle (there is, of course, no write cycle in a read-only memory chip)
// is done with a pair of active-low chip select pins, CS1 and CS2. When both are low, the
// chip reads its address pins and makes the value at that location available on its data
// pins. In the C64, CS2 is tied to ground, meaning CS1 is the only pin that needs to be
// manipulated.
//
// The chip comes in a 24-pin dual in-line package with the following pin assignments.
//
//         +-----+--+-----+
//      A7 |1    +--+   24| Vcc
//      A6 |2           23| A8
//      A5 |3           22| A9
//      A4 |4           21| CS2
//      A3 |5           20| CS1
//      A2 |6           19| A10
//      A1 |7    2332   18| A11
//      A0 |8           17| D7
//      D0 |9           16| D6
//      D1 |10          15| D5
//      D2 |11          14| D4
//     GND |12          13| D3
//         +--------------+
//
// These pin assignments are explained below.
//
// | Pin | Name  | Description                                                             |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 1   | A7    | Address pins. These 12 pins can address 4096 memory locations.          |
// | 2   | A6    |                                                                         |
// | 3   | A5    |                                                                         |
// | 4   | A4    |                                                                         |
// | 5   | A3    |                                                                         |
// | 6   | A2    |                                                                         |
// | 7   | A1    |                                                                         |
// | 8   | A0    |                                                                         |
// | 18  | A11   |                                                                         |
// | 19  | A10   |                                                                         |
// | 22  | A9    |                                                                         |
// | 23  | A8    |                                                                         |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 9   | D0    | Data pins. Data being read from memory will appear on these pins.       |
// | 10  | D1    |                                                                         |
// | 11  | D2    |                                                                         |
// | 13  | D3    |                                                                         |
// | 14  | D4    |                                                                         |
// | 15  | D5    |                                                                         |
// | 16  | D6    |                                                                         |
// | 17  | D7    |                                                                         |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 12  | GND   | Electrical ground. Not emulated.                                        |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 20  | CS1   | Active-low chip select pins. Reading memory can only be done while both |
// | 21  | CS2   | of these pins are low.                                                  |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 24  | Vcc   | +5V power supply. Not emulated.                                         |
//
// In the Commodore 64, U5 is a 2332A (a variant with slightly faster data access). It's
// used to store information on how to display characters to the screen.

import Chip from 'components/chip'
import Pin from 'components/pin'
import Pins from 'components/pins'
import { pinsToValue, valueToPins, range } from 'utils'

const { INPUT, OUTPUT } = Pin

// Unlike any other chip (except for the cousin Ic2364), this one takes a parameter. Since
// this memory chip is read-only, the argument is the contents of that memory as an array of
// bytes. It is immediately loaded into the internal memory array, which afterwards does not
// change.
export default function Ic2332(buffer) {
  const pins = Pins(
    // Address pins A0-A11
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

    // Data pins D0-D7
    Pin(9, 'D0', OUTPUT),
    Pin(10, 'D1', OUTPUT),
    Pin(11, 'D2', OUTPUT),
    Pin(13, 'D3', OUTPUT),
    Pin(14, 'D4', OUTPUT),
    Pin(15, 'D5', OUTPUT),
    Pin(16, 'D6', OUTPUT),
    Pin(17, 'D7', OUTPUT),

    // Chip select pins. When these are both low, a read cycle is executed based on the
    // address on pins A0-A11. When they're high, the data pins are put into hi-Z.
    Pin(20, 'CS1', INPUT),
    Pin(21, 'CS2', INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(24, 'Vcc'),
    Pin(12, 'GND'),
  )

  const addrPins = [...range(12)].map(pin => pins[`A${pin}`])
  const dataPins = [...range(8)].map(pin => pins[`D${pin}`])
  const memory = new Uint8Array(buffer)

  // Reads the 8-bit value at the location indicated by the address pins and puts that value
  // on the data pins.
  const read = () => {
    const value = memory[pinsToValue(...addrPins)]
    valueToPins(value, ...dataPins)
  }

  const enableListener = () => () => {
    if (pins.CS1.low && pins.CS2.low) {
      read()
    } else {
      valueToPins(null, ...dataPins)
    }
  }

  pins.CS1.addListener(enableListener())
  pins.CS2.addListener(enableListener())

  return Chip(pins)
}
