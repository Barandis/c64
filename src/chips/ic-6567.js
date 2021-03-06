// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Chip from 'components/chip'
import Pin from 'components/pin'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT

export class Ic6567 extends Chip {
  constructor() {
    super(
    // Address pins. The VIC can address 16k of memory, though the lower
    // and upper 6 bits of the address bus are multiplexed. There are
    // duplicates here; A8, for example, is multiplexed with A0 on pin
    // 24, but it's also available on its own on pin 32.
    //
    // The VIC makes reads from memory as a co-processor, so the address
    // pins are outputs. However, the VIC is also a device with
    // registers that the CPU can read from and write to, and for that
    // reason the bottom 6 address lines are bidirectional (there are 48
    // registers, so 6 bits is required to address them). The direction
    // of A0...A5 therefore is controlled by the _CS, AEC, and R__W
    // pins.
      new Pin(24, 'A0_A8', OUTPUT),
      new Pin(25, 'A1_A9', OUTPUT),
      new Pin(26, 'A2_A10', OUTPUT),
      new Pin(27, 'A3_A11', OUTPUT),
      new Pin(28, 'A4_A12', OUTPUT),
      new Pin(29, 'A5_A13', OUTPUT),
      new Pin(30, 'A6', OUTPUT),
      new Pin(31, 'A7', OUTPUT),
      new Pin(32, 'A8', OUTPUT),
      new Pin(33, 'A9', OUTPUT),
      new Pin(34, 'A10', OUTPUT),
      new Pin(23, 'A11', OUTPUT),

      // Data bus pins. There are 12 of these because the upper 4 are
      // used to access the 4-bit-wide color RAM. This means that, since
      // the VIC does not write to memory and since only D0...D7 are
      // needed to output data from registers, that D8...D11 are
      // input-only. The others are bidirectional as normal, with the
      // direction controlled by R__W.
      new Pin(7, 'D0', INPUT),
      new Pin(6, 'D1', INPUT),
      new Pin(5, 'D2', INPUT),
      new Pin(4, 'D3', INPUT),
      new Pin(3, 'D4', INPUT),
      new Pin(2, 'D5', INPUT),
      new Pin(1, 'D6', INPUT),
      new Pin(39, 'D7', INPUT),
      new Pin(38, 'D8', INPUT),
      new Pin(37, 'D9', INPUT),
      new Pin(36, 'D10', INPUT),
      new Pin(35, 'D11', INPUT),

      // Video outputs. These are analog signals, one for sync/luminance
      // and one for color.
      new Pin(15, 'S_LUM', OUTPUT),
      new Pin(14, 'COLOR', OUTPUT),

      // DRAM control pins. These control the multiplexing of address
      // bus lines into rows (Row Address Strobe) and columns (Column
      // Address Strobe).
      new Pin(18, '_RAS', OUTPUT).set(),
      new Pin(19, '_CAS', OUTPUT).set(),

      // Clock signal pins. Two clocks are inputs - the color clock
      // (φcolor) at 14.31818 MHz and the dot clock (φin) at 8.18 MHz -
      // and the latter is divided by 8 to create the system clock (φ0)
      // output that drives the CPU.
      new Pin(21, 'φCOLOR', INPUT),
      new Pin(22, 'φIN', INPUT),
      new Pin(17, 'φ0', OUTPUT),

      // Light pen pin. A transition to low on this pin indicates that a
      // light pen is connected and has activated.
      new Pin(9, 'LP', INPUT),

      // The bus access pin. This is normally high but can be set low
      // when the VIC needs exclusive access to the address and data bus
      // to perform tasks that take more time than it normally has with
      // the φ2 low cycle. After three clock cycles, the AEC pin can
      // then be held low to take bus control.
      new Pin(12, 'BA', OUTPUT).set(),

      // Address Enable Control. When this is high, thye CPU has control
      // of the address and data busses. When it is low, the VIC does
      // instead. It normally follows the φ0 output except when using it
      // along with BA.
      new Pin(16, 'AEC', OUTPUT).clear(),

      // Interrupt request. The VIC can request interrupts for four
      // reasons: the end of a raster line, a lightpen activation, a
      // sprite-to-sprite collision, or a sprite-to-background
      // collision. When these events occur this pin will go low.
      new Pin(8, '_IRQ', OUTPUT),

      // Chip select. A low signal on this indicates that the VIC should
      // be available for reading and writing of its registers. This pin
      // has no effect during the φ2 low cycle (when the VIC has control
      // of the busses).
      new Pin(10, '_CS', INPUT),

      // Read/write control. A high on this indicates that the registers
      // are to be read, while a low indicates they are to be written.
      // Has no effect during the φ2 low cycle.
      new Pin(11, 'R__W', INPUT),

      // Power supply and ground pins. These are not emulated.
      new Pin(40, 'VCC'),
      new Pin(13, 'VDD'),
      new Pin(20, 'GND'),
    )
  }
}
