// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 2114 1024 x 4-bit static RAM. This was used in
// the Commodore 64 as color RAM for the VIC. It suited well since there
// were only 16 colors, meaning that 4 bits could hold any value that
// needed to be stored. Thus the 2114 was used as an actual 4-bit
// memory, rather than using two of them to store bytes.
//
// The process of using SRAM is quite a bit easier than using DRAM. In
// this case, everything depends on the state of all of the other pins
// at the point where _CE goes low. At that point, the address pins must
// have already been set, and the _WE pin must have already been set
// depending on whether a read or write is occurring. If _WE is high,
// then the value at the given address will be put onto the data pins.
// Otherwise, whatever is on the data pins will be saved to the given
// memory address.
//
// An implication is that the _CE pin must go low for each memory
// access. In order to access another memory location, _CE must go back
// high so that it can go low once more to trigger the next access
// cycle.
//
// On the C64 schematic, there is a 2114 at U6.

import { Pin, INPUT, BIDIRECTIONAL, UNCONNECTED } from "components/pin"
import { Chip } from "components/chip"
import { pinsToValue, valueToPins } from "utils"

export function Ic2114() {
  const chip = Chip(
    // Address pins A0...A9
    Pin(5, "A0", INPUT),
    Pin(6, "A1", INPUT),
    Pin(7, "A2", INPUT),
    Pin(4, "A3", INPUT),
    Pin(3, "A4", INPUT),
    Pin(2, "A5", INPUT),
    Pin(1, "A6", INPUT),
    Pin(17, "A7", INPUT),
    Pin(16, "A8", INPUT),
    Pin(15, "A9", INPUT),

    // Data pins D0...D3
    Pin(14, "D0", BIDIRECTIONAL),
    Pin(13, "D1", BIDIRECTIONAL),
    Pin(12, "D2", BIDIRECTIONAL),
    Pin(11, "D3", BIDIRECTIONAL),

    // Chip enable pin. Setting this to low is what begins a read or
    // write cycle.
    Pin(8, "_CE", INPUT),

    // Write enable pin. If this is low when _CE goes low, then the
    // cycle is a write cycle, otherwise it's a read cycle.
    Pin(10, "_WE", INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(18, "VCC", UNCONNECTED),
    Pin(9, "GND", UNCONNECTED),
  )

  const addressPins = [
    chip.A0,
    chip.A1,
    chip.A2,
    chip.A3,
    chip.A4,
    chip.A5,
    chip.A6,
    chip.A7,
    chip.A8,
    chip.A9,
  ]
  const dataPins = [chip.D0, chip.D1, chip.D2, chip.D3]
  const memory = new Uint32Array(128)

  // Turns the address currently on the address pins into an index and
  // shift amount for the internal memory array. The index is the array
  // index for that location in the memory array, while the shift amount
  // is the number of bits that a 4-bit value would have to be shifted
  // to be in the right position to write those bits in that array
  // index.
  function resolve() {
    const addr = pinsToValue(...addressPins)
    const arrayIndex = addr >> 3
    const bitIndex = addr & 0x07
    return [arrayIndex, bitIndex * 4]
  }

  // Reads the 4-bit value at the location indicated by the address pins
  // and puts that value on the data pins.
  function read() {
    const [index, shift] = resolve()
    const value = (memory[index] & 0b1111 << shift) >> shift
    valueToPins(value, ...dataPins)
  }

  // Writes the 4-bit value currently on the data pins to the location
  // indicated by the address pins.
  function write() {
    const value = chip.D0.level
                | chip.D1.level << 1
                | chip.D2.level << 2
                | chip.D3.level << 3
    const [index, shift] = resolve()
    const current = memory[index] & ~(0b1111 << shift)
    memory[index] = current | value << shift
  }

  chip._CE.addListener(_ce => {
    if (_ce.high) {
      valueToPins(null, ...dataPins)
    } else if (chip._WE.low) {
      write()
    } else {
      read()
    }
  })

  return chip
}
