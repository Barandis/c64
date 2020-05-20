/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// An emulation of the 2114 1024 x 4-bit static RAM. This was used in the Commodore 64 as color RAM
// for the VIC. It suited well since there were only 16 colors, meaning that 4 bits could hold any
// value that needed to be stored. Thus the 2114 was used as an actual 4-bit memory, rather than
// using two of them to store bytes.
//
// The process of using SRAM is quite a bit easier than using DRAM. In this case, everything depends
// on the state of all of the other pins at the point where _CE goes low. At that point, the address
// pins must have already been set, and the _WE pin must have already been set depending on whether
// a read or write is occurring. If _WE is high, then the value at the given address will be put
// onto the data pins. Otherwise, whatever is on the data pins will be saved to the given memory
// address.
//
// An implication is that the _CE pin must go low for each memory access. In order to access another
// memory location, _CE must go back high so that it can go low once more to trigger the next access
// cycle.
//
// On the C64 schematic, there is a 2114 at U6.

import { newPin, INPUT, BIDIRECTIONAL, UNCONNECTED } from "components/pin"
import { newChip } from "components/chip"

export function new2114() {
  const chip = newChip(
    // Address pins A0...A9
    newPin(5, "A0", INPUT),
    newPin(6, "A1", INPUT),
    newPin(7, "A2", INPUT),
    newPin(4, "A3", INPUT),
    newPin(3, "A4", INPUT),
    newPin(2, "A5", INPUT),
    newPin(1, "A6", INPUT),
    newPin(17, "A7", INPUT),
    newPin(16, "A8", INPUT),
    newPin(15, "A9", INPUT),

    // Data pins D0...D3
    newPin(14, "D0", BIDIRECTIONAL, 0),
    newPin(13, "D1", BIDIRECTIONAL, 0),
    newPin(12, "D2", BIDIRECTIONAL, 0),
    newPin(11, "D3", BIDIRECTIONAL, 0),

    // Chip enable pin. Setting this to low is what begins a read or write cycle.
    newPin(8, "_CE", INPUT),

    // Write enable pin. If this is low when _CE goes low, then the cycle is a write cycle,
    // otherwise it's a read cycle.
    newPin(10, "_WE", INPUT),

    // Power supply and ground pins. These are not emulated.
    newPin(18, "VCC", UNCONNECTED),
    newPin(9, "GND", UNCONNECTED),
  )

  const memory = new Uint32Array(128)

  // Translates the values of the 10 address pins into an 10-bit integer.
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
      (chip.A9.value << 9)
    )
  }

  // Turns the address currently on the address pins into an index and shift amount for the internal
  // memory array. The index is the array index for that location in the memory array, while the
  // shift amount is the number of bits that a 4-bit value would have to be shifted to be in the
  // right position to write those bits in that array index.
  function resolve() {
    const addr = address()
    const arrayIndex = addr >> 3
    const bitIndex = addr & 0x07
    return [arrayIndex, bitIndex * 4]
  }

  // Reads the 4-bit value at the location indicated by the address pins and puts that value on the
  // data pins.
  function read() {
    const [index, shift] = resolve()
    const value = (memory[index] & (0b1111 << shift)) >> shift
    chip.D0.value = (value & 0b0001) >> 0
    chip.D1.value = (value & 0b0010) >> 1
    chip.D2.value = (value & 0b0100) >> 2
    chip.D3.value = (value & 0b1000) >> 3
  }

  // Writes the 4-bit value currently on the data pins to the location indicated by the address
  // pins.
  function write() {
    const value = chip.D0.value | (chip.D1.value << 1) | (chip.D2.value << 2) | (chip.D3.value << 3)
    const [index, shift] = resolve()
    const current = memory[index] & ~(0b1111 << shift)
    memory[index] = current | (value << shift)
  }

  chip._CE.addListener(_ce => {
    if (_ce.high) {
      chip.D0.value = null
      chip.D1.value = null
      chip.D2.value = null
      chip.D3.value = null
    } else if (chip._WE.low) {
      write()
    } else {
      read()
    }
  })

  return chip
}
