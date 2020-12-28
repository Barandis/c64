// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Chip from 'components/chip'
import Pin from 'components/pin'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT

export function Ic6510() {
  const chip = new Chip(
    // Address bus pins A0...A15.
    new Pin(7, 'A0', OUTPUT),
    new Pin(8, 'A1', OUTPUT),
    new Pin(9, 'A2', OUTPUT),
    new Pin(10, 'A3', OUTPUT),
    new Pin(11, 'A4', OUTPUT),
    new Pin(12, 'A5', OUTPUT),
    new Pin(13, 'A6', OUTPUT),
    new Pin(14, 'A7', OUTPUT),
    new Pin(15, 'A8', OUTPUT),
    new Pin(16, 'A9', OUTPUT),
    new Pin(17, 'A10', OUTPUT),
    new Pin(18, 'A11', OUTPUT),
    new Pin(19, 'A12', OUTPUT),
    new Pin(20, 'A13', OUTPUT),
    new Pin(22, 'A14', OUTPUT),
    new Pin(23, 'A15', OUTPUT),

    // Data bus pins D0...D7. These are bidirectional, the direction
    // depending on the R__W pin.
    new Pin(37, 'D0', OUTPUT),
    new Pin(36, 'D1', OUTPUT),
    new Pin(35, 'D2', OUTPUT),
    new Pin(34, 'D3', OUTPUT),
    new Pin(33, 'D4', OUTPUT),
    new Pin(32, 'D5', OUTPUT),
    new Pin(31, 'D6', OUTPUT),
    new Pin(30, 'D7', OUTPUT),

    // I/O Port pins P0...P5. These are bidrectional, the direction
    // depending on the settings in the virtual registers in memory
    // addresses 0x0000 and 0x0001.
    new Pin(29, 'P0', OUTPUT),
    new Pin(28, 'P1', OUTPUT),
    new Pin(27, 'P2', OUTPUT),
    new Pin(26, 'P3', OUTPUT),
    new Pin(25, 'P4', OUTPUT),
    new Pin(24, 'P5', OUTPUT),

    // Clock pins. One is an input (φ0) and one an output (φ2); the
    // signal on the input is merely forwarded to the output as a clock
    // reference for other chips on the board.
    new Pin(1, 'φ0', INPUT),
    new Pin(39, 'φ2', OUTPUT).clear(),

    // Read/write control. This pin is used to inform memory devices
    // whether the CPU intends to read from them or write to them.
    new Pin(38, 'R__W', OUTPUT).set(),

    // Address enable control. When this is low, the CPU tri-states its
    // busses to allow other chips to control them.
    new Pin(5, 'AEC', INPUT),

    // Interrupts. _IRQ is a normal interrupt that can be masked
    // (disabled) by setting the I flag in the P register to 1. _NMI is
    // a non-maskable interrupt that will fire even if the I flag is
    // set.
    new Pin(3, '_IRQ', INPUT),
    new Pin(4, '_NMI', INPUT),

    // Ready signal. This is normally high. When it goes low, the CPU
    // will complete its remaining write instructions (there can be up
    // to three in a row). It will then go inactive until this pin goes
    // high again.
    new Pin(2, 'RDY', INPUT),

    // Reset signal. When this goes low, the CPU will reset itself.
    new Pin(40, '_RES', INPUT),

    // Power supply and ground pins. These are not emulated.
    new Pin(6, 'VCC'),
    new Pin(21, 'GND'),
  )

  return chip
}
