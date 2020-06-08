// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation for the 2364 8k x 8-bit read-only memory. The variant
// used in the Commodore 64 was the 2364A, which had a slightly faster
// access time than the vanilla variant.
//
// This, along with its sister chip the 2332, was far and away the
// simplest memory chip used in the C64. With its full complement of
// address pins and 8-bit wide data path, there was no need to use
// multiple chips or multiplex addresses. Internally it's implemented as
// a typed array of 8192 8-bit unsigned integers. Well, sorta - it takes
// an array buffer as a parameter to its factory function, and it sizes
// the array to it, but the max addressable memory with the 13 address
// pins is 8192 elements, so if there are more they get ignored.
//
// Timing of the read cycle (there is, of course, no write cycle) is
// done with the chip select (_CS) pin. This is also very simple - when
// the _CS pin goes low, the chip reads the address on its address pins
// and makes the value at that location available on the data pins.
//
// The 2364 was used for KERNAL and BASIC ROM in the C64. These were
// directly selectable with two of the I/O port lines on the 6510, and
// if it was switched out (or written to), then RAM would be available
// at the same addresses.
//
// On the C64 schematic, the BASIC ROM is U3 and the KERNAL ROM is U4.

import { Pin, INPUT, OUTPUT } from "components/pin"
import { Chip } from "components/chip"
import { pinsToValue, valueToPins, range } from "utils"

export function Ic2364(buffer) {
  const chip = Chip(
    // Address pins A0...A12
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
    Pin(21, "A12", INPUT),

    // Data pins D0...D7
    Pin(9, "D0", OUTPUT),
    Pin(10, "D1", OUTPUT),
    Pin(11, "D2", OUTPUT),
    Pin(13, "D3", OUTPUT),
    Pin(14, "D4", OUTPUT),
    Pin(15, "D5", OUTPUT),
    Pin(16, "D6", OUTPUT),
    Pin(17, "D7", OUTPUT),

    // Chip select pin. When this goes low, a read cycle is executed
    // based on the address on pins A0...A12. When it's high, the data
    // pins are put into hi-Z.
    Pin(20, "_CS", INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(24, "VCC"),
    Pin(12, "GND"),
  )

  const addrPins = [...range(13)].map(pin => chip[`A${pin}`])
  const dataPins = [...range(8)].map(pin => chip[`D${pin}`])

  const memory = new Uint8Array(buffer)

  // Reads the 8-bit value at the location indicated by the address pins
  // and puts that value on the data pins.
  function read() {
    const value = memory[pinsToValue(...addrPins)]
    valueToPins(value, ...dataPins)
  }

  chip._CS.addListener(_cs => {
    if (_cs.high) {
      valueToPins(null, ...dataPins)
    } else {
      read()
    }
  })

  return chip
}
