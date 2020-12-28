// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 2114 1k x 4 bit static RAM.
 *
 * Static RAM differs from dynamic RAM (the RAM generally used for
 * computer memory) in that it doesn't require periodic refresh cycles
 * in order to retain data. Since no reads or writes have to wait for
 * these refresh cycles, static RAM is considerably faster than dynamic
 * RAM.
 *
 * However, it's also considerably more expensive. For this reason,
 * static RAM is generally only in use in particularly speed-sensitive
 * applications and in relatively small amounts. For instance, modern
 * CPU on-board cache RAM is static. The Commodore 64 uses it for color
 * RAM, which is accessed by the VIC at a much higher speed than the
 * DRAM is accessed by the CPU.
 *
 * The 2114 has 1024 addressable locations that hold 4 bits each. Since
 * the Commodore 64 has a fixed palette of 16 colors, 4 bits is all it
 * needs. Therefore a single 2114 could store 1k of colors and it isn't
 * necessary to use it with a second 2114 to store full 8-bit bytes.
 *
 * The timing of reads and writes is particularly simple. If the chip
 * select pin `_CS` is low, the 4 bits stored at the location given on
 * its address pins is put onto the 4 data pins. If the write enable pin
 * `_WE` is also low, then the value on the 4 data pins is stored at the
 * location given on its address pins. The `_CS` pin can stay low for
 * several cycles of reads and writes; it does not require `_CS` to
 * return to high to start the next cycle.
 *
 * The downside of this simple scheme is that care has to be taken to
 * avoid unwanted writes. Address changes should not take place while
 * both `_CS` and `_WE` are low; since address lines do not change
 * simultaneously, changing addresses while both pins are low can and
 * will cause data to be written to multiple addresses, potentially
 * overwriting legitimate data. This is naturally emulated here for the
 * same reason: the chip responds to address line changes, and those
 * changes do not happen simultaneously.
 *
 * Aside from the active-low `_CS` and `_WE` pins, this simple memory
 * device only has the necessary address pins to address 1k of memory
 * and the four necessary bidirectional data pins. It's packages in an
 * 18-pin dual-inline package with the following pin assignments.
 * ```txt
 *         +---+--+---+
 *      A6 |1  +--+ 18| Vcc
 *      A5 |2       17| A7
 *      A4 |3       16| A8
 *      A3 |4       15| A9
 *      A0 |5  2114 14| D0
 *      A1 |6       13| D1
 *      A2 |7       12| D2
 *     _CS |8       11| D3
 *     GND |9       10| _WE
 *         +----------+
 * ```
 * *(`GND` and `Vcc` are ground and power supply pins respectively, and
 * they are not emulated.)*
 *
 * In the Commodore 64, U6 is a 2114. As explained above, it was used
 * strictly as RAM for storing graphics colors.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic2114|Ic2114}` function.
 *
 * @typedef Ic2114
 * @property {Pin} _CS [8] The active-low chip select pin. When this pin
 *     is high, the chip acts normally; when the pin is low, the chip
 *     doesn't respond to any other pins.
 * @property {Pin} _WE [10] The active-low write enable pin. When this
 *     pin is low, a write operation will be performed (immediately if
 *     `_CS` is already there, or when `_CS` eventually goes low). When
 *     it's high, a read operation will be performed instead.
 * @property {Pin} A0 [5] Address pin 0.
 * @property {Pin} A1 [6] Address pin 1.
 * @property {Pin} A2 [7] Address pin 2.
 * @property {Pin} A3 [4] Address pin 3.
 * @property {Pin} A4 [3] Address pin 4.
 * @property {Pin} A5 [2] Address pin 5.
 * @property {Pin} A6 [1] Address pin 6.
 * @property {Pin} A7 [17] Address pin 7.
 * @property {Pin} A8 [16] Address pin 8.
 * @property {Pin} A9 [15] Address pin 9.
 * @property {Pin} D0 [14] Data pin 0.
 * @property {Pin} D1 [13] Data pin 1.
 * @property {Pin} D2 [12] Data pin 2.
 * @property {Pin} D3 [11] Data pin 3.
 * @property {Pin} Vcc [18] The positive power supply. This pin is not
 *     emulated.
 * @property {Pin} GND [9] The ground. This pin is not emulated.
 */

import Chip from 'components/chip'
import Pin from 'components/pin'
import { pinsToValue, valueToPins, range } from 'utils'

const INPUT = Pin.INPUT
const BIDIRECTIONAL = Pin.BIDIRECTIONAL

export class Ic2114 extends Chip {
  /** @type {Pin[]} */
  #addrPins
  /** @type {Pin[]} */
  #dataPins
  /** @type {Uint32Array} */
  #memory

  constructor() {
    super(
      // Address pins A0...A9
      new Pin(5, 'A0', INPUT),
      new Pin(6, 'A1', INPUT),
      new Pin(7, 'A2', INPUT),
      new Pin(4, 'A3', INPUT),
      new Pin(3, 'A4', INPUT),
      new Pin(2, 'A5', INPUT),
      new Pin(1, 'A6', INPUT),
      new Pin(17, 'A7', INPUT),
      new Pin(16, 'A8', INPUT),
      new Pin(15, 'A9', INPUT),

      // Data pins D0...D3
      new Pin(14, 'D0', BIDIRECTIONAL),
      new Pin(13, 'D1', BIDIRECTIONAL),
      new Pin(12, 'D2', BIDIRECTIONAL),
      new Pin(11, 'D3', BIDIRECTIONAL),

      // Chip select pin. Setting this to low is what begins a read or
      // write cycle.
      new Pin(8, '_CS', INPUT),

      // Write enable pin. If this is low when _CE goes low, then the
      // cycle is a write cycle, otherwise it's a read cycle.
      new Pin(10, '_WE', INPUT),

      // Power supply and ground pins. These are not emulated.
      new Pin(18, 'Vcc'),
      new Pin(9, 'GND'),
    )

    this.#addrPins = [...range(10)].map(pin => this[`A${pin}`])
    this.#dataPins = [...range(4)].map(pin => this[`D${pin}`])
    this.#memory = new Uint32Array(128)

    for (const i of range(10)) {
      this[`A${i}`].addListener(this.#addressListener())
    }
    this._CS.addListener(this.#selectListener())
    this._WE.addListener(this.#writeListener())
  }

  #resolve () {
    const addr = pinsToValue(...this.#addrPins)
    const arrayIndex = addr >> 3
    const bitIndex = addr & 0x07
    return [arrayIndex, bitIndex * 4]
  }

  #read () {
    const [index, shift] = this.#resolve()
    const value = (this.#memory[index] & 0b1111 << shift) >> shift
    valueToPins(value, ...this.#dataPins)
  }

  #write () {
    const value = pinsToValue(...this.#dataPins)
    const [index, shift] = this.#resolve()
    const current = this.#memory[index] & ~(0b1111 << shift)
    this.#memory[index] = current | value << shift
  }

  #addressListener () {
    return () => {
      if (this._CS.low) {
        if (this._WE.high) {
          this.#read()
        } else {
          this.#write()
        }
      }
    }
  }

  #selectListener () {
    return pin => {
      if (pin.high) {
        valueToPins(null, ...this.#dataPins)
      } else if (this._WE.low) {
        this.#write()
      } else {
        this.#read()
      }
    }
  }

  #writeListener () {
    return pin => {
      if (this._CS.low) {
        if (pin.low) {
          this.#write()
        } else {
          this.#read()
        }
      }
    }
  }
}
