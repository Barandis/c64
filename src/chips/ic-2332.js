// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 2332 4k x 8-bit ROM.
 *
 * This, along with the similar 2364, is far and away the simplest
 * memory chip in the Commodore 64. With its full complement of address
 * pins and full 8 data pins, there is no need to use multiple chips or
 * to multiplex addresses.
 *
 * Timing of the read cycle (there is, of course, no write cycle in a
 * read-only memory chip) is done with a pair of active-low chip select
 * pins, `_CS1` and `_CS2`. When both are low, the chip reads its
 * address pins and makes the value at that location available on its
 * data pins. In the C64, `_CS2` is tied to ground, meaning `CS1` is the
 * only pin that needs to be manipulated.
 *
 * The chip comes in a 24-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +-----+--+-----+
 *      A7 |1    +--+   24| Vcc
 *      A6 |2           23| A8
 *      A5 |3           22| A9
 *      A4 |4           21| _CS2
 *      A3 |5           20| _CS1
 *      A2 |6           19| A10
 *      A1 |7    2332   18| A11
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
 * In the Commodore 64, U5 is a 2332A (a variant with slightly faster
 * data access). It's used to store information on how to display
 * characters to the screen.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic2332|Ic2332}` function.
 *
 * @typedef Ic2332
 * @property {Pin} _CS1 [20] One of the two active-low chip select pins.
 *     When the second of these goes low, the chip reads the address and
 *     sends the data at that address to the data pins.
 * @property {Pin} _CS2 [21] One of the two active-low chip select pins.
 *     When the second of these goes low, the chip reads the address and
 *     sends the data at that address to the data pins.
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

import { Chip, Pin, INPUT, OUTPUT } from "components"
import { pinsToValue, valueToPins, range } from "utils"

/**
 * Creates an emulation of the 2332 4k x 8-bit ROM.
 *
 * Unlike most chip creation functions, this one takes a parameter.
 * Since there is no way to write to the contents of a ROM chip, the
 * full contents is instead provided to the creation function.
 *
 * @param {ArrayBuffer} buffer An array buffer containing the contents
 *     of the memory stored in this chip. Only the first 4096 bytes of
 *     this buffer is used.
 * @returns {Ic2332} A new 2332 4k x 8-bit ROM.
 * @memberof module:chips
 */
function Ic2332(buffer) {
  const chip = Chip(
    // Address pins A0...A11
    Pin(8, "A0", INPUT),
    Pin(7, "A1", INPUT),
    Pin(6, "A2", INPUT),
    Pin(5, "A3", INPUT),
    Pin(4, "A4", INPUT),
    Pin(3, "A5", INPUT),
    Pin(2, "A6", INPUT),
    Pin(1, "A7", INPUT),
    Pin(23, "A8", INPUT),
    Pin(22, "A9", INPUT),
    Pin(18, "A10", INPUT),
    Pin(19, "A11", INPUT),

    // Data pins D0...D7
    Pin(9, "D0", OUTPUT),
    Pin(10, "D1", OUTPUT),
    Pin(11, "D2", OUTPUT),
    Pin(13, "D3", OUTPUT),
    Pin(14, "D4", OUTPUT),
    Pin(15, "D5", OUTPUT),
    Pin(16, "D6", OUTPUT),
    Pin(17, "D7", OUTPUT),

    // Chip select pins. When these are both low, a read cycle is
    // executed based on the address on pins A0...A11. When they're
    // high, the data pins are put into hi-Z.
    Pin(20, "_CS1", INPUT),
    Pin(21, "_CS2", INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(24, "Vcc"),
    Pin(12, "GND"),
  )

  const addrPins = [...range(12)].map(pin => chip[`A${pin}`])
  const dataPins = [...range(8)].map(pin => chip[`D${pin}`])

  const memory = new Uint8Array(buffer)

  // Reads the 8-bit value at the location indicated by the address pins
  // and puts that value on the data pins.
  function read() {
    const address = pinsToValue(...addrPins)
    const value = memory[address]
    valueToPins(value, ...dataPins)
  }

  function enableListener() {
    if (chip._CS1.low && chip._CS2.low) {
      read()
    } else {
      valueToPins(null, ...dataPins)
    }
  }

  chip._CS1.addListener(enableListener)
  chip._CS2.addListener(enableListener)

  return chip
}

export { Ic2332 }
