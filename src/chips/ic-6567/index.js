// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// IRQ <---------------------------------+
//                                       |
//            +---------------+ +-----------------+
//            |Refresh counter| | Interrupt logic |<----------------------+
//            +---------------+ +-----------------+                       |
//        +-+    |               ^                                        |
//  A     |M|    v               |                                        |
//  d     |e|   +-+    +--------------+  +-------+                        |
//  d     |m|   |A|    |Raster counter|->| VC/RC |                        |
//  r     |o|   |d| +->|      X/Y     |  +-------+                        |
//  . <==>|r|   |d| |  +--------------+      |                            |
//  +     |y|   |r| |     | | |              |                            |
//  d     | |   |.|<--------+----------------+ +------------------------+ |
//  a     |i|   |g|===========================>|40×12 bit video matrix-/| |
//  t     |n|<=>|e| |     |   |                |       color line       | |
//  a     |t|   |n| |     |   |                +------------------------+ |
//        |e|   |e| |     |   |                            ||             |
//        |r|   |r| |     |   | +----------------+         ||             |
// BA  <--|f|   |a|============>|8×24 bit sprite |         ||             |
//        |a|   |t|<----+ |   | |  data buffers  |         ||             |
// AEC <--|c|   |o| |   | v   | +----------------+         ||             |
//        |e|   |r| | +-----+ |         ||                 ||             |
//        +-+   +-+ | |MC0-7| |         \/                 \/             |
//                  | +-----+ |  +--------------+   +--------------+      |
//                  |         |  | Sprite data  |   |Graphics data |      |
//        +---------------+   |  |  sequencer   |   |  sequencer   |      |
// RAS <--|               |   |  +--------------+   +--------------+      |
// CAS <--|Clock generator|   |              |         |                  |
// ø0  <--|               |   |              v         v                  |
//        +---------------+   |       +-----------------------+           |
//                ^           |       |          MUX          |           |
//                |           |       | Sprite priorities and |-----------+
// øIN -----------+           |       |  collision detection  |
//                            |       +-----------------------+
//   VC: Video Matrix Counter |                   |
//                            |                   v
//   RC: Row Counter          |            +-------------+
//                            +----------->| Border unit |
//   MC: MOB Data Counter     |            +-------------+
//                            |                   |
//                            v                   v
//                    +----------------+  +----------------+
//                    |Sync generation |  |Color generation|<-------- øCOLOR
//                    +----------------+  +----------------+
//                                   |      |
//                                   v      v
//                                 Video output
//                               (S/LUM and COLOR)

import Chip from 'components/chip'
import Pin from 'components/pin'
import Pins from 'components/pins'
import Registers from 'components/registers'
import { bitValue, modeToPins, pinsToValue, range, valueToPins } from 'utils'
import {
  BORDER,
  CTRL1,
  CTRL2,
  IE,
  IR,
  MEMPTR,
  SDCOL,
  SSCOL,
  RASTER,
  RST8,
  UNUSED1,
  SPRYEX,
} from './constants'
import ClockModule from './clock'
import MemoryController from './memory'

const { INPUT, OUTPUT } = Pin

// Assumed frequency of the clock pulses coming in through the PHIIN pin, in MHz. This is
// divided by the appropriate number to produce a 1Mhz clock for PHI0. The physical C64 uses
// values of 8.181816 MHz (NTSC, used in North America and most of South America) or
// 7.881984 MHz (PAL, used in most of Europe and Asia) on this pin; these are the
// frequencies necessary to produce video sync signals that would work on all TVs. This
// frequency was divided by 8 to get the CPU clock frequency (which is why PAL C64s were
// slightly slower than NTSC C64s).
//
// Since this emulation does not produce RF video signals, and since nothing in the system
// needs to be clocked faster than the CPU, this can just be 1.
const PHIIN_FREQ = 1

export default function Ic6567() {
  let phi = 0
  let divider = 0

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
    Pin(24, 'A0_A8', INPUT),
    Pin(25, 'A1_A9', INPUT),
    Pin(26, 'A2_A10', INPUT),
    Pin(27, 'A3_A11', INPUT),
    Pin(28, 'A4_A12', INPUT),
    Pin(29, 'A5_A13', INPUT),
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
    Pin(17, 'PHI0', OUTPUT).clear(),

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
    Pin(40, 'Vcc'),
    Pin(13, 'Vdd'),
    Pin(20, 'GND'),
  )

  const registers = Registers(
    'SPR0X', //  Sprite 0 X coordinate
    'SPR0Y', //  Sprite 0 Y coordinate
    'SPR1X', //  Sprite 1 X coordinate
    'SPR1Y', //  Sprite 1 Y coordinate
    'SPR2X', //  Sprite 2 X coordinate
    'SPR2Y', //  Sprite 2 Y coordinate
    'SPR3X', //  Sprite 3 X coordinate
    'SPR3Y', //  Sprite 3 Y coordinate
    'SPR4X', //  Sprite 4 X coordinate
    'SPR4Y', //  Sprite 4 Y coordinate
    'SPR5X', //  Sprite 5 X coordinate
    'SPR5Y', //  Sprite 5 Y coordinate
    'SPR6X', //  Sprite 6 X coordinate
    'SPR6Y', //  Sprite 6 Y coordinate
    'SPR7X', //  Sprite 7 X coordinate
    'SPR7Y', //  Sprite 7 Y coordinate
    'SPRMSX', // Sprite X coordinate MSBs
    'CTRL1', //  Control register 1
    'RASTER', // Raster counter
    'LPX', //    Light pen X coordinate
    'LPY', //    Light pen Y coordinate
    'SPREN', //  Sprite enable
    'CTRL2', //  Control register 2
    'SPRYEX', // Sprite Y expansion
    'MEMPTR', // Memory pointers
    'IR', //     Interrupt register
    'IE', //     Interrupt enable
    'SPRDP', //  Sprite data priority
    'SPRMC', //  Sprite multicolor
    'SPRXEX', // Sprite X expansion
    'SSCOL', //  Sprite-sprite collision
    'SDCOL', //  Sprite-data collision
    'BORDER', // Border color
    'BG0', //    Background color 0
    'BG1', //    Background color 1
    'BG2', //    Background color 2
    'BG3', //    Background color 3
    'SPRMC0', // Sprite multicolor 0
    'SPRMC1', // Sprite multicolor 1
    'SPR0C', //  Sprite 0 color
    'SPR1C', //  Sprite 1 color
    'SPR2C', //  Sprite 2 color
    'SPR3C', //  Sprite 3 color
    'SPR4C', //  Sprite 4 color
    'SPR5C', //  Sprite 5 color
    'SPR6C', //  Sprite 6 color
    'SPR7C', //  Sprite 7 color
    // 17 unused registers, named UNUSED1 to UNUSED17, are not actually created. Their
    // contents are always read as 0xff, and writes to them have no effect. This is handled
    // by the readRegister/writeRegister functions without needing actual registers.
  )

  const clock = ClockModule(pins, registers)
  const memory = MemoryController(pins, registers, clock)

  // --------------------------------------------------------------------------------------
  // Reading/writing registers
  //
  // These registers are actually not included in the block diagram above. They're separte
  // from the rest of the subsystems and their contents are regularly read and written by
  // most of the rest of the them.

  const addrRegPins = [...range(24, 30)].map(pin => pins[pin])
  const dataRegPins = [...range(8)].map(pin => pins[`D${pin}`])

  // Some registers have unused bits. These bits are not connected (i.e., are not written
  // on writes) and return 1 on reads. This array has a 1 for each unused bit; these masks
  // are bitwise ORed with the register value on read, and the stored register value on
  // write is the provided value bitwise ORed with the same mask.
  //
  // The seventeen unused registers operate this way on all bits, but that behavior is hard
  // coded into readRegister and writeRegister.
  const REGISTER_MASKS = Array(47)
    .fill(0)
    .map((_, i) => {
      if (i === CTRL2) return 0b11000000
      if (i === MEMPTR) return 0b00000001
      if (i === IR) return 0b01110000
      if (i === IE || i >= BORDER) return 0b11110000
      return 0x00000000
    })

  // Reads a value from a register, accounting for unused bits. This function will also
  // handle things that happen aside from pure reading, like the sprite collision registers
  // resetting on each read.
  const readRegister = index => {
    // Unused registers return all 1s.
    if (index >= UNUSED1) return 0xff
    const value = registers[index] | REGISTER_MASKS[index]
    // Sprite collision data is reset each time it's read.
    if (index === SSCOL || index === SDCOL) {
      registers[index] = 0
    }
    return value
  }

  const writeRegister = (index, value) => {
    // Reading any of the raster bits (the RASTER register and/or the RST8 bit of the CTRL1
    // register) returns the actual raster line number at the time. This is not changeable
    // by writing to these bits. Instead, if any raster bit is written, the value will be
    // stored internally and used to determine upon which line number a raster interrupt
    // should be generated.
    if (index === RASTER) {
      // RASTER isn't written to at all.
      clock.setRasterLatchLow8(value)
    } else if (index === CTRL1) {
      // CTRL1's RST8 bit isn't writable, but the rest are.
      clock.setRasterLatchMsb(bitValue(value, RST8))
      registers.CTRL1 = (registers.CTRL1 & 0x80) | (value & 0x7f)
    } else if (index < UNUSED1 && index !== SSCOL && index !== SDCOL) {
      // Unused registers and sprite collision registers are not writable.
      if (index === SPRYEX) {
        // The memory module needs to know specifically as soon as a Y-expansion bit is
        // cleared. This affects the way that the rest of a sprite is read, if the clearing
        // is done in a specific phase (either cycle 16 phase 1 or cycle 15 phase 2,
        // depending on the desired effect), so this information needs to be conveyed to the
        // memory module immediately.
        const oldValue = registers.SPRYEX
        // The XOR results in 1-bits for any bit whose value is different between the old
        // value and the new, and the AND then zeroes out any of those bits that were 0 in
        // the old value. The result is a number whose bits are 1 if they were 1 in the old
        // value and changed (i.e., were cleared) in the new value, and 0 for anything else.
        const cleared = (oldValue ^ value) & oldValue
        memory.clearYExp(cleared)
      }
      registers[index] = value | REGISTER_MASKS[index]
    }

    // Reset the IRQ pin if the IR register is zeroed
    if (index === IR && (value & 0b10001111) === 0) {
      pins.IRQ.float()
    }
  }

  const enableListener = () => pin => {
    if (pin.high) {
      modeToPins(OUTPUT, ...dataRegPins)
      valueToPins(null, ...dataRegPins)
    } else {
      const index = pinsToValue(...addrRegPins)
      if (pins.R_W.high) {
        valueToPins(readRegister(index), ...dataRegPins)
      } else {
        modeToPins(INPUT, ...dataRegPins)
        writeRegister(index, pinsToValue(...dataRegPins))
      }
    }
  }

  pins.CS.addListener(enableListener())

  // --------------------------------------------------------------------------------------
  // Clock and timing

  const clockListener = () => () => {
    divider += 1
    if (divider >= PHIIN_FREQ) {
      divider = 0
      phi = 1 - phi
      // Reset RAS and CAS before lowering them for this cycle
      pins.RAS.set()
      pins.CAS.set()

      // -- Do PHI0 things here --
      clock.update()
      memory.preRead()

      pins.PHI0.level = phi

      const [type, addr] = memory.generateAddress()

      // -- Do RAS things here --
      memory.lowToPins(addr)
      pins.RAS.clear()
      // -- Do CAS things here --
      memory.highToPins(addr)
      pins.CAS.clear()

      memory.read(type)
    }
  }

  pins.PHIIN.addListener(clockListener())

  return Object.assign(Chip(pins, registers), {
    get clock() {
      return clock
    },
    get memory() {
      return memory
    },
  })
}
