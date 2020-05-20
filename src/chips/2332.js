/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// An emulation for the 2332 4k x 8-bit read-only memory. The variant used in the Commodore 64 was
// the 2332A, which had a slightly faster access time than the vanilla variant.
//
// This, along with its sister chip the 2364, was far and away the simplest memory chip used in the
// C64. With its full complement of address pins and 8-bit wide data path, there was no need to use
// multiple chips or multiplex addresses. Internally it's implemented as a typed array of 4096 8-bit
// unsigned integers. Well, sorta - it takes an array buffer as a parameter to its factory function,
// and it sizes the array to it, but the max addressable memory with the 13 address pins is 4096
// elements, so if there are more they get ignored.
//
// Timing of the read cycle (there is, of course, no write cycle) is done with the pair of chip
// select (_CS1 and _CS2) pins. This is also very simple - when both the _CS1 and _CS2 pins goes
// low, the chip reads the address on its address pins and makes the value at that location
// available on the data pins. In the C64, _CS2 was tied to ground and therefore was always
// "enabled", meaning that _CS1 was the only chip select pin that had to be manipulated.
//
// The 2332 was used for CHARACTERROM in the C64. This was directly selectable with one of the I/O
// port lines on the 6510, and if it was switched out (or written to), then RAM would be available
// at the same addresses.
//
// On the C64 schematic, the CHARACTER ROM is U5.

import { newPin, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { newChip } from "components/chip"

export function new2332(buffer) {
  const chip = newChip(
    // Address pins A0...A11
    newPin(8, "A0", INPUT),
    newPin(7, "A1", INPUT),
    newPin(6, "A2", INPUT),
    newPin(5, "A3", INPUT),
    newPin(4, "A4", INPUT),
    newPin(3, "A5", INPUT),
    newPin(2, "A6", INPUT),
    newPin(1, "A7", INPUT),
    newPin(23, "A8", INPUT),
    newPin(22, "A9", INPUT),
    newPin(18, "A10", INPUT),
    newPin(19, "A11", INPUT),

    // Data pins D0...D7
    newPin(9, "D0", OUTPUT, 0),
    newPin(10, "D1", OUTPUT, 0),
    newPin(11, "D2", OUTPUT, 0),
    newPin(13, "D3", OUTPUT, 0),
    newPin(14, "D4", OUTPUT, 0),
    newPin(15, "D5", OUTPUT, 0),
    newPin(16, "D6", OUTPUT, 0),
    newPin(17, "D7", OUTPUT, 0),

    // Chip select pins. When these are both low, a read cycle is executed based on the address on
    // pins A0...A11. When they're high, the data pins are put into hi-Z.
    newPin(20, "_CS1", INPUT),
    newPin(21, "_CS2", INPUT),

    // Power supply and ground pins. These are not emulated.
    newPin(24, "VCC", UNCONNECTED),
    newPin(12, "GND", UNCONNECTED),
  )

  const memory = new Uint8Array(buffer)

  // Translates the values of the 12 address pins into an 12-bit integer.
  function address() {
    return (
      chip.A0.value |
      (chip.A1.value << 1) |
      (chip.A2.value << 2) |
      (chip.A3.value << 3) |
      (chip.A4.value << 4) |
      (chip.A5.value << 5) |
      (chip.A6.value << 6) |
      (chip.A7.value << 7) |
      (chip.A8.value << 8) |
      (chip.A9.value << 9) |
      (chip.A10.value << 10) |
      (chip.A11.value << 11)
    )
  }

  // Reads the 8-bit value at the location indicated by the address pins and puts that value on the
  // data pins.
  function read() {
    const value = memory[address()]
    chip.D0.value = (value & 0b00000001) >> 0
    chip.D1.value = (value & 0b00000010) >> 1
    chip.D2.value = (value & 0b00000100) >> 2
    chip.D3.value = (value & 0b00001000) >> 3
    chip.D4.value = (value & 0b00010000) >> 4
    chip.D5.value = (value & 0b00100000) >> 5
    chip.D6.value = (value & 0b01000000) >> 6
    chip.D7.value = (value & 0b10000000) >> 7
  }

  function chipEnable() {
    if (chip._CS1.low && chip._CS2.low) {
      read()
    } else {
      chip.D0.value = null
      chip.D1.value = null
      chip.D2.value = null
      chip.D3.value = null
      chip.D4.value = null
      chip.D5.value = null
      chip.D6.value = null
      chip.D7.value = null
    }
  }

  chip._CS1.addListener(chipEnable)
  chip._CS2.addListener(chipEnable)

  return chip
}
