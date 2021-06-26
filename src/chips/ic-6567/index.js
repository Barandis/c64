// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Chip from 'components/chip'
import Pin from 'components/pin'
import Pins from 'components/pins'
import Registers from 'components/registers'
import { pinsToValue, range, valueToPins } from 'utils'
import { MOBDAT, MOBMOB, UNUSED1 } from './constants'

const { INPUT, OUTPUT } = Pin

export default function Ic6567() {
  const pins = Pins(
    // Address pins. The VIC can address 16k of memory, though the lower and upper 6 bits of
    // the address bus are multiplexed. There are duplicates here; A8, for example, is
    // multiplexed with A0 on pin 24, but it's also available on its own on pin 32.
    //
    // The VIC makes reads from memory as a co-processor, so the address pins are outputs.
    // However, the VIC is also a device with registers that the CPU can read from and write
    // to, and for that reason the bottom 6 address lines are bidirectional (there are 48
    // registers, so 6 bits is required to address them). The direction of A0-A5 therefore
    // is controlled by the CS, AEC, and R_W pins.
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
    // since only D0-D7 are needed to output data from registers, that D8-D11 are
    // input-only. The others are bidirectional as normal, with the direction controlled by
    // R_W.
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

    // Video outputs. These are analog signals, one for sync/luminance and one for color.
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
    // data busses. When it is low, the VIC does instead. It normally follows the φ0 output
    // except when using it along with BA.
    Pin(16, 'AEC', OUTPUT).clear(),

    // Interrupt request. The VIC can request interrupts for four reasons: the end of a
    // raster line, a lightpen activation, a sprite-to-sprite collision, or a
    // sprite-to-background collision. When these events occur this pin will go low.
    Pin(8, 'IRQ', OUTPUT),

    // Chip select. A low signal on this indicates that the VIC should be available for
    // reading and writing of its registers. This pin has no effect during the PHI2 low
    // cycle (when the VIC has control of the busses).
    Pin(10, 'CS', INPUT),

    // Read/write control. A high on this indicates that the registers are to be read, while
    // a low indicates they are to be written. Has no effect during the PHI2 low cycle.
    Pin(11, 'R_W', INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(40, 'VCC'),
    Pin(13, 'VDD'),
    Pin(20, 'GND'),
  )

  const registers = Registers(
    'MOB0X', //  Sprite 0 X coordinate
    'MOB0Y', //  Sprite 0 Y coordinate
    'MOB1X', //  Sprite 1 X coordinate
    'MOB1Y', //  Sprite 1 Y coordinate
    'MOB2X', //  Sprite 2 X coordinate
    'MOB2Y', //  Sprite 2 Y coordinate
    'MOB3X', //  Sprite 3 X coordinate
    'MOB3Y', //  Sprite 3 Y coordinate
    'MOB4X', //  Sprite 4 X coordinate
    'MOB4Y', //  Sprite 4 Y coordinate
    'MOB5X', //  Sprite 5 X coordinate
    'MOB5Y', //  Sprite 5 Y coordinate
    'MOB6X', //  Sprite 6 X coordinate
    'MOB6Y', //  Sprite 6 Y coordinate
    'MOB7X', //  Sprite 7 X coordinate
    'MOB7Y', //  Sprite 7 Y coordinate
    'MOBMSB', // Sprite X coordinate MSBs
    'CTRL1', //  Control register 1
    'RASTER', // Raster counter
    'LPX', //    Light pen X coordinate
    'LPY', //    Light pen Y coordinate
    'MOBEN', //  Sprite enable
    'CTRL2', //  Control register 2
    'MOBYE', //  Sprite Y expansion
    'MEMPTR', // Memory pointers
    'IR', //     Interrupt register
    'IE', //     Interrupt enable
    'MOBDP', //  Sprite data priority
    'MOBMC', //  Sprite multicolor
    'MOBXE', //  Sprite X expansion
    'MOBMOB', // Sprite-sprite collision
    'MOBDAT', // Sprite-data collision
    'BORDER', // Border color
    'BG0', //    Background color 0
    'BG1', //    Background color 1
    'BG2', //    Background color 2
    'BG3', //    Background color 3
    'MOBMC0', // Sprite multicolor 0
    'MOBMC1', // Sprite multicolor 1
    'MOB0C', //  Sprite 0 color
    'MOB1C', //  Sprite 1 color
    'MOB2C', //  Sprite 2 color
    'MOB3C', //  Sprite 3 color
    'MOB4C', //  Sprite 4 color
    'MOB5C', //  Sprite 5 color
    'MOB6C', //  Sprite 6 color
    'MOB7C', //  Sprite 7 color
    // 17 unused registers, named UNUSED1 to UNUSED17, are not actually created. Their
    // contents are always read as 0xff, and writes to them have no effect. This is handled
    // by the readRegister/writeRegister functions without needing actual registers.
  )

  const regAddrPins = [...range(24, 30, true)].map(pin => pins[pin])
  const regDataPins = [...range(8)].map(pin => pins[`D${pin}`])

  const readRegister = index => {
    if (index >= UNUSED1) return 0xff
    const value = registers[index]
    if (index === MOBMOB || index === MOBDAT) {
      registers[index] = 0
    }
    return value
  }

  const writeRegister = (index, value) => {
    if (index < UNUSED1 && index !== MOBMOB && index !== MOBDAT) {
      registers[index] = value
    }
  }

  const enableListener = () => pin => {
    if (pin.low) {
      const index = pinsToValue(...regAddrPins)
      if (pins.R_W.low) {
        const value = pinsToValue(...regDataPins)
        writeRegister(index, value)
      } else {
        const value = readRegister(index)
        valueToPins(...regDataPins, value)
      }
    }
  }

  pins.CS.addListener(enableListener())

  return Chip(pins, registers)
}
