// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Chip from 'components/chip'
import Pin from 'components/pin'
import Pins from 'components/pins'

const { INPUT, OUTPUT } = Pin

export default function Ic6510() {
  const pins = Pins(
    // Address bus pins A0-A15.
    Pin(7, 'A0', OUTPUT),
    Pin(8, 'A1', OUTPUT),
    Pin(9, 'A2', OUTPUT),
    Pin(10, 'A3', OUTPUT),
    Pin(11, 'A4', OUTPUT),
    Pin(12, 'A5', OUTPUT),
    Pin(13, 'A6', OUTPUT),
    Pin(14, 'A7', OUTPUT),
    Pin(15, 'A8', OUTPUT),
    Pin(16, 'A9', OUTPUT),
    Pin(17, 'A10', OUTPUT),
    Pin(18, 'A11', OUTPUT),
    Pin(19, 'A12', OUTPUT),
    Pin(20, 'A13', OUTPUT),
    Pin(22, 'A14', OUTPUT),
    Pin(23, 'A15', OUTPUT),

    // Data bus pins D0-D7. These are bidirectional, the direction depending on the R_W pin.
    Pin(37, 'D0', OUTPUT),
    Pin(36, 'D1', OUTPUT),
    Pin(35, 'D2', OUTPUT),
    Pin(34, 'D3', OUTPUT),
    Pin(33, 'D4', OUTPUT),
    Pin(32, 'D5', OUTPUT),
    Pin(31, 'D6', OUTPUT),
    Pin(30, 'D7', OUTPUT),

    // I/O Port pins P0-P5. These are bidrectional, the direction depending on the settings
    // in the virtual registers in memory addresses $0000 and $0001.
    Pin(29, 'P0', OUTPUT),
    Pin(28, 'P1', OUTPUT),
    Pin(27, 'P2', OUTPUT),
    Pin(26, 'P3', OUTPUT),
    Pin(25, 'P4', OUTPUT),
    Pin(24, 'P5', OUTPUT),

    // Clock pins. One is an input (PHI0) and one an output (PHI2); the signal on the input
    // is merely forwarded to the output as a clock reference for other chips on the board.
    Pin(1, 'PHI0', INPUT),
    Pin(39, 'PHI2', OUTPUT).clear(),

    // Read/write control. This pin is used to inform memory devices whether the CPU
    // intends to read from them or write to them.
    Pin(38, 'R_W', OUTPUT).set(),

    // Address enable control. When this is low, the CPU tri-states its busses to allow
    // other chips to control them.
    Pin(5, 'AEC', INPUT),

    // Interrupts. IRQ is a normal interrupt that can be masked (disabled) by setting the
    // I flag in the P register to 1. NMI is a non-maskable interrupt that will fire even
    // if the I flag is set.
    Pin(3, 'IRQ', INPUT),
    Pin(4, 'NMI', INPUT),

    // Ready signal. This is normally high. When it goes low, the CPU will complete its
    // remaining write instructions (there can be up to three in a row). It will then go
    // inactive until this pin goes high again.
    Pin(2, 'RDY', INPUT),

    // Reset signal. When this goes low, the CPU will reset itself.
    Pin(40, 'RES', INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(6, 'VCC'),
    Pin(21, 'GND'),
  )

  return Chip(pins)
}
