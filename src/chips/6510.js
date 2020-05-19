/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, OUTPUT } from "components/pin"

export function create6510() {
  const pins = {
    // Address bus pins A0...A15.
    A0: createPin(7, "A0", OUTPUT, 0),
    A1: createPin(8, "A1", OUTPUT, 0),
    A2: createPin(9, "A2", OUTPUT, 0),
    A3: createPin(10, "A3", OUTPUT, 0),
    A4: createPin(11, "A4", OUTPUT, 0),
    A5: createPin(12, "A5", OUTPUT, 0),
    A6: createPin(13, "A6", OUTPUT, 0),
    A7: createPin(14, "A7", OUTPUT, 0),
    A8: createPin(15, "A8", OUTPUT, 0),
    A9: createPin(16, "A9", OUTPUT, 0),
    A10: createPin(17, "A10", OUTPUT, 0),
    A11: createPin(18, "A11", OUTPUT, 0),
    A12: createPin(19, "A12", OUTPUT, 0),
    A13: createPin(20, "A13", OUTPUT, 0),
    A14: createPin(22, "A14", OUTPUT, 0),
    A15: createPin(23, "A15", OUTPUT, 0),

    // Data bus pins D0...D7. These are bidirectional, the direction depending on the R__W pin.
    D0: createPin(37, "D0", INPUT),
    D1: createPin(36, "D1", INPUT),
    D2: createPin(35, "D2", INPUT),
    D3: createPin(34, "D3", INPUT),
    D4: createPin(33, "D4", INPUT),
    D5: createPin(32, "D5", INPUT),
    D6: createPin(31, "D6", INPUT),
    D7: createPin(30, "D7", INPUT),

    // I/O Port pins P0...P5. These are bidrectional, the direction depending on the settings in
    // the virtual registers in memory addresses 0x0000 and 0x0001.
    P0: createPin(29, "P0", INPUT),
    P1: createPin(28, "P1", INPUT),
    P2: createPin(27, "P2", INPUT),
    P3: createPin(26, "P3", INPUT),
    P4: createPin(25, "P4", INPUT),
    P5: createPin(24, "P5", INPUT),

    // Clock pins. One is an input (φ0) and one an output (φ2); the signal on the input is merely
    // forwarded to the output as a clock reference for other chips on the board. The names use "O"
    // instead of "φ" for ease of typing.
    O0: createPin(1, "O0", INPUT),
    O2: createPin(39, "O2", OUTPUT, 0),

    // Read/write control. This pin is used to inform memory devices whether the CPU intends to
    // read from them or write to them.
    R__W: createPin(38, "R__W", OUTPUT, 1),

    // Address enable control. When this is low, the CPU tri-states its busses to allow other chips
    // to control them.
    AEC: createPin(5, "AEC", INPUT),

    // Interrupts. _IRQ is a normal interrupt that can be masked (disabled) by setting the I flag in
    // the P register to 1. _NMI is a non-maskable interrupt that will fire even if the I flag is
    // set.
    _IRQ: createPin(3, "_IRQ", INPUT),
    _NMI: createPin(4, "_NMI", INPUT),

    // Ready signal. This is normally high. When it goes low, the CPU will complete its remaining
    // write instructions (there can be up to three in a row). It will then go inactive until this
    // pin goes high again.
    RDY: createPin(2, "RDY", INPUT),

    // Reset signal. When this goes low, the CPU will reset itself.
    _RES: createPin(40, "_RES", INPUT),

    // Power supply and ground pins. These are not emulated.
    VCC: createPin(6, "VCC", INPUT, null),
    GND: createPin(21, "GND", INPUT, null),
  }

  const cpu = []
  cpu.pins = pins

  for (const name in pins) {
    const pin = pins[name]
    cpu[name] = pin
    cpu[pin.num] = pin
  }

  return cpu
}
