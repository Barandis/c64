/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// An emulation for the 2364 8k x 8-bit read-only memory. The variant used in the Commodore 64 was
// the 2364A, which had a slightly faster access time than the vanilla variant.
//
// This, along with its sister chip the 2332, was far and away the simplest memory chip used in the
// C64. With its full complement of address pins and 8-bit wide data path, there was no need to use
// multiple chips or multiplex addresses. Internally it's implemented as a typed array of 8192 8-bit
// unsigned integers. Well, sorta - it takes an array buffer as a parameter to its factory function,
// and it sizes the array to it, but the max addressable memory with the 13 address pins is 8192
// elements, so if there are more they get ignored.
//
// Timing of the read cycle (there is, of course, no write cycle) is done with the chip select (_CS)
// pin. This is also very simple - when the _CS pin goes low, the chip reads the address on its
// address pins and makes the value at that location available on the data pins.
//
// The 2364 was used for KERNAL and BASIC ROM in the C64. These were directly selectable with two of
// the I/O port lines on the 6510, and if it was switched out (or written to), then RAM would be
// available at the same addresses.
//
// On the C64 schematic, the BASIC ROM is U3 and the KERNAL ROM is U4.

import { createPin, INPUT, OUTPUT } from "components/pin"

export function create2364(buffer) {
  const pins = {
    // Address pins A0...A12
    A0: createPin(8, "A0", INPUT),
    A1: createPin(7, "A1", INPUT),
    A2: createPin(6, "A2", INPUT),
    A3: createPin(5, "A3", INPUT),
    A4: createPin(4, "A4", INPUT),
    A5: createPin(3, "A5", INPUT),
    A6: createPin(2, "A6", INPUT),
    A7: createPin(1, "A7", INPUT),
    A8: createPin(23, "A8", INPUT),
    A9: createPin(22, "A9", INPUT),
    A10: createPin(18, "A10", INPUT),
    A11: createPin(19, "A11", INPUT),
    A12: createPin(21, "A12", INPUT),

    // Data pins D0...D7
    D0: createPin(9, "D0", OUTPUT, 0),
    D1: createPin(10, "D1", OUTPUT, 0),
    D2: createPin(11, "D2", OUTPUT, 0),
    D3: createPin(13, "D3", OUTPUT, 0),
    D4: createPin(14, "D4", OUTPUT, 0),
    D5: createPin(15, "D5", OUTPUT, 0),
    D6: createPin(16, "D6", OUTPUT, 0),
    D7: createPin(17, "D7", OUTPUT, 0),

    // Chip select pin. When this goes low, a read cycle is executed based on the address on
    // pins A0...A12. When it's high, the data pins are put into hi-Z.
    _CS: createPin(20, "_CS", INPUT),

    // Power supply and ground pins. These are not emulated.
    VCC: createPin(24, "VCC", INPUT, null),
    GND: createPin(12, "GND", INPUT, null),
  }

  const memory = new Uint8Array(buffer)

  // Translates the values of the 13 address pins into an 13-bit integer.
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
      (pins.A11.value << 11) |
      (pins.A12.value << 12)
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

  pins._CS.addListener(_cs => {
    if (_cs.high) {
      pins.D0.value = null
      pins.D1.value = null
      pins.D2.value = null
      pins.D3.value = null
      pins.D4.value = null
      pins.D5.value = null
      pins.D6.value = null
      pins.D7.value = null
    } else {
      read()
    }
  })

  const rom = {
    pins,
  }

  for (const name in pins) {
    rom[name] = pins[name]
  }

  return rom
}
