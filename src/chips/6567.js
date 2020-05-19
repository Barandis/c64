/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, OUTPUT } from "components/pin"

export function create6567() {
  const pins = {
    // Address pins. The VIC can address 16k of memory, though the lower and upper 6 bits of the
    // address bus are multiplexed. There are duplicates here; A8, for example, is multiplexed with
    // A0 on pin 24, but it's also available on its own on pin 32.
    //
    // The VIC makes reads from memory as a co-processor, so the address pins are outputs. However,
    // the VIC is also a device with registers that the CPU can read from and write to, and for
    // that reason the bottom 6 address lines are bidirectional (there are 48 registers, so 6 bits
    // is required to address them). The direction of A0...A5 therefore is controlled by the _CS,
    // AEC, and R__W pins.
    A0_A8: createPin(24, "A0_A8", OUTPUT, 0),
    A1_A9: createPin(25, "A1_A9", OUTPUT, 0),
    A2_A10: createPin(26, "A2_A10", OUTPUT, 0),
    A3_A11: createPin(27, "A3_A11", OUTPUT, 0),
    A4_A12: createPin(28, "A4_A12", OUTPUT, 0),
    A5_A13: createPin(29, "A5_A13", OUTPUT, 0),
    A6: createPin(30, "A6", OUTPUT, 0),
    A7: createPin(31, "A7", OUTPUT, 0),
    A8: createPin(32, "A8", OUTPUT, 0),
    A9: createPin(33, "A9", OUTPUT, 0),
    A10: createPin(34, "A10", OUTPUT, 0),
    A11: createPin(23, "A11", OUTPUT, 0),

    // Data bus pins. There are 12 of these because the upper 4 are used to access the 4-bit-wide
    // color RAM. This means that, since the VIC does not write to memory and since only D0...D7
    // are needed to output data from registers, that D8...D11 are input-only. The others are
    // bidirectional as normal, with the direction controlled by R__W.
    D0: createPin(7, "D0", INPUT),
    D1: createPin(6, "D1", INPUT),
    D2: createPin(5, "D2", INPUT),
    D3: createPin(4, "D3", INPUT),
    D4: createPin(3, "D4", INPUT),
    D5: createPin(2, "D5", INPUT),
    D6: createPin(1, "D6", INPUT),
    D7: createPin(39, "D7", INPUT),
    D8: createPin(38, "D8", INPUT),
    D9: createPin(37, "D9", INPUT),
    D10: createPin(36, "D10", INPUT),
    D11: createPin(35, "D11", INPUT),

    // Video outputs. These are analog signals, one for sync/luminance and one for color.
    S_LUM: createPin(15, "S_LUM", OUTPUT, 0),
    COLOR: createPin(14, "COLOR", OUTPUT, 0),

    // DRAM control pins. These control the multiplexing of address bus lines into rows (Row Address
    // Strobe) and columns (Column Address Strobe).
    _RAS: createPin(18, "_RAS", OUTPUT, 1),
    _CAS: createPin(19, "_CAS", OUTPUT, 1),

    // Clock signal pins. Two clocks are inputs - the color clock (φcolor) at 14.31818 MHz and the
    // dot clock (φin) at 8.18 MHz -  and the latter is divided by 8 to create the system clock (φ0)
    // output that drives the CPU. The names here use "O" in place of "φ" for ease of typing.
    OCOLOR: createPin(21, "OCOLOR", INPUT),
    OIN: createPin(22, "OIN", INPUT),
    O0: createPin(17, "O0", OUTPUT, 0),

    // Light pen pin. A transition to low on this pin indicates that a light pen is connected and
    // has activated.
    LP: createPin(9, "LP", INPUT),

    // The bus access pin. This is normally high but can be set low when the VIC needs exclusive
    // access to the address and data bus to perform tasks that take more time than it normally has
    // with the φ2 low cycle. After three clock cycles, the AEC pin can then be held low to take
    // bus control.
    BA: createPin(12, "BA", OUTPUT, 1),

    // Address Enable Control. When this is high, thye CPU has control of the address and data
    // busses. When it is low, the VIC does instead. It normally follows the φ0 output except when
    // using it along with BA.
    AEC: createPin(16, OUTPUT, 0),

    // Interrupt request. The VIC can request interrupts for four reasons: the end of a raster line,
    // a lightpen activation, a sprite-to-sprite collision, or a sprite-to-background collision.
    // When these events occur this pin will go low.
    _IRQ: createPin(8, "_IRQ", OUTPUT, 1),

    // Chip select. A low signal on this indicates that the VIC should be available for reading and
    // writing of its registers. This pin has no effect during the φ2 low cycle (when the VIC has
    // control of the busses).
    _CS: createPin(10, "_CS", INPUT),

    // Read/write control. A high on this indicates that the registers are to be read, while a low
    // indicates they are to be written. Has no effect during the φ2 low cycle.
    R__W: createPin(11, "R__W", INPUT),

    // Power supply and ground pins. These are not emulated.
    VCC: createPin(40, "VCC", INPUT, null),
    VDD: createPin(13, "VDD", INPUT, null),
    GND: createPin(20, "GND", INPUT, null),
  }

  const vic = {
    pins,
  }

  for (const name in pins) {
    vic[name] = pins[name]
  }

  return vic
}
