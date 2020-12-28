// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 2364 8k x 8-bit ROM.
 *
 * This, along with the similar 23632, is far and away the simplest
 * memory chip in the Commodore 64. With its full complement of address
 * pins and full 8 data pins, there is no need to use multiple chips or
 * to multiplex addresses.
 *
 * Timing of the read cycle (there is, of course, no write cycle in a
 * read-only memory chip) is based solely on the chip select pin `_CS`.
 * When this pin goes low, the chip reads its address pins and makes the
 * value at that location available on its data pins.
 *
 * The chip comes in a 24-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +-----+--+-----+
 *      A7 |1    +--+   24| Vcc
 *      A6 |2           23| A8
 *      A5 |3           22| A9
 *      A4 |4           21| A12
 *      A3 |5           20| _CS
 *      A2 |6           19| A10
 *      A1 |7    2364   18| A11
 *      A0 |8           17| D7
 *      D0 |9           16| D6
 *      D1 |10          15| D5
 *      D2 |11          14| D4
 *     GND |12          13| D3
 *         +--------------+
 * ```
 * *(`GND` and `Vcc` are ground and power supply pins respectively, and
 * they are not emulated.)*
 *
 * In the Commodore 64, U3 and U4 are both 2364A's (a variant with
 * slightly faster data access). U3 stores the BASIC interpreter and U4
 * stores the kernal.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic2364|Ic2364}` function.
 *
 * @typedef Ic2364
 * @property {Pin} _CS [20] The active-low chip select pin. When this
 *     goes low, the chip reads the address and sends the data at that
 *     address to the data pins.
 * @property {Pin} A0 [8] Address pin 0.
 * @property {Pin} A1 [7] Address pin 1.
 * @property {Pin} A2 [6] Address pin 2.
 * @property {Pin} A3 [5] Address pin 3.
 * @property {Pin} A4 [4] Address pin 4.
 * @property {Pin} A5 [3] Address pin 5.
 * @property {Pin} A6 [2] Address pin 6.
 * @property {Pin} A7 [1] Address pin 7.
 * @property {Pin} A8 [23] Address pin 8.
 * @property {Pin} A9 [22] Address pin 9.
 * @property {Pin} A10 [19] Address pin 10.
 * @property {Pin} A11 [18] Address pin 11.
 * @property {Pin} A12 [21] Address pin 11.
 * @property {Pin} D0 [9] Data pin 0.
 * @property {Pin} D1 [10] Data pin 1.
 * @property {Pin} D2 [11] Data pin 2.
 * @property {Pin} D3 [13] Data pin 3.
 * @property {Pin} D4 [14] Data pin 4.
 * @property {Pin} D5 [15] Data pin 5.
 * @property {Pin} D6 [16] Data pin 6.
 * @property {Pin} D7 [17] Data pin 7.
 * @property {Pin} Vcc [24] The positive power supply. This pin is not
 *     emulated.
 * @property {Pin} GND [12] The ground. This pin is not emulated.
 */

import Chip from 'components/chip'
import Pin from 'components/pin'
import { pinsToValue, valueToPins, range } from 'utils'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT

/**
 * Creates an emulation of the 2364 8k x 8-bit ROM.
 *
 * Unlike most chip creation functions, this one takes a parameter.
 * Since there is no way to write to the contents of a ROM chip, the
 * full contents is instead provided to the creation function.
 *
 * @param {ArrayBuffer} buffer An array buffer containing the contents
 *     of the memory stored in this chip. Only the first 8192 bytes of
 *     this buffer is used.
 * @returns {Ic2364} A new 2364 8k x 8-bit ROM.
 * @memberof module:chips
 */
function Ic2364(buffer) {
  const chip = new Chip(
    // Address pins A0...A12
    new Pin(8, 'A0', INPUT),
    new Pin(7, 'A1', INPUT),
    new Pin(6, 'A2', INPUT),
    new Pin(5, 'A3', INPUT),
    new Pin(4, 'A4', INPUT),
    new Pin(3, 'A5', INPUT),
    new Pin(2, 'A6', INPUT),
    new Pin(1, 'A7', INPUT),
    new Pin(23, 'A8', INPUT),
    new Pin(22, 'A9', INPUT),
    new Pin(18, 'A10', INPUT),
    new Pin(19, 'A11', INPUT),
    new Pin(21, 'A12', INPUT),

    // Data pins D0...D7
    new Pin(9, 'D0', OUTPUT),
    new Pin(10, 'D1', OUTPUT),
    new Pin(11, 'D2', OUTPUT),
    new Pin(13, 'D3', OUTPUT),
    new Pin(14, 'D4', OUTPUT),
    new Pin(15, 'D5', OUTPUT),
    new Pin(16, 'D6', OUTPUT),
    new Pin(17, 'D7', OUTPUT),

    // Chip select pin. When this goes low, a read cycle is executed
    // based on the address on pins A0...A12. When it's high, the data
    // pins are put into hi-Z.
    new Pin(20, '_CS', INPUT),

    // Power supply and ground pins. These are not emulated.
    new Pin(24, 'VCC'),
    new Pin(12, 'GND'),
  )

  const addrPins = [...range(13)].map(pin => chip[`A${pin}`])
  const dataPins = [...range(8)].map(pin => chip[`D${pin}`])

  const memory = new Uint8Array(buffer)

  // Reads the 8-bit value at the location indicated by the address pins
  // and puts that value on the data pins.
  function read() {
    const value = memory[pinsToValue(...addrPins)]
    valueToPins(value, ...dataPins)
  }

  function enableListener(pin) {
    if (pin.high) {
      valueToPins(null, ...dataPins)
    } else {
      read()
    }
  }

  chip._CS.addListener(enableListener)

  return chip
}

export { Ic2364 }
