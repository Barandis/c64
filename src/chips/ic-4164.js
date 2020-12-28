// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 4164 64k x 1 bit dynamic RAM.
 *
 * The 4164 is a basic DRAM chip that was used in a wide variety of home
 * computers in the 1980's: the Apple IIe, IIc, and 128k Macintosh; the
 * Atari 800XL; the Commodore 64 and 128; and the Radio Shack Color
 * Computer 2. Later editions of the Apple IIc, Commodore 64, Commodore
 * 128, and COCO2 switched to the 4464.
 *
 * This chip has a memory array of 65,536 bits, each associated with an
 * individual memory address. Therefore, to use a 4164 in an 8-bit
 * computer, 8 chips would be required to provide 64k of memory (128k
 * Macintosh and Commodore 128 would therefore use 16 of these chips).
 * Each chip was used for a single bit in the target address; bit 0
 * would be stored in the first 4164, bit 1 in the second 4164, and so
 * on.
 *
 * Since the chip has only 8 address pins, an address has to be split
 * into two parts, representing a row and a column (presenting the
 * memory array as a physical 256-bit x 256-bit array). These row and
 * column addresses are provided to the chip sequentially; the row
 * address is put onto the address pins and  the active-low row address
 * strobe pin `_RAS` is set low, then the column address is put onto the
 * address pins and the active-low column address strobe pin `_CAS` is
 * set low.
 *
 * The chip has three basic modes of operation, controlled by the
 * active-low write-enable (`_WE`) pin with some help from `_CAS`. If
 * `_WE` is high, then the chip is in read mode after the address is
 * set. If `_WE` is low, the mode depends on whether `_WE` went low
 * before the address was set by putting `_CAS` low; if `_CAS` went low
 * first, (meaning the chip was initially in read mode), setting `_WE`
 * low will start read-modify-write mode, where the value at that
 * address is still available on the data-out pin (`Q`) even as the new
 * value is set from the data-in pin (`D`). If `_WE` goes low before
 * `_CAS`, then read mode is never entered and write mode is enabled
 * instead. The value of `D` is still written to memory, but `Q` is
 * disconnected and no data is available there.
 *
 * The Commodore 64 does not use read-modify-write mode. The `_WE` pin
 * is always set to its proper level before the `_CAS` pin goes low.
 *
 * While `_WE` and `_CAS` control what is read from and/or written to
 * the chip's memory, `_RAS` is not needed for anything other than
 * setting the row address. Hence `_RAS` can remain low through multiple
 * memory accesses, as long as its address is valid for all of them,
 * allowing reads and writes to happen within a single 256-address page
 * of memory without incurring the cost of resetting the row address.
 *
 * Unlike most other non-logic chips in the system, there is no
 * dedicated chip-select pin. The combination of `_RAS` and `_CAS` can
 * be regarded as such a pin, and it is used that way in the Commodore
 * 64.
 *
 * The chip comes in a 16-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +---+--+---+
 *      NC |1  +--+ 16| Vss
 *       D |2       15| _CAS
 *     _WE |3       14| Q
 *    _RAS |4       13| A6
 *      A0 |5  4164 12| A3
 *      A2 |6       11| A4
 *      A1 |7       10| A5
 *     Vcc |8        9| A7
 *         +----------+
 * ```
 * *(`Vss` and `Vcc` are ground and power supply pins respectively, and
 * they are not emulated. `NC` stands for "no contact" and is not
 * connected to anything internally.)*
 *
 * In the Commodore 64, U9, U10, U11, U12, U21, U22, U23, and U24 are
 * 4164's, one for each of the 8 bits on the data bus.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic4164|Ic4164}` function.
 *
 * @typedef Ic4164
 * @property {Pin} _RAS [4] The active-low row address strobe pin. When
 *     this pin transitions to low, the value on the 8 address pins is
 *     latched and remembered as 8 bits of the final address.
 * @property {Pin} _CAS [15] The active-low column address strobe pin.
 *     When this pin transitions to low, the value on the 8 address pins
 *     is latched and remembered as other 8 bits of the final address.
 *     If the `_WE` is high at this time, a bit is read from the final
 *     address and put onto the `Q` pin; if `_WE is low, the value on
 *     the `D` pin is stored at the final address.
 * @property {Pin} _WE [3] The active-low write enable pin. If this pin
 *     is low when `_CAS` goes low, the bit on the `D` pin will be
 *     written to memory. If it's high, a bit read from memory will be
 *     put on the `Q` pin.
 * @property {Pin} D [2] The data input pin.
 * @property {Pin} Q [14] The data output pin.
 * @property {Pin} A0 [5] Address pin 0.
 * @property {Pin} A1 [7] Address pin 1.
 * @property {Pin} A2 [6] Address pin 2.
 * @property {Pin} A3 [12] Address pin 3.
 * @property {Pin} A4 [11] Address pin 4.
 * @property {Pin} A5 [10] Address pin 5.
 * @property {Pin} A6 [13] Address pin 6.
 * @property {Pin} A7 [9] Address pin 7.
 * @property {Pin} NC [1] No contact. This pin is not connected to
 *     anything internally; the chip only needs 15 pins and this one is
 *     included to make the physical package a 16-pin DIP.
 * @property {Pin} Vcc [8] The positive power supply. This pin is not
 *     emulated.
 * @property {Pin} Vss [16] The ground. This pin is not emulated.
 */

import Chip from 'components/chip'
import Pin from 'components/pin'
import { pinsToValue, range } from 'utils'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT

export class Ic4164 extends Chip {
  /** @type {Pin[]} */
  #addrPins
  /** @type {Uint32Array} */
  #memory

  /** @type {number} */
  #row = null
  /** @type {number} */
  #col = null
  /** @type {0|1} */
  #data = null

  constructor() {
    super(
      // The row address strobe. Setting this low latches the values of
      // A0-A7, saving them to be part of the address used to access the
      // memory array.
      new Pin(4, '_RAS', INPUT),

      // The column address strobe. Setting this low latches A0-A7 into
      // the second part of the memory address. It also initiates read
      // or write mode, depending on the value of _WE.
      new Pin(15, '_CAS', INPUT),

      // The write-enable pin. If this is high, the chip is in read
      // mode; if it and _CAS are low, the chip is in either write or
      // read-modify-write mode, depending on which pin went low first.
      new Pin(3, '_WE', INPUT),

      // Address pins 0-7
      new Pin(5, 'A0', INPUT),
      new Pin(7, 'A1', INPUT),
      new Pin(6, 'A2', INPUT),
      new Pin(12, 'A3', INPUT),
      new Pin(11, 'A4', INPUT),
      new Pin(10, 'A5', INPUT),
      new Pin(13, 'A6', INPUT),
      new Pin(9, 'A7', INPUT),

      // The data input pin. When the chip is in write or
      // read-modify-write mode, the value of this pin will be written
      // to the appropriate bit in the memory array.
      new Pin(2, 'D', INPUT),

      // The data output pin. This is active in read and
      // read-modify-write mode, set to the value of the bit at the
      // address latched by _RAS and _CAS. In write mode, it is hi-z.
      new Pin(14, 'Q', OUTPUT),

      // Power supply and no-contact pins. These are not emulated.
      new Pin(1, 'NC'),
      new Pin(8, 'Vcc'),
      new Pin(16, 'Vss'),
    )

    this.#addrPins = [...range(8)].map(pin => this[`A${pin}`])

    // 2048 32-bit unsigned integers is 65,536 bits.
    this.#memory = new Uint32Array(2048)

    this._RAS.addListener(this.#rasListener())
    this._CAS.addListener(this.#casListener())
    this._WE.addListener(this.#writeListener())
  }

  // Reads the row and col and calculates the specific bit in the memory
  // array to which this row/col combination refers. The first element
  // of the return value is the index of the 32-bit number in the memory
  // array where that bit resides; the second element is the index of
  // the bit within that 32-bit number.
  #resolve () {
    const rowIndex = this.#row << 3
    const colIndex = (this.#col & 0b11100000) >> 5
    const bitIndex = this.#col & 0b00011111

    return [rowIndex | colIndex, bitIndex]
  }

  // Retrieves a single bit from the memory array and sets the state of
  // the Q pin to the value of that bit.
  #read () {
    const [index, bit] = this.#resolve()
    const value = (this.#memory[index] & 1 << bit) >> bit
    this.Q.level = value
  }

  // Writes the value of the D pin to a single bit in the memory array.
  // If the Q pin is also connected, the value is also sent to it; this
  // happens only in RMW mode and keeps the input and output data pins
  // synched.
  #write () {
    const [index, bit] = this.#resolve()
    if (this.#data === 1) {
      this.#memory[index] |= 1 << bit
    } else {
      this.#memory[index] &= ~(1 << bit)
    }
    if (!this.Q.floating) {
      this.Q.level = this.#data
    }
  }

  // Invoked when the _RAS pin changes state. When it goes low, the
  // current states of the A0-A7 pins are latched. The address is
  // released when the _RAS pin goes high.
  //
  // Since this is the only thing that _RAS is used for, it can be left
  // low for multiple memory accesses if its bits of the address remain
  // the same for those accesses. This can speed up reads and writes
  // within the same page by reducing the amount of setup needed for
  // those reads and writes.
  #rasListener () {
    return pin => {
      if (pin.low) {
        this.#row = pinsToValue(...this.#addrPins)
      } else {
        this.#row = null
      }
    }
  }

  // Invoked when the _CAS pin changes state.
  //
  // When _CAS goes low, the current states of the A0-A7 pins are
  // latched in a smiliar way to when _RAS goes low. What else happens
  // depends on whether the _WE pin is low. If it is, the chip goes into
  // write mode and the value on the D pin is saved to a memory location
  // referred to by the latched row and column values. If _WE is not
  // low, read mode is entered, and the value in that memory location is
  // put onto the Q pin. (Setting the _WE pin low after _CAS goes low
  // sets read-modify-write mode; the read that _CAS initiated is still
  // valid.)
  //
  // When _CAS goes high, the Q pin is disconnected and the latched
  // column and data (if there is one) values are cleared.
  #casListener () {
    return pin => {
      if (pin.low) {
        this.#col = pinsToValue(...this.#addrPins)
        if (this._WE.low) {
          this.#data = this.D.level
          this.#write()
        } else {
          this.#read()
        }
      } else {
        this.Q.float()
        this.#col = null
        this.#data = null
      }
    }
  }

  // Invoked when the _WE pin changes state.
  //
  // When _WE is high, read mode is enabled (though the actual read will
  // not be available until both _RAS and _CAS are set low, indicating
  // that the address of the read is valid). The D pin is disconnected
  // and the internal latched input data value is cleared.
  //
  // When _WE goes low, the write mode that is enabled depends on
  // whether _CAS is already low. If it is, the chip must have been in
  // read mode and now moves into read-modify-write mode. The data value
  // on the Q pin remains valid, and the valus on the D pin is latched
  // and stored at the appropriate memory location.
  //
  // If _CAS is still high when _WE goes low, the Q pin is disconnected.
  // Nothing further happens until _CAS goes low; at that point, the
  // chip goes into write mode (data is written to memory but nothing is
  // available to be read).
  #writeListener () {
    return pin => {
      if (pin.low) {
        this.D.clear()
        if (this._CAS.low) {
          this.#data = this.D.level
          this.#write()
        } else {
          this.Q.float()
        }
      } else {
        this.#data = null
      }
    }
  }
}
