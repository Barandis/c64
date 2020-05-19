/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, OUTPUT } from "circuits/pin"

export function create2332(buffer) {
  const pins = {
    // Address pins A0...A11
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

    // Data pins D0...D7
    D0: createPin(9, "D0", OUTPUT, 0),
    D1: createPin(10, "D1", OUTPUT, 0),
    D2: createPin(11, "D2", OUTPUT, 0),
    D3: createPin(13, "D3", OUTPUT, 0),
    D4: createPin(14, "D4", OUTPUT, 0),
    D5: createPin(15, "D5", OUTPUT, 0),
    D6: createPin(16, "D6", OUTPUT, 0),
    D7: createPin(17, "D7", OUTPUT, 0),

    // Chip select pins. When these are both low, a read cycle is executed based on the address on
    // pins A0...A11. When they're high, the data pins are put into hi-Z.
    _CS1: createPin(20, "_CS1", INPUT),
    _CS2: createPin(21, "_CS2", INPUT),

    // Power supply and ground pins. These are not emulated.
    VCC: createPin(24, "VCC", INPUT, null),
    GND: createPin(12, "GND", INPUT, null),
  }

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
