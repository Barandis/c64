// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 4164 64k x 1 bit dynamic RAM.
//
// The 4164 is a basic DRAM chip that was used in a wide variety of home computers in the
// 1980's: the Apple IIe, IIc, and 128k Macintosh; the Atari 800XL; the Commodore 64 and
// 128; and the Radio Shack Color Computer 2. Later editions of the Apple IIc, Commodore 64,
// Commodore 128, and COCO2 switched to the 41464.
//
// This chip has a memory array of 65,536 bits, each associated with an individual memory
// address. Therefore, to use a 4164 in an 8-bit computer, 8 chips would be required to
// provide 64k of memory (128k Macintosh and Commodore 128 would therefore use 16 of these
// chips). Each chip was used for a single bit in the target address; bit 0 would be stored
// in the first 4164, bit 1 in the second 4164, and so on.
//
// Since the chip has only 8 address pins, an address has to be split into two parts,
// representing a row and a column (presenting the memory array as a physical 256-bit x
// 256-bit array). These row and column addresses are provided to the chip sequentially; the
// row address is put onto the address pins and  the active-low row address strobe pin RAS
// is set low, then the column address is put onto the address pins and the active-low
// column address strobe pin CAS is set low.
//
// The chip has three basic modes of operation, controlled by the active-low write-enable
// (WE) pin with some help from CAS. If WE is high, then the chip is in read mode after the
// address is set. If WE is low, the mode depends on whether WE went low before the address
// was set by putting CAS low; if CAS went low first, (meaning the chip was initially in
// read mode), setting WE low will start read-modify-write mode, where the value at that
// address is still available on the data-out pin (Q) even as the new value is set from the
// data-in pin (D). If WE goes low before CAS, then read mode is never entered and write
// mode is enabled instead. The value of D is still written to memory, but Q is disconnected
// and no data is available there.
//
// The Commodore 64 does not use read-modify-write mode. The WE pin is always set to its
// proper level before the CAS pin goes low.
//
// While WE and CAS control what is read from and/or written to the chip's memory, RAS is
// not needed for anything other than setting the row address. Hence RAS can remain low
// through multiple memory accesses, as long as its address is valid for all of them,
// allowing reads and writes to happen within a single 256-address page of memory without
// incurring the cost of resetting the row address. This doesn't happen in the C64; the 6567
// VIC cycles the RAS line once every clock cycle.
//
// Unlike most other non-logic chips in the system, there is no dedicated chip-select pin.
// The combination of RAS and CAS can be regarded as such a pin, and it is used that way in
// the Commodore 64.
//
// The chip comes in a 16-pin dual in-line package with the following pin assignments.
//
//         +---+--+---+
//      NC |1  +--+ 16| Vss
//       D |2       15| CAS
//      WE |3       14| Q
//     RAS |4       13| A6
//      A0 |5  4164 12| A3
//      A2 |6       11| A4
//      A1 |7       10| A5
//     Vcc |8        9| A7
//         +----------+
//
// These pin assignments are explained below.
//
// | Pin | Name  | Description                                                             |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 1   | NC    | No connection. Not emulated.                                            |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 2   | D     | Data input. This pin's value is written to memory when write mode is    |
// |     |       | entered.                                                                |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 3   | WE    | Active-low write enable. If this is low, memory is being written to. If |
// |     |       | it is high, memory is being read.                                       |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 4   | RAS   | Active-low row address strobe. When this goes low, the value of the     |
// |     |       | address pins is stored as the row address for the internal 256x256      |
// |     |       | memory array.                                                           |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 5   | A0    | Address pins. These 8 pins in conjunction with RAS and CAS allow the    |
// | 6   | A2    | the addressing of 65,536 memory locations.                              |
// | 7   | A1    |                                                                         |
// | 9   | A7    |                                                                         |
// | 10  | A5    |                                                                         |
// | 11  | A4    |                                                                         |
// | 12  | A3    |                                                                         |
// | 13  | A6    |                                                                         |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 8   | Vcc   | +5V power supply. Not emulated.                                         |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 14  | Q     | Data output. The value of the memory at the latched location appears on |
// |     |       | this pin when the CAS pin goes low in read mode.                        |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 15  | CAS   | Active-low column address strobe. When this goes low, the value of the  |
// |     |       | address pins is stored as the column address for the internal 256x256   |
// |     |       | memory array, and the location is either read from or written to,       |
// |     |       | depending on the value of WE.                                           |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 16  | Vss   | 0V power supply (ground). Not emulated.                                 |
//
// In the Commodore 64, U9, U10, U11, U12, U21, U22, U23, and U24 are 4164's, one for each
// of the 8 bits on the data bus.

import Chip from 'components/chip'
import Pin from 'components/pin'
import { pinsToValue, range } from 'utils'

const { INPUT, OUTPUT } = Pin

export default function Ic4164() {
  const chip = Chip(
    // The row address strobe. Setting this low latches the values of A0-A7, saving them
    // to be part of the address used to access the memory array.
    Pin(4, 'RAS', INPUT),

    // The column address strobe. Setting this low latches A0-A7 into the second part of
    // the memory address. It also initiates read or write mode, depending on the value of
    // WE.
    Pin(15, 'CAS', INPUT),

    // The write-enable pin. If this is high, the chip is in read mode; if it and CAS are
    // low, the chip is in either write or read-modify-write mode, depending on which pin
    // went low first.
    Pin(3, 'WE', INPUT),

    // Address pins 0-7
    Pin(5, 'A0', INPUT),
    Pin(7, 'A1', INPUT),
    Pin(6, 'A2', INPUT),
    Pin(12, 'A3', INPUT),
    Pin(11, 'A4', INPUT),
    Pin(10, 'A5', INPUT),
    Pin(13, 'A6', INPUT),
    Pin(9, 'A7', INPUT),

    // The data input pin. When the chip is in write or read-modify-write mode, the value
    // of this pin will be written to the appropriate bit in the memory array.
    Pin(2, 'D', INPUT),

    // The data output pin. This is active in read and read-modify-write mode, set to the
    // value of the bit at the address latched by RAS and CAS. In write mode, it is
    // hi-z.
    Pin(14, 'Q', OUTPUT),

    // Power supply and no-contact pins. These are not emulated.
    Pin(1, 'NC'),
    Pin(8, 'Vcc'),
    Pin(16, 'Vss'),
  )

  const addrPins = [...range(8)].map(pin => chip[`A${pin}`])

  // 2048 32-bit unsigned integers is 65,536 bits. The choice of array size is arbitrary,
  // since we don't have a Uint256Array to model it as the 256 x 256 memory array that it is
  // in the physical chip.
  const memory = new Uint32Array(2048)

  let row = null
  let col = null
  let data = null

  // Reads the row and col and calculates the specific bit in the memory array to which this
  // row/col combination refers. The first element of the return value is the index of the
  // 32-bit number in the memory array where that bit resides; the second element is the
  // index of the bit within that 32-bit number.
  const resolve = () => {
    const rowIndex = row << 3
    const colIndex = (col & 0b11100000) >> 5
    const bitIndex = col & 0b00011111

    return [rowIndex | colIndex, bitIndex]
  }

  // Retrieves a single bit from the memory array and sets the state of the Q pin to the
  // value of that bit.
  const read = () => {
    const [index, bit] = resolve()
    const value = (memory[index] & (1 << bit)) >> bit
    chip.Q.level = value
  }

  // Writes the value of the D pin to a single bit in the memory array. If the Q pin is also
  // connected, the value is also sent to it; this happens only in RMW mode and keeps the
  // input and output data pins synched.
  const write = () => {
    const [index, bit] = resolve()
    if (data === 1) {
      memory[index] |= 1 << bit
    } else {
      memory[index] &= ~(1 << bit)
    }
    if (!chip.Q.floating) {
      chip.Q.level = data
    }
  }

  // Invoked when the RAS pin changes state. When it goes low, the current states of the
  // A0-A7 pins are latched. The address is released when the RAS pin goes high.
  //
  // Since this is the only thing that RAS is used for, it can be left low for multiple
  // memory accesses if its bits of the address remain the same for those accesses. This can
  // speed up reads and writes within the same page by reducing the amount of setup needed
  // for those reads and writes. (This does not happen in the C64.)
  const rasListener = () => pin => {
    if (pin.low) {
      row = pinsToValue(...addrPins)
    } else {
      row = null
    }
  }

  // Invoked when the CAS pin changes state.
  //
  // When CAS goes low, the current states of the A0-A7 pins are latched in a smiliar way to
  // when RAS goes low. What else happens depends on whether the WE pin is low. If it is,
  // the chip goes into write mode and the value on the D pin is saved to a memory location
  // referred to by the latched row and column values. If WE is not low, read mode is
  // entered, and the value in that memory location is put onto the Q pin. (Setting the WE
  // pin low after CAS goes low sets read-modify-write mode; the read that CAS initiated is
  // still valid.)
  //
  // When CAS goes high, the Q pin is disconnected and the latched column and data (if there
  // is one) values are cleared.
  const casListener = () => pin => {
    if (pin.low) {
      col = pinsToValue(...addrPins)
      if (chip.WE.low) {
        data = chip.D.level
        write()
      } else {
        read()
      }
    } else {
      chip.Q.float()
      col = null
      data = null
    }
  }

  // Invoked when the WE pin changes state.
  //
  // When WE is high, read mode is enabled (though the actual read will not be available
  // until both RAS and CAS are set low, indicating that the address of the read is valid).
  // The D pin is disconnected and the internal latched input data value is cleared.
  //
  // When WE goes low, the write mode that is enabled depends on whether CAS is already low.
  // If it is, the chip must have been in read mode and now moves into read-modify-write
  // mode. The data value on the Q pin remains valid, and the valus on the D pin is latched
  // and stored at the appropriate memory location.
  //
  // If CAS is still high when WE goes low, the Q pin is disconnected. Nothing further
  // happens until CAS goes low; at that point, the chip goes into write mode (data is
  // written to memory but nothing is available to be read).
  const writeListener = () => pin => {
    if (pin.low) {
      // ? chip.D.clear()
      if (chip.CAS.low) {
        data = chip.D.level
        write()
      } else {
        chip.Q.float()
      }
    } else {
      data = null
    }
  }

  chip.RAS.addListener(rasListener())
  chip.CAS.addListener(casListener())
  chip.WE.addListener(writeListener())

  return chip
}
