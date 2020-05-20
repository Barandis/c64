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

import { createPin, INPUT, OUTPUT, createPinArray, UNCONNECTED } from "components/pin"

export function create2332(buffer) {
  const pins = createPinArray(
    // Address pins A0...A11
    createPin(8, "A0", INPUT),
    createPin(7, "A1", INPUT),
    createPin(6, "A2", INPUT),
    createPin(5, "A3", INPUT),
    createPin(4, "A4", INPUT),
    createPin(3, "A5", INPUT),
    createPin(2, "A6", INPUT),
    createPin(1, "A7", INPUT),
    createPin(23, "A8", INPUT),
    createPin(22, "A9", INPUT),
    createPin(18, "A10", INPUT),
    createPin(19, "A11", INPUT),

    // Data pins D0...D7
    createPin(9, "D0", OUTPUT, 0),
    createPin(10, "D1", OUTPUT, 0),
    createPin(11, "D2", OUTPUT, 0),
    createPin(13, "D3", OUTPUT, 0),
    createPin(14, "D4", OUTPUT, 0),
    createPin(15, "D5", OUTPUT, 0),
    createPin(16, "D6", OUTPUT, 0),
    createPin(17, "D7", OUTPUT, 0),

    // Chip select pins. When these are both low, a read cycle is executed based on the address on
    // pins A0...A11. When they're high, the data pins are put into hi-Z.
    createPin(20, "_CS1", INPUT),
    createPin(21, "_CS2", INPUT),

    // Power supply and ground pins. These are not emulated.
    createPin(24, "VCC", UNCONNECTED),
    createPin(12, "GND", UNCONNECTED),
  )

  const memory = new Uint8Array(buffer)

  // Translates the values of the 12 address pins into an 12-bit integer.
  function address() {
    return (
      pins.A0.value |
      (pins.A1.value << 1) |
      (pins.A2.value << 2) |
      (pins.A3.value << 3) |
      (pins.A4.value << 4) |
      (pins.A5.value << 5) |
      (pins.A6.value << 6) |
      (pins.A7.value << 7) |
      (pins.A8.value << 8) |
      (pins.A9.value << 9) |
      (pins.A10.value << 10) |
      (pins.A11.value << 11)
    )
  }

  // Reads the 8-bit value at the location indicated by the address pins and puts that value on the
  // data pins.
  function read() {
    const value = memory[address()]
    pins.D0.value = (value & 0b00000001) >> 0
    pins.D1.value = (value & 0b00000010) >> 1
    pins.D2.value = (value & 0b00000100) >> 2
    pins.D3.value = (value & 0b00001000) >> 3
    pins.D4.value = (value & 0b00010000) >> 4
    pins.D5.value = (value & 0b00100000) >> 5
    pins.D6.value = (value & 0b01000000) >> 6
    pins.D7.value = (value & 0b10000000) >> 7
  }

  function chipEnable() {
    if (pins._CS1.low && pins._CS2.low) {
      read()
    } else {
      pins.D0.value = null
      pins.D1.value = null
      pins.D2.value = null
      pins.D3.value = null
      pins.D4.value = null
      pins.D5.value = null
      pins.D6.value = null
      pins.D7.value = null
    }
  }

  pins._CS1.addListener(chipEnable)
  pins._CS2.addListener(chipEnable)

  const rom = {
    pins,
  }

  for (const name in pins) {
    rom[name] = pins[name]
  }

  return rom
}
