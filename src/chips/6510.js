/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { newChip } from "components/chip"

export function new6510() {
  const chip = newChip(
    // Address bus pins A0...A15.
    newPin(7, "A0", OUTPUT, 0),
    newPin(8, "A1", OUTPUT, 0),
    newPin(9, "A2", OUTPUT, 0),
    newPin(10, "A3", OUTPUT, 0),
    newPin(11, "A4", OUTPUT, 0),
    newPin(12, "A5", OUTPUT, 0),
    newPin(13, "A6", OUTPUT, 0),
    newPin(14, "A7", OUTPUT, 0),
    newPin(15, "A8", OUTPUT, 0),
    newPin(16, "A9", OUTPUT, 0),
    newPin(17, "A10", OUTPUT, 0),
    newPin(18, "A11", OUTPUT, 0),
    newPin(19, "A12", OUTPUT, 0),
    newPin(20, "A13", OUTPUT, 0),
    newPin(22, "A14", OUTPUT, 0),
    newPin(23, "A15", OUTPUT, 0),

    // Data bus pins D0...D7. These are bidirectional, the direction depending on the R__W pin.
    newPin(37, "D0", INPUT),
    newPin(36, "D1", INPUT),
    newPin(35, "D2", INPUT),
    newPin(34, "D3", INPUT),
    newPin(33, "D4", INPUT),
    newPin(32, "D5", INPUT),
    newPin(31, "D6", INPUT),
    newPin(30, "D7", INPUT),

    // I/O Port pins P0...P5. These are bidrectional, the direction depending on the settings in
    // the virtual registers in memory addresses 0x0000 and 0x0001.
    newPin(29, "P0", INPUT),
    newPin(28, "P1", INPUT),
    newPin(27, "P2", INPUT),
    newPin(26, "P3", INPUT),
    newPin(25, "P4", INPUT),
    newPin(24, "P5", INPUT),

    // Clock pins. One is an input (φ0) and one an output (φ2); the signal on the input is merely
    // forwarded to the output as a clock reference for other chips on the board. The names use "O"
    // instead of "φ" for ease of typing.
    newPin(1, "O0", INPUT),
    newPin(39, "O2", OUTPUT, 0),

    // Read/write control. This pin is used to inform memory devices whether the CPU intends to
    // read from them or write to them.
    newPin(38, "R__W", OUTPUT, 1),

    // Address enable control. When this is low, the CPU tri-states its busses to allow other chips
    // to control them.
    newPin(5, "AEC", INPUT),

    // Interrupts. _IRQ is a normal interrupt that can be masked (disabled) by setting the I flag in
    // the P register to 1. _NMI is a non-maskable interrupt that will fire even if the I flag is
    // set.
    newPin(3, "_IRQ", INPUT),
    newPin(4, "_NMI", INPUT),

    // Ready signal. This is normally high. When it goes low, the CPU will complete its remaining
    // write instructions (there can be up to three in a row). It will then go inactive until this
    // pin goes high again.
    newPin(2, "RDY", INPUT),

    // Reset signal. When this goes low, the CPU will reset itself.
    newPin(40, "_RES", INPUT),

    // Power supply and ground pins. These are not emulated.
    newPin(6, "VCC", UNCONNECTED),
    newPin(21, "GND", UNCONNECTED),
  )

  return chip
}
