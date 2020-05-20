/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, createPinArray, INPUT, OUTPUT, UNCONNECTED } from "components/pin"

export function create6510() {
  const pins = createPinArray(
    // Address bus pins A0...A15.
    createPin(7, "A0", OUTPUT, 0),
    createPin(8, "A1", OUTPUT, 0),
    createPin(9, "A2", OUTPUT, 0),
    createPin(10, "A3", OUTPUT, 0),
    createPin(11, "A4", OUTPUT, 0),
    createPin(12, "A5", OUTPUT, 0),
    createPin(13, "A6", OUTPUT, 0),
    createPin(14, "A7", OUTPUT, 0),
    createPin(15, "A8", OUTPUT, 0),
    createPin(16, "A9", OUTPUT, 0),
    createPin(17, "A10", OUTPUT, 0),
    createPin(18, "A11", OUTPUT, 0),
    createPin(19, "A12", OUTPUT, 0),
    createPin(20, "A13", OUTPUT, 0),
    createPin(22, "A14", OUTPUT, 0),
    createPin(23, "A15", OUTPUT, 0),

    // Data bus pins D0...D7. These are bidirectional, the direction depending on the R__W pin.
    createPin(37, "D0", INPUT),
    createPin(36, "D1", INPUT),
    createPin(35, "D2", INPUT),
    createPin(34, "D3", INPUT),
    createPin(33, "D4", INPUT),
    createPin(32, "D5", INPUT),
    createPin(31, "D6", INPUT),
    createPin(30, "D7", INPUT),

    // I/O Port pins P0...P5. These are bidrectional, the direction depending on the settings in
    // the virtual registers in memory addresses 0x0000 and 0x0001.
    createPin(29, "P0", INPUT),
    createPin(28, "P1", INPUT),
    createPin(27, "P2", INPUT),
    createPin(26, "P3", INPUT),
    createPin(25, "P4", INPUT),
    createPin(24, "P5", INPUT),

    // Clock pins. One is an input (φ0) and one an output (φ2); the signal on the input is merely
    // forwarded to the output as a clock reference for other chips on the board. The names use "O"
    // instead of "φ" for ease of typing.
    createPin(1, "O0", INPUT),
    createPin(39, "O2", OUTPUT, 0),

    // Read/write control. This pin is used to inform memory devices whether the CPU intends to
    // read from them or write to them.
    createPin(38, "R__W", OUTPUT, 1),

    // Address enable control. When this is low, the CPU tri-states its busses to allow other chips
    // to control them.
    createPin(5, "AEC", INPUT),

    // Interrupts. _IRQ is a normal interrupt that can be masked (disabled) by setting the I flag in
    // the P register to 1. _NMI is a non-maskable interrupt that will fire even if the I flag is
    // set.
    createPin(3, "_IRQ", INPUT),
    createPin(4, "_NMI", INPUT),

    // Ready signal. This is normally high. When it goes low, the CPU will complete its remaining
    // write instructions (there can be up to three in a row). It will then go inactive until this
    // pin goes high again.
    createPin(2, "RDY", INPUT),

    // Reset signal. When this goes low, the CPU will reset itself.
    createPin(40, "_RES", INPUT),

    // Power supply and ground pins. These are not emulated.
    createPin(6, "VCC", UNCONNECTED),
    createPin(21, "GND", UNCONNECTED),
  )

  const cpu = {
    pins,
  }

  for (const name in pins) {
    cpu[name] = pins[name]
  }

  return cpu
}
