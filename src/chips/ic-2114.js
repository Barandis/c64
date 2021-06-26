// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 2114 1k x 4 bit static RAM.
//
// Static RAM differs from dynamic RAM (the RAM generally used for computer memory) in that
// it doesn't require periodic refresh cycles in order to retain data. Since no reads or
// writes have to wait for these refresh cycles, static RAM is considerably faster than
// dynamic RAM.
//
// However, it's also considerably more expensive. For this reason, static RAM is generally
// only in use in particularly speed-sensitive applications and in relatively small amounts.
// For instance, modern CPU on-board cache RAM is static. The Commodore 64 uses it for color
// RAM, which is accessed by the VIC at a much higher speed than the DRAM is accessed by the
// CPU.
//
// The 2114 has 1024 addressable locations that hold 4 bits each. Since the Commodore 64 has
// a fixed palette of 16 colors, 4 bits is all it needs. Therefore a single 2114 could store
// 1k of colors and it isn't necessary to use it with a second 2114 to store full 8-bit
// bytes.
//
// The timing of reads and writes is particularly simple. If the chip select pin CS is low,
// the 4 bits stored at the location given on its address pins is put onto the 4 data pins.
// If the write enable pin WE is also low, then the value on the 4 data pins is stored at
// the location given on its address pins. The CS pin can stay low for several cycles of
// reads and writes; it does not require CS to return to high to start the next cycle.
//
// The downside of this simple scheme is that care has to be taken to avoid unwanted writes.
// Address changes should not take place while both CS and WE are low; since address lines
// do not change simultaneously, changing addresses while both pins are low can and will
// cause data to be written to multiple addresses, potentially overwriting legitimate data.
// This is naturally emulated here for the same reason: the chip responds to address line
// changes, and those changes do not happen simultaneously.
//
// Aside from the active-low CS and WE pins, this simple memory device only has the
// necessary address pins to address 1k of memory and the four necessary bidirectional data
// pins. It's packages in an 18-pin dual-inline package with the following pin assignments.
//
//         +---+--+---+
//      A6 |1  +--+ 18| Vcc
//      A5 |2       17| A7
//      A4 |3       16| A8
//      A3 |4       15| A9
//      A0 |5  2114 14| D0
//      A1 |6       13| D1
//      A2 |7       12| D2
//      CS |8       11| D3
//     GND |9       10| WE
//         +----------+
//
// These pin assignments are explained below.
//
// | Pin | Name  | Description                                                             |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 1   | A6    | Address pins. These 10 pins can address 1024 memory locations.          |
// | 2   | A5    |                                                                         |
// | 3   | A4    |                                                                         |
// | 4   | A3    |                                                                         |
// | 5   | A0    |                                                                         |
// | 6   | A1    |                                                                         |
// | 7   | A2    |                                                                         |
// | 15  | A9    |                                                                         |
// | 16  | A8    |                                                                         |
// | 17  | A7    |                                                                         |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 8   | CS    | Active-low chip select pin. Reading and writing can only be done when   |
// |     |       | this pin is low.                                                        |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 9   | GND   | Electrical ground. Not emulated.                                        |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 10  | WE    | Active-low write enable pin. This controls whether the chip is being    |
// |     |       | read from (high) or written to (low).                                   |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 11  | D3    | Data pins. Data to be written to memory must be on these pins, and data |
// | 12  | D2    | read from memory will appear on these pins.                             |
// | 13  | D1    |                                                                         |
// | 14  | D0    |                                                                         |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 18  | Vcc   | +5V power supply. Not emulated.                                         |
//
// In the Commodore 64, U6 is a 2114. As explained above, it was used strictly as RAM for
// storing graphics colors.

import Chip from 'components/chip'
import Pin from 'components/pin'
import Pins from 'components/pins'
import { pinsToValue, valueToPins, range } from 'utils'

const { INPUT, BIDIRECTIONAL } = Pin

export default function Ic2114() {
  const pins = Pins(
    // Address pins A0...A9
    Pin(5, 'A0', INPUT),
    Pin(6, 'A1', INPUT),
    Pin(7, 'A2', INPUT),
    Pin(4, 'A3', INPUT),
    Pin(3, 'A4', INPUT),
    Pin(2, 'A5', INPUT),
    Pin(1, 'A6', INPUT),
    Pin(17, 'A7', INPUT),
    Pin(16, 'A8', INPUT),
    Pin(15, 'A9', INPUT),

    // Data pins D0...D3
    Pin(14, 'D0', BIDIRECTIONAL),
    Pin(13, 'D1', BIDIRECTIONAL),
    Pin(12, 'D2', BIDIRECTIONAL),
    Pin(11, 'D3', BIDIRECTIONAL),

    // Chip select pin. Setting this to low is what begins a read or write cycle.
    Pin(8, 'CS', INPUT),

    // Write enable pin. If this is low when CS goes low, then the cycle is a write cycle,
    // otherwise it's a read cycle.
    Pin(10, 'WE', INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(18, 'Vcc'),
    Pin(9, 'GND'),
  )

  const addrPins = [...range(10)].map(pin => pins[`A${pin}`])
  const dataPins = [...range(4)].map(pin => pins[`D${pin}`])

  // Memory locations are all 4-bit, and we don't have a Uint4Array, so the choice of array
  // size is pretty much arbitrary
  const memory = new Uint32Array(128)

  // Turns whatever is on the address pins into an index into the memory array, along with
  // the index within that 32-bit value of where the desired 4-bit value begins
  const resolve = () => {
    const addr = pinsToValue(...addrPins)
    const arrayIndex = addr >> 3
    const bitIndex = addr & 0x07
    return [arrayIndex, bitIndex * 4]
  }

  // Resolves the address on the address pins and then puts the value from that memory
  // location onto the data pins
  const read = () => {
    const [index, shift] = resolve()
    const value = (memory[index] & (0b1111 << shift)) >> shift
    valueToPins(value, ...dataPins)
  }

  // Resolves the address on the address pins and then puts the value from the data pins
  // into that memory location
  const write = () => {
    const value = pinsToValue(...dataPins)
    const [index, shift] = resolve()
    const current = memory[index] & ~(0b1111 << shift)
    memory[index] = current | (value << shift)
  }

  const addressListener = () => () => {
    if (pins.CS.low) {
      if (pins.WE.high) {
        read()
      } else {
        write()
      }
    }
  }

  const selectListener = () => pin => {
    if (pin.high) {
      valueToPins(null, ...dataPins)
    } else if (pins.WE.low) {
      write()
    } else {
      read()
    }
  }

  const writeListener = () => pin => {
    if (pins.CS.low) {
      if (pin.low) {
        write()
      } else {
        read()
      }
    }
  }

  for (const i of range(10)) {
    pins[`A${i}`].addListener(addressListener())
  }
  pins.CS.addListener(selectListener())
  pins.WE.addListener(writeListener())

  return Chip(pins)
}
