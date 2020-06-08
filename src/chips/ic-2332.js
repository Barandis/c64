// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation for the 2332 4k x 8-bit read-only memory. The variant
// used in the Commodore 64 was the 2332A, which had a slightly faster
// access time than the vanilla variant.
//
// This, along with its sister chip the 2364, was far and away the
// simplest memory chip used in the C64. With its full complement of
// address pins and 8-bit wide data path, there was no need to use
// multiple chips or multiplex addresses. Internally it's implemented as
// a typed array of 4096 8-bit unsigned integers. Well, sorta - it takes
// an array buffer as a parameter to its factory function, and it sizes
// the array to it, but the max addressable memory with the 13 address
// pins is 4096 elements, so if there are more they get ignored.
//
// Timing of the read cycle (there is, of course, no write cycle) is
// done with the pair of chip select (_CS1 and _CS2) pins. This is also
// very simple - when both the _CS1 and _CS2 pins goes low, the chip
// reads the address on its address pins and makes the value at that
// location available on the data pins. In the C64, _CS2 was tied to
// ground and therefore was always "enabled", meaning that _CS1 was the
// only chip select pin that had to be manipulated.
//
// The 2332 was used for CHARACTERROM in the C64. This was directly
// selectable with one of the I/O port lines on the 6510, and if it was
// switched out (or written to), then RAM would be available at the same
// addresses.
//
// On the C64 schematic, the CHARACTER ROM is U5.

import { Chip, Pin, INPUT, OUTPUT } from "components"
import { pinsToValue, valueToPins, range } from "utils"

export function Ic2332(buffer) {
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
    Pin(24, "VCC"),
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

  function chipEnable() {
    if (chip._CS1.low && chip._CS2.low) {
      read()
    } else {
      valueToPins(null, ...dataPins)
    }
  }

  chip._CS1.addListener(chipEnable)
  chip._CS2.addListener(chipEnable)

  return chip
}
