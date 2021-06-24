// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Chip from 'components/chip'
import Pin from 'components/pin'

const { INPUT, OUTPUT } = Pin

export default function Ic6567() {
  const chip = Chip(
    // Address pins. The VIC can address 16k of memory, though the lower and upper 6 bits
    // of the address bus are multiplexed. There are duplicates here; A8, for example, is
    // multiplexed with A0 on pin 24, but it's also available on its own on pin 32.
    //
    // The VIC makes reads from memory as a co-processor, so the address pins are outputs.
    // However, the VIC is also a device with registers that the CPU can read from and
    // write to, and for that reason the bottom 6 address lines are bidirectional (there
    // are 48 registers, so 6 bits is required to address them). The direction of A0...A5
    // therefore is controlled by the CS, AEC, and R_W pins.
    Pin(24, 'A0_A8', OUTPUT),
    Pin(25, 'A1_A9', OUTPUT),
    Pin(26, 'A2_A10', OUTPUT),
    Pin(27, 'A3_A11', OUTPUT),
    Pin(28, 'A4_A12', OUTPUT),
    Pin(29, 'A5_A13', OUTPUT),
    Pin(30, 'A6', OUTPUT),
    Pin(31, 'A7', OUTPUT),
    Pin(32, 'A8', OUTPUT),
    Pin(33, 'A9', OUTPUT),
    Pin(34, 'A10', OUTPUT),
    Pin(23, 'A11', OUTPUT),

    // Data bus pins. There are 12 of these because the upper 4 are used to access the
    // 4-bit-wide color RAM. This means that, since the VIC does not write to memory and
    // since only D0...D7 are needed to output data from registers, that D8...D11 are
    // input-only. The others are bidirectional as normal, with the direction controlled
    // by R_W.
    Pin(7, 'D0', INPUT),
    Pin(6, 'D1', INPUT),
    Pin(5, 'D2', INPUT),
    Pin(4, 'D3', INPUT),
    Pin(3, 'D4', INPUT),
    Pin(2, 'D5', INPUT),
    Pin(1, 'D6', INPUT),
    Pin(39, 'D7', INPUT),
    Pin(38, 'D8', INPUT),
    Pin(37, 'D9', INPUT),
    Pin(36, 'D10', INPUT),
    Pin(35, 'D11', INPUT),

    // Video outputs. These are analog signals, one for sync/luminance
    // and one for color.
    Pin(15, 'S_LUM', OUTPUT),
    Pin(14, 'COLOR', OUTPUT),

    // DRAM control pins. These control the multiplexing of address bus lines into rows
    // (Row Address Strobe) and columns (Column Address Strobe).
    Pin(18, 'RAS', OUTPUT).set(),
    Pin(19, 'CAS', OUTPUT).set(),

    // Clock signal pins. Two clocks are inputs - the color clock (PHICOLOR) at 14.31818 MHz
    // and the dot clock (PHIIN) at 8.18 MHz - and the latter is divided by 8 to create the
    // system clock (PHI0) output that drives the CPU.
    Pin(21, 'PHICOLOR', INPUT),
    Pin(22, 'PHIIN', INPUT),
    Pin(17, 'PHI0', OUTPUT),

    // Light pen pin. A transition to low on this pin indicates that a light pen is
    // connected and has activated.
    Pin(9, 'LP', INPUT),

    // The bus access pin. This is normally high but can be set low when the VIC needs
    // exclusive access to the address and data bus to perform tasks that take more time
    // than it normally has with the PHI2 low cycle. After three clock cycles, the AEC pin
    // can then be held low to take bus control.
    Pin(12, 'BA', OUTPUT).set(),

    // Address Enable Control. When this is high, thye CPU has control of the address and
    // data busses. When it is low, the VIC does instead. It normally follows the φ0
    // output except when using it along with BA.
    Pin(16, 'AEC', OUTPUT).clear(),

    // Interrupt request. The VIC can request interrupts for four reasons: the end of a
    // raster line, a lightpen activation, a sprite-to-sprite collision, or a
    // sprite-to-background collision. When these events occur this pin will go low.
    Pin(8, 'IRQ', OUTPUT),

    // Chip select. A low signal on this indicates that the VIC should be available for
    // reading and writing of its registers. This pin has no effect during the PHI2 low
    // cycle (when the VIC has control of the busses).
    Pin(10, 'CS', INPUT),

    // Read/write control. A high on this indicates that the registers are to be read,
    // while a low indicates they are to be written. Has no effect during the PHI2 low
    // cycle.
    Pin(11, 'R_W', INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(40, 'VCC'),
    Pin(13, 'VDD'),
    Pin(20, 'GND'),
  )

  return chip
}
