// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// The module responsible for determining which address the VIC should read next and then
// actually reading from that address. This corresponds to the "Addr. Generator", "Memory
// Interface", and "Refresh Counter" blocks in the 6567 block diagram. This module also
// makes exclusive use of the "VC/RC" and "MC0-7" blocks, but those are implemented in other
// files.
//
// In essence, this module encapulates all of the memory access timing for any raster line
// in any situation. All are done based on the 65-cycle raster line featured in the 6567R8
// (other 6567 revisions use 64 cycles per line, while the PAL-based 6569 uses 63.)
//
// Timing diagrams appear below for a number of situations. Unlike many of the diagrams in
// these commends, these were developed by me based on information from various sources,
// including http://www.zimmers.net/cbmpics/cbm/c64/vic-ii.txt and
// https://ist.uwaterloo.ca/~schepers/MJK/ascii/vic2-pal.txt.
//
// ----------------------------------------------------------------------------------------
//
// Maximum CPU activity - Regular line, no sprites enabled:
//
// Cycle 6                   1 1 1 1 1 1 1 1 1 1 |5 5 5 5 5 5 5 6 6 6 6 6 6
//       5 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 |3 4 5 6 7 8 9 0 1 2 3 4 5 1
//                                               |
//    φ0 _–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–|_–_–_–_–_–_–_–_–_–_–_–_–_–_–
//                                               |
//    BA ––––––––––––––––––––––––––––––––––––––––|––––––––––––––––––––––––––––
//                                               |
//   AEC _–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–|_–_–_–_–_–_–_–_–_–_–_–_–_–_–
//                                               |
//   VIC i 3 i 4 i 5 i 6 i 7 i r r r r r g g g g |g g g i i i i 0 i 1 i 2 i 3
//   CPU  x x x x x x x x x x x x x x x x x x x x| x x x x x x x x x x x x x x
//
// ----------------------------------------------------------------------------------------
//
// Bad line, no sprites enabled:
//
// Cycle 6                   1 1 1 1 1 1 1 1 1 1 |5 5 5 5 5 5 5 6 6 6 6 6 6
//       5 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 |3 4 5 6 7 8 9 0 1 2 3 4 5 1
//                                               |
//    φ0 _–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–|_–_–_–_–_–_–_–_–_–_–_–_–_–_–
//                                               |
//    BA ––––––––––––––––––––––––________________|____––––––––––––––––––––––––
//                                               |
//   AEC _–_–_–_–_–_–_–_–_–_–_–_–_–_–_–__________|_____–_–_–_–_–_–_–_–_–_–_–_–
//                                               |
//   VIC i 3 i 4 i 5 i 6 i 7 i r r r r rcgcgcgcgc|gcgcg i i i i 0 i 1 i 2 i 3
//   CPU  x x x x x x x x x x x x w w w          |     x x x x x x x x x x x x
//
// ----------------------------------------------------------------------------------------
//
// Regular line, sprites 5-7 enabled on this line, sprite 0 and 2 on the next:
//
// Cycle 6                   1 1 1 1 1 1 1 1 1 1 |5 5 5 5 5 5 5 6 6 6 6 6 6
//       5 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 |3 4 5 6 7 8 9 0 1 2 3 4 5 1
//                                               |
//    φ0 _–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–|_–_–_–_–_–_–_–_–_–_–_–_–_–_–
//                                               |
//    BA ––––__________________––––––––––––––––––|––––––––__________________––
//                                               |
//   AEC _–_–_–_–_–_____________–_–_–_–_–_–_–_–_–|_–_–_–_–_–_–_–_____–_–_____–
//                                               |
//   VIC i 3 i 4 i 5sss6sss7sssr r r r r g g g g |g g g i i i i 0sss1 i 2sss3
//   CPU  x x w w w             x x x x x x x x x| x x x x x x x     w w     x
//
// ----------------------------------------------------------------------------------------
//
// Bad line, sprites 5-7 enabled on this line, sprite 0 and 2 on the next:
//
// Cycle 6                   1 1 1 1 1 1 1 1 1 1 |5 5 5 5 5 5 5 6 6 6 6 6 6
//       5 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 |3 4 5 6 7 8 9 0 1 2 3 4 5 1
//                                               |
//    φ0 _–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–|_–_–_–_–_–_–_–_–_–_–_–_–_–_–
//                                               |
//    BA ––––__________________––________________|____––––__________________––
//                                               |
//   AEC _–_–_–_–_–_____________–_–_–_–__________|_____–_–_–_–_–_____–_–_____–
//                                               |
//   VIC i 3 i 4 i 5sss6sss7sssr r r r rcgcgcgcgc|gcgcg i i i i 0sss1 i 2sss3
//   CPU  x x w w w             x w w w          |     x x w w w     w w     x
//
// ----------------------------------------------------------------------------------------
//
// Minimum CPU activity - Bad line, all 8 sprites enabled on this line and the next:
//
// Cycle 6                   1 1 1 1 1 1 1 1 1 1 |5 5 5 5 5 5 5 6 6 6 6 6 6
//       5 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 |3 4 5 6 7 8 9 0 1 2 3 4 5 1
//                                               |
//    φ0 _–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–_–|_–_–_–_–_–_–_–_–_–_–_–_–_–_–
//                                               |
//    BA ______________________––________________|____––––____________________
//                                               |
//   AEC _______________________–_–_–_–__________|_____–_–_–_–_–______________
//                                               |
//   VIC ss3sss4sss5sss6sss7sssr r r r rcgcgcgcgc|gcgcg i i i i 0sss1sss2sss3s
//   CPU                        x w w w          |     x x w w w
//
// ----------------------------------------------------------------------------------------
//
// Legend:
//
// Cycle: The cycle number within the current raster line, 1-65
//    φ0: The clock output provided on pin PHI0 (for reference, not handled by this module)
//    BA: The level of the Bus Available (BA) signal
//   AEC: The level of the Address Enable Control (AEC) signal
//   VIC: The type of access made by the VIC
//        c: Read the video matrix and color RAM (c-access)
//        g: Read the character generator or bitmap data (g-access)
//        #: Read the sprite data pointers for sprites 0-7 (p-access)
//        s: Read the sprite data (s-access)
//        r: DRAM refresh (r-access)
//        i: Idle (i-access)
//   CPU: The type of access made by the CPU
//        x: Regular read or write access
//        w: Write access only; if the CPU is done writing, it stops instead
//
// Note that in the third and fourth diagrams, there are two w's on phase 2 of cycles 62 and
// 63. These would be write-only CPU accesses, but since the CPU had been stopped and has
// not been restarted (its RDY pin that is connected directly to BA has not gone high),
// nothing actually happens.
//
// Much of the information, including the address construction tables under the six address
// functions, come from http://www.zimmers.net/cbmpics/cbm/c64/vic-ii.txt.

import Pin from 'components/pin'
import { bitSet, bitValue, hi4, lo4, modeToPins, pinsToValue, range, valueToPins } from 'utils'
import {
  ACCESS_TYPE_BM_CHAR,
  ACCESS_TYPE_CPU,
  ACCESS_TYPE_IDLE,
  ACCESS_TYPE_REFRESH,
  ACCESS_TYPE_SPR_DATA,
  ACCESS_TYPE_SPR_PTR,
  ACCESS_TYPE_VM_COLOR,
  BMM,
  CB13,
  CYCLES_PER_LINE,
  ECM,
  MCM,
  SPR_PTR_CYCLES,
} from './constants'
import BackgroundRegisters from './bg-registers'
import SpriteRegisters from './spr-registers'

const { INPUT, OUTPUT } = Pin

export default function MemoryController(pins, registers, clock) {
  // A NOTE ABOUT VIC ADDRESS PINS
  //
  // This shows just how much the 6567 was custom made for the Commodore 64, and it also
  // shows some real ingenuity in fitting all this into the limits of the C64.
  //
  // The VIC reads three areas of memory: the main DRAM, the color RAM, and the character
  // ROM. DRAM access requires multiplexing the address through the use of the RAS and CAS
  // pins, while the color RAM and ROM require the full address to be present on its address
  // pins (10 pins in the case of the color RAM and 12 for the character ROM).
  //
  // The VIC itself handles its own multiplexing through the multiplexed address pins A0_A8,
  // A1_A9, A2_A10, A3_A11, A4_A12, and A5_A13, along with the dedicated pins A6 and A7.
  // (The VIC does not itself have an A14 or A15 line; those are provided by CIA 1 in the
  // C64 and are handled by separate hardware, so they aren't considered here.) All of these
  // pins are connected to the "back" bus, the bus terminated on one end by U13 and U25 (a
  // pair of 74LS257 multiplexers that handle CPU address multiplexing )and on the other end
  // by U26 (a 74LS373 transparent latch). The levels of the multiplexed address pins change
  // between activation of RAS and of CAS so that the DRAM can see both bytes at the
  // appropriate times. (A6 and A7 do not change; their multiplexing with A14 and A15 are
  // again handled externally.)
  //
  // The color RAM and character ROM, on the other hand, do *not* care about RAS or CAS and
  // simply want a full address to be available across all their pins at the same time.
  // Furthermore, we don't want the levels of their address pins changing as the VIC does
  // its multiplexing process, as that would make the referenced address change and
  // therefore the levels of their data pins will also change. To this end, the VIC has four
  // more dedicated address pins: A8, A9, A10, and A11, which *always* reflect their bits of
  // the address without changing. (The reason for this stopping at A11 is that the color
  // RAM is 10-bit and the character ROM is 12-bit, so A11 [the 12th address pin] is as high
  // as is needed.) These address pins are connected directly to the main bus rather than
  // the back bus.
  //
  // The values of the other 8 address bits are on muiltiplexed lines of the back bus, but
  // the VIC's RAS pin, in addition to being connected to the DRAM's RAS pins, is connected
  // to the Latch Enable pin of the transparent latch that separates the back bus (with its
  // multiplexed address lines) and the main bus. Thus, when RAS goes low, the low address
  // bits are locked on its outputs, even while the back bus changes behind it.
  //
  // So the color RAM and character ROM are completely isolated from the multiplexed back
  // bus. They only see A0-A7 as the latched low bits coming from U26 and A8-A11 as actual
  // pins from the VIC which are not multiplexed in the first place.

  // Relevant groups of address pins. The first is address pins that are multiplexed between
  // low address bits and high address bits. This also happens to be the group that is used
  // for register reads and therefore need to switch between input and output mode. The
  // other group is simply all address pins.
  const addrMuxPins = [pins.A0_A8, pins.A1_A9, pins.A2_A10, pins.A3_A11, pins.A4_A12, pins.A5_A13]
  const addrPins = [...addrMuxPins, pins.A6, pins.A7, pins.A8, pins.A9, pins.A10, pins.A11]

  // C-access reads are 12 bits, as the top 4 bits come from the color memory, which is
  // connected directly to the D8-D11 pins. Other reads only use the bottom 8 data bits that
  // are connected to the main data bus.
  const data12Pins = [...range(12)].map(pin => pins[`D${pin}`])
  const data8Pins = [...range(8)].map(pin => pins[`D${pin}`])

  // An array to retain character pointers. This is filled by c-accesses, one per character
  // block (40 per line). The information for each of the 40 character pointers must be
  // persisted over 8 raster lines since c-accesses are only done on bad lines.
  const charPointers = new Uint8Array(40)

  // The last sprite data pointer. Since these pointers are re-read every raster line, and
  // since a p-access always happens immediately before the 3 s-accesses, there's no need to
  // retain any pointer after the next p-access.
  let sprPointer = 0

  // The refresh counter. This increments with every DRAM refresn read, which happens 5
  // times per raster line.
  let refresh = 0xff

  // Internal registers for background graphics and sprite graphics. These registers
  // maintain their own values and are used in generating addresses.
  const bg = BackgroundRegisters()
  const spr = [...range(8)].map(num => SpriteRegisters(num, registers))

  // Determines the access type of the next memory read. The access type determines how an
  // address for that read is generated and what happens to the data after its read.
  //
  // There are seven types of access here:
  //
  //   ACCESS_TYPE_VM_COLOR (c-access): read the video matrix and color memory
  //   ACCESS_TYPE_BM_CHAR (g-access): read bitmap/character data
  //   ACCESS_TYPE_SPR_PTR (p-access): read sprite pointers
  //   ACCESS_TYPE_SPR_DATA (s-access): read sprite data
  //   ACCESS_TYPE_REFRESH (r-access): read DRAM for refresh purposes
  //   ACCESS_TYPE_IDLE (i-access): do nothing (reads a fixed address and discards the data)
  //   ACCESS_TYPE_CPU (x-access): do nothing because the CPU controls the address bus
  //
  // There must be a memory access in every phase. If the CPU has bus control, it can read
  // or write as it chooses. If the VIC has bus control, it will make one read every phase,
  // whether it needs the data or not.
  const accessType = () => {
    const { phase, cycle, badLine } = clock

    if (phase === 1) {
      switch (true) {
        case SPR_PTR_CYCLES.includes(cycle):
          return ACCESS_TYPE_SPR_PTR
        case cycle === 2 && badLine && spr[3].dma:
          return ACCESS_TYPE_SPR_DATA
        case cycle === 4 && badLine && spr[4].dma:
          return ACCESS_TYPE_SPR_DATA
        case cycle === 6 && badLine && spr[5].dma:
          return ACCESS_TYPE_SPR_DATA
        case cycle === 8 && badLine && spr[6].dma:
          return ACCESS_TYPE_SPR_DATA
        case cycle === 10 && badLine && spr[7].dma:
          return ACCESS_TYPE_SPR_DATA
        case cycle >= 11 && cycle <= 15:
          return ACCESS_TYPE_REFRESH
        case cycle >= 16 && cycle <= 55:
          return ACCESS_TYPE_BM_CHAR
        case cycle === 61 && badLine && spr[0].dma:
          return ACCESS_TYPE_SPR_DATA
        case cycle === 63 && badLine && spr[1].dma:
          return ACCESS_TYPE_SPR_DATA
        case cycle === 65 && badLine && spr[2].dma:
          return ACCESS_TYPE_SPR_DATA
        default:
          return ACCESS_TYPE_IDLE
      }
    }

    switch (true) {
      case (cycle === 1 || cycle === 2) && badLine && spr[3].dma:
        return ACCESS_TYPE_SPR_DATA
      case (cycle === 3 || cycle === 4) && badLine && spr[4].dma:
        return ACCESS_TYPE_SPR_DATA
      case (cycle === 5 || cycle === 6) && badLine && spr[5].dma:
        return ACCESS_TYPE_SPR_DATA
      case (cycle === 7 || cycle === 8) && badLine && spr[6].dma:
        return ACCESS_TYPE_SPR_DATA
      case (cycle === 9 || cycle === 10) && badLine && spr[7].dma:
        return ACCESS_TYPE_SPR_DATA
      case cycle >= 15 && cycle <= 54 && badLine:
        return ACCESS_TYPE_VM_COLOR
      case (cycle === 60 || cycle === 61) && badLine && spr[0].dma:
        return ACCESS_TYPE_SPR_DATA
      case (cycle === 62 || cycle === 64) && badLine && spr[1].dma:
        return ACCESS_TYPE_SPR_DATA
      case (cycle === 64 || cycle === 65) && badLine && spr[2].dma:
        return ACCESS_TYPE_SPR_DATA
      default:
        return ACCESS_TYPE_CPU
    }
  }

  // Return an address for making an i-access. This is an idle access in display mode, not
  // an idle-mode access (which are g-accesses that occur before the first visible raster
  // line and after the last visible raster line). The address of an i-access is fixed.
  const iAddress = () => 0x3fff

  // Return an address for making an r-access. This is a DRAM address that decrements with
  // each read. The read data is discarded, as the sole purpose of this access is to refresh
  // the dynamic RAM.
  const rAddress = () => {
    const addr = 0x3f00 | refresh
    refresh = refresh - 1 && 0xff
    return addr
  }

  // Determines the address for reading in a c-access. This is used during bad lines to
  // fetch either color data and character poitners (in text modes) or bitmap data (in
  // bitmap modes).
  const cAddress = () => {
    //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
    //  | 13 | 12 | 11 | 10 |  9 |  8 |  7 |  6 |  5 |  4 |  3 |  2 |  1 |  0 |
    //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
    //  |VM13|VM12|VM11|VM10| VC9| VC8| VC7| VC6| VC5| VC4| VC3| VC2| VC1| VC0|
    //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
    const vm = hi4(registers.MEMPTR)
    return (vm << 10) | bg.vc
  }

  // Calculates the memory address to be read during a g-access. The address read depends on
  // the graphics mode. Only five of the modes are actually valid; the other three produce
  // only black pixels, but the address is still read and it is possible to still have
  // mob/data collisions with that otherwise-invisible data.
  const gAddress = () => {
    // In idle mode (which is before the first visible line and after the last), the address
    // is set based solely on the value of ECM
    if (bg.idle) {
      return bitSet(registers.CTRL1, ECM) ? 0x39ff : 0x3fff
    }

    // Representing the mode as a 3-bit number made up of the ECM, BMM, and MCM flags
    // because it makes it a lot easier to switch from
    const mode =
      (bitValue(registers.CTRL1, ECM) << 2) |
      (bitValue(registers.CTRL1, BMM) << 1) |
      bitValue(registers.CTRL2, MCM)

    switch (mode) {
      case 0:
      case 1: {
        // Standard text mode
        // Multicolor text mode
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        //  | 13 | 12 | 11 | 10 |  9 |  8 |  7 |  6 |  5 |  4 |  3 |  2 |  1 |  0 |
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        //  |CB13|CB12|CB11| D7 | D6 | D5 | D4 | D3 | D2 | D1 | D0 | RC2| RC1| RC0|
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        const cb = (lo4(registers.MEMPTR) >> 1) & 0x07
        const data = charPointers[clock.cycle - 16]
        return (cb << 11) | (data << 3) | bg.rc
      }
      case 2:
      case 3: {
        // Standard bitmap mode
        // Multicolor bitmap mode
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        //  | 13 | 12 | 11 | 10 |  9 |  8 |  7 |  6 |  5 |  4 |  3 |  2 |  1 |  0 |
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        //  |CB13| VC9| VC8| VC7| VC6| VC5| VC4| VC3| VC2| VC1| VC0| RC2| RC1| RC0|
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        const cb = bitValue(registers.MEMPTR, CB13)
        const data = bg.vc
        return (cb << 13) | (data << 3) | bg.rc
      }
      case 4:
      case 5: {
        // Extended color text mode
        // Invalid text mode
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        //  | 13 | 12 | 11 | 10 |  9 |  8 |  7 |  6 |  5 |  4 |  3 |  2 |  1 |  0 |
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        //  |CB13|CB12|CB11|  0 |  0 | D5 | D4 | D3 | D2 | D1 | D0 | RC2| RC1| RC0|
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        const cb = (lo4(registers.MEMPTR) >> 1) & 0x07
        const data = charPointers[clock.cycle - 16] & 0x3f
        return (cb << 11) | (data << 3) | bg.rc
      }
      case 6:
      case 7: {
        // Invalid bitmap mode 1
        // Invalid bitmap mode 2
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        //  | 13 | 12 | 11 | 10 |  9 |  8 |  7 |  6 |  5 |  4 |  3 |  2 |  1 |  0 |
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        //  |CB13| VC9| VC8|  0 |  0 | VC5| VC4| VC3| VC2| VC1| VC0| RC2| RC1| RC0|
        //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
        const cb = bitValue(registers.MEMPTR, CB13)
        const data = bg.vc & 0b1100111111
        return (cb << 13) | (data << 3) | bg.rc
      }
      default:
        // Put here to keep the linter happy, all 8 possible cases are already handled and
        // this code is never reached
        return 0
    }
  }

  // Calculates an address at which to make a p-access. The addresses here are at the end of
  // the 1024-byte block of video matrix data (the first 1000 bytes are used for character
  // pointers or bitmap data). The data returned from these addresses are pointers to sprite
  // data.
  const pAddress = num => {
    //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
    //  | 13 | 12 | 11 | 10 |  9 |  8 |  7 |  6 |  5 |  4 |  3 |  2 |  1 |  0 |
    //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
    //  |VM13|VM12|VM11|VM10|  1 |  1 |  1 |  1 |  1 |  1 |  1 |Sprite number |
    //  +----+----+----+----+----+----+----+----+----+----+----+--------------+
    const vm = hi4(registers.MEMPTR)
    return (vm << 10) | 0b1111111000 | num
  }

  // Calculates an address for making an s-access. The address depends on the value that
  // came from the preceding p-access, and the data at the provided address will be raw
  // sprite data.
  const sAddress = num =>
    //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
    //  | 13 | 12 | 11 | 10 |  9 |  8 |  7 |  6 |  5 |  4 |  3 |  2 |  1 |  0 |
    //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
    //  | MP7| MP6| MP5| MP4| MP3| MP2| MP1| MP0| MC5| MC4| MC3| MC2| MC1| MC0|
    //  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+
    (sprPointer << 6) | spr[num].mc

  // Generates the next read address from one of the preceding six functions. Which is used
  // depends on the current state of the clock (the current raster line and clock phase and
  // cycle).
  const generateAddress = () => {
    const { cycle } = clock
    const type = accessType()
    let addr

    switch (type) {
      case ACCESS_TYPE_VM_COLOR:
        addr = cAddress()
        break
      case ACCESS_TYPE_BM_CHAR:
        addr = gAddress()
        break
      case ACCESS_TYPE_SPR_PTR: {
        const num = cycle >= 60 ? (cycle - 60) / 2 : (cycle + 5) / 2
        addr = pAddress(num)
        break
      }
      case ACCESS_TYPE_SPR_DATA: {
        const num = Math.floor(cycle >= 60 ? (cycle - 60) / 2 : (cycle + 5) / 2)
        addr = sAddress(num)
        break
      }
      case ACCESS_TYPE_REFRESH:
        addr = rAddress()
        break
      case ACCESS_TYPE_IDLE:
        addr = iAddress()
        break
      default:
        addr = null
    }

    return [type, addr]
  }

  // Determines the level of the BA pin for this clock cycle and phase. BA is high by
  // default but is pulled low three cycles before a sprite data access or a video matrix
  // access and remains low until that access is complete. This gives the CPU three cycles
  // to complete write accesses before the bus is claimed by the VIC.
  const baLevel = () => {
    const { cycle, badLine } = clock

    // (Graphics)
    // 3. If there is a Bad Line Condition in cycles 12-54, BA is set low and the c-accesses
    //    are started. Once started, one c-access is done in the second phase of every clock
    //    cycle in the range 15-54. The read data is stored in the video matrix/color line
    //    at the position specified by VMLI. These data is internally read from the position
    //    specified by VMLI as well on each g-access in display state.
    if (badLine && cycle >= 12 && cycle <= 54) {
      return 0
    }

    // (Sprites)
    // 5. If the DMA for a sprite is turned on, three s-accesses are done in sequence in the
    //    corresponding cycles assigned to the sprite (see the diagrams in section 3.6.3.).
    //    The p-accesses are always done, even if the sprite is turned off. The read data of
    //    the first access is stored in the upper 8 bits of the shift register, that of the
    //    second one in the middle 8 bits and that of the third one in the lower 8 bits. MC
    //    is incremented by one after each s-access.
    //
    // Not mentioned here is that BA needs to go low three cycles before the p-access is
    // done.
    for (const [num, ptrCycle] of SPR_PTR_CYCLES.entries()) {
      const cycles = [-3, -2, -1, 0, 1].map(n => {
        let c = ptrCycle + n
        if (c <= 0) {
          c += CYCLES_PER_LINE
        }
        return c
      })
      if (spr[num].dma && cycles.includes(cycle)) {
        return 0
      }
    }

    return 1
  }

  // Determines the level of the AEC pin. This is generally low during phase 1 and high
  // during phase 2, but it will remain low while the VIC needs to access memory on phase 2
  // (for pulling character pointers or sprite data). A low value means the VIC has control
  // of the bus, while a high value means the CPU does.
  const aecLevel = () => {
    const { phase, cycle, badLine } = clock

    // (Graphics)
    // 3. If there is a Bad Line Condition in cycles 12-54, BA is set low and the c-accesses
    //    are started. Once started, one c-access is done in the second phase of every clock
    //    cycle in the range 15-54. The read data is stored in the video matrix/color line
    //    at the position specified by VMLI. These data is internally read from the position
    //    specified by VMLI as well on each g-access in display state.
    if (badLine && cycle >= 15 && cycle <= 54) {
      return 0
    }
    // (Sprites)
    // 5. If the DMA for a sprite is turned on, three s-accesses are done in sequence in the
    //    corresponding cycles assigned to the sprite (see the diagrams in section 3.6.3.).
    //    The p-accesses are always done, even if the sprite is turned off. The read data of
    //    the first access is stored in the upper 8 bits of the shift register, that of the
    //    second one in the middle 8 bits and that of the third one in the lower 8 bits. MC
    //    is incremented by one after each s-access.
    for (const [num, ptrCycle] of SPR_PTR_CYCLES.entries()) {
      if (spr[num].dma && (cycle === ptrCycle || cycle === ptrCycle + 1)) {
        return 0
      }
    }

    return phase - 1
  }

  // Performs functions that need to happen before a memory read. This is largely updating
  // the internal graphics registers, though it also includes setting the levels of BA and
  // AEC and ensuring that all address pins are set to outpu tmode.
  const preRead = () => {
    // Refresh counter gets reset at the beginning of each frame
    if (clock.raster === 0 && clock.cycle === 1 && clock.phase === 1) {
      refresh = 0xff
    }

    bg.preRead(clock)
    for (const num of range(8)) {
      spr[num].preRead(clock)
    }

    const ba = baLevel()
    pins.BA.level = ba
    const aec = aecLevel()
    pins.AEC.level = aec

    modeToPins(OUTPUT, ...addrMuxPins)
  }

  // Sets the levels of the address pins to the next address to be read. This actually sets
  // *all* address pins; it's called `lowToPins` because the multiplexed pins take on the
  // value of the low address bits.
  const lowToPins = addr => {
    const low = addr & 0xfff
    valueToPins(low, ...addrPins)
  }

  // Sets the levels of the multiplexed pins to the high address values. This does not
  // change the levels of any non-mux pins.
  const highToPins = addr => {
    const high = (addr >> 8) & 0x3f
    valueToPins(high, ...addrMuxPins)
  }

  // Performs an actual memory read, which in the end is the entire point of this module.
  // The number of bits in the read value depends on the type of access; this type is also
  // used to determine which read values to remember for future reads. Cleanup is done after
  // the read. This includes setting multiplexed address pins back to input mode, setting
  // other address pins to hi-Z, and updating some of the background and sprite registers.
  const read = type => {
    let value

    // D8-D11 are always INPUT anyway
    modeToPins(INPUT, ...data8Pins)

    if (type === ACCESS_TYPE_VM_COLOR) {
      value = pinsToValue(...data12Pins)
    } else {
      value = pinsToValue(...data8Pins)
    }

    // Set only D0-D7; the others remain input pins
    modeToPins(OUTPUT, ...data8Pins)
    valueToPins(null, ...data8Pins)

    if (type === ACCESS_TYPE_VM_COLOR) {
      charPointers[clock.cycle - 15] = value
    } else if (type === ACCESS_TYPE_SPR_PTR) {
      sprPointer = value
    }
    // Don't do anything for other accesses; we care only about persisting pointer
    // information

    modeToPins(INPUT, ...addrMuxPins)
    // While we're setting all address pins here to Z, input pins cannot be set directly
    // and so those pins are ignored by this statement.
    valueToPins(null, ...addrPins)

    bg.postRead(type)
    for (const num of range(8)) {
      spr[num].postRead(type, clock.cycle)
    }

    return value
  }

  // Responsible for setting the sprite Y-expansion latches corresponding to 1-bits in the
  // argument. The VIC immediately sets these latches when the corresponding Y-expansion
  // register bit is cleared; it does nothing when that bit is *set*. This is what makes
  // sprite crunching possible.
  //
  // This function just delegates to the sprite registers affected.
  const clearYExp = cleared => {
    for (const num of range(8)) {
      if (bitSet(cleared, num)) {
        spr[num].clearYexp()
      }
    }
  }

  return {
    clearYExp,
    generateAddress,
    preRead,
    lowToPins,
    highToPins,
    read,
  }
}
