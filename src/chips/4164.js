/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// An emulation of the 4164 64k x 1 bit DRAM chip. It was used in the Apple IIe, IIc, and 128k
// Macintosh; the Atari 800XL; the Commodore 64 and 128; and the Radio Shack Color Computer 2. Later
// editions of the Apple IIc, Commodore 64, Commodore 128, and COCO2 switched to the 4464.
//
// This chip has a memory array of 65,536 bits, each associated with an individual memory address.
// Therefore, to use a 4164 in an 8-bit computer, 8 chips would be required to provide 64k of memory
// (128k Macintosh and Commodore 128 would therefore use 16 of these chips). Each chip was used for
// a single bit in the target address; bit 0 would be stored in the first 4164, bit 1 in the second
// 4164, and so on.
//
// Since the chip has only 8 address pins, an address has to be split into two parts, representing a
// row and a column (presenting the memory array as a physical 256-bit x 256-bit array). These row
// and column addresses are provided to the chip sequentially; the row address is put onto the
// address pins and _RAS is set low, then the column address is put onto the address pins and _CAS
// is set low.
//
// The chip has three basic modes of operation, controlled by the write-enable (_W) pin with some
// help from _CAS. If _W is high, then the chip is in read mode after the address is set. If _W is
// low, the mode depends on whether _W went low before the address was set by putting _CAS low; if
// /_AS went low first, (meaning the chip is in read mode), setting _W low will start
// read-modify-write mode, where the old value of the address is still available on the data-out pin
// (Q) even as the new value is set from the data-in pin (D). If _W goes low before _CAS, then read
// mode is never entered and write mode is enabled instead. The value of D is still written to
// memory, but Q is disconnected and no data is available there.
//
// While _W and _CAS control what is read from and/or written to the chip's memory, /RAS is not
// needed for anything other than setting the row address. Hence /RAS can remain low through
// multiple memory accesses, as long as its address is valid for all of them, allowing reads and
// writes to happen within a single 256-address page of memory without incurring the cost of
// resetting the row address.

import { createPin, INPUT, OUTPUT } from "circuits/pin"
import { LOW, HI_Z } from "circuits/state"

export function create4164() {
  const pins = {
    // The row address strobe. Setting this low latches the values of A0-A7, saving them to be part
    // of the address used to access the memory array.
    _RAS: createPin(4, "_RAS", INPUT),

    // The column address strobe. Setting this low latches A0-A7 into the second part of the memory
    // address. It also initiates read or write mode, depending on the value of _W.
    _CAS: createPin(15, "_CAS", INPUT),

    // The write-enable pin. If this is high, the chip is in read mode; if it and _CAS are low, the
    // chip is in either write or read-modify-write mode, depending on which pin went low first.
    _W: createPin(3, "_W", INPUT),

    // Address pins 0-7
    A0: createPin(5, "A0", INPUT),
    A1: createPin(7, "A1", INPUT),
    A2: createPin(6, "A2", INPUT),
    A3: createPin(12, "A3", INPUT),
    A4: createPin(11, "A4", INPUT),
    A5: createPin(10, "A5", INPUT),
    A6: createPin(13, "A6", INPUT),
    A7: createPin(9, "A7", INPUT),

    // The data input pin. When the chip is in write or read-modify-write mode, the value of this
    // pin will be written to the appropriate bit in the memory array. In read mode, it will be
    // hi-z.
    D: createPin(2, "D", INPUT),

    // The data output pin. This is active in read and read-modify-write mode, set to the value of
    // the bit at the address latched by _RAS and _CAS. In write mode, it is hi-z.
    Q: createPin(14, "Q", OUTPUT, HI_Z),

    // Power supply and no-contact pins. These are not emulated.
    NC: createPin(1, "NC", INPUT, HI_Z),
    VCC: createPin(8, "VCC", INPUT, HI_Z),
    VSS: createPin(16, "VSS", INPUT, HI_Z),
  }

  // 2048 32-bit unsigned integers is 65,536 bits.
  const memory = new Uint32Array(2048)

  // The row is 8 bits of the address and is set here (latched) when the _RAS pin goes low. It is
  // cleared again when _RAS goes high.
  let row = null

  // The col is the other 8 bits of the address and is set here (latched) when the _CAS pin goes
  // low. It is cleared again when _CAS goes high.
  let col = null

  // The single bit of input data. This is set (latched) when the second of the _CAS and _W pins
  // goes low. It is cleared when _W goes back high.
  let data = null

  // Translates the values of the 8 address pins into an 8-bit integer.
  function address() {
    return (
      pins.A0.value |
      (pins.A1.value << 1) |
      (pins.A2.value << 2) |
      (pins.A3.value << 3) |
      (pins.A4.value << 4) |
      (pins.A5.value << 5) |
      (pins.A6.value << 6) |
      (pins.A7.value << 7)
    )
  }

  // Reads the row and col and calculates the specific bit in the memory array to which this row/col
  // combination refers. The first element of the return value is the index of the 32-bit number in
  // the memory array where that bit resides; the second element is the index of the bit within that
  // 32-bit number.
  function resolve() {
    const rowIndex = row << 3
    const colIndex = (col & 0b11100000) >> 5
    const bitIndex = col & 0b00011111

    return [rowIndex | colIndex, bitIndex]
  }

  // Retrieves a single bit from the memory array and sets the state of the Q pin to the value of
  // that bit.
  function read() {
    const [index, bit] = resolve()
    const value = (memory[index] & (1 << bit)) >> bit
    pins.Q.value = value
  }

  // Writes the value of the D pin to a single bit in the memory array.
  function write() {
    const [index, bit] = resolve()
    if (data === 1) {
      memory[index] |= 1 << bit
    } else {
      memory[index] &= ~(1 << bit)
    }
  }

  // Invoked when the _RAS pin changes state. When it goes low, the current states of the A0-A7 pins
  // are latched. The address is released when the _RAS pin goes high.
  //
  // Since this is the only thing that _RAS is used for, it can be left low for multiple memory
  // accesses if its bits of the address remain the same for those accesses. This can speed up
  // reads and writes within the same page by reducing the amount of setup needed for those reads
  // and writes.
  function rasLatch(_ras) {
    if (_ras.low) {
      row = address()
    } else {
      row = null
    }
  }

  // Invoked when the _CAS pin changes state.
  //
  // When _CAS goes low, the current states of the A0-A7 pins are latched in a smiliar way to when
  // _RAS goes low. What else happens depends on whether the _W pin is low. If it is, the chip goes
  // into write mode and the value on the D pin is saved to a memory location referred to by the
  // latched row and column values. If _W is not low, read mode is entered, and the value in that
  // memory location is put onto the Q pin. (Setting the _W pin low after _CAS goes low sets
  // read-modify-write mode; the read that _CAS initiated is still valid.)
  //
  // When /CAS goes high, the Q pin is disconnected and the latched column and data (if there is
  // one) values are cleared.
  function casLatch(_cas) {
    if (_cas.low) {
      col = address()
      if (pins._W.low) {
        data = pins.D.value
        write()
      } else {
        read()
      }
    } else {
      pins.Q.state = HI_Z
      col = null
      data = null
    }
  }

  // Invoked when the _W pin changes state.
  //
  // When _W is high, read mode is enabled (though the actual read will not be available until both
  // _RAS and _CAS are set low, indicating that the address of the read is valid). The D pin is
  // disconnected and the internal latched input data value is cleared.
  //
  // When _W goes low, the write mode that is enabled depends on whether _CAS is already low. If it
  // is, the chip must have been in read mode and now moves into read-modify-write mode. The data
  // value on the Q pin remains valid, and the valus on the D pin is latched and stored at the
  // appropriate memory location.
  //
  // If _CAS is still high when /W goes low, the Q pin is disconnected. Nothing further happens
  // until _CAS goes low; at that point, the chip goes into write mode (data is written to memory
  // but nothing is available to be read).
  function writeLatch(_w) {
    if (_w.low) {
      pins.D.state = LOW
      if (pins._CAS.low) {
        data = pins.D.value
        write()
      } else {
        pins.Q.state = HI_Z
      }
    } else {
      data = null
    }
  }

  pins._RAS.addListener(rasLatch)
  pins._CAS.addListener(casLatch)
  pins._W.addListener(writeLatch)

  const dram = {
    pins,
  }

  for (const name in pins) {
    dram[name] = pins[name]
  }

  return dram
}
