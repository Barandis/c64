// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { bitSet } from 'utils'
import { ACCESS_TYPE_SPR_DATA, SPR_PTR_CYCLES } from './constants'

export default function SpriteRegisters(num, registers) {
  let mc = 0
  let mcbase = 0
  let yexp = true
  let dma = false
  let display = false

  const ptrCycle = SPR_PTR_CYCLES[num]

  const preRead = clock => {
    const { phase, cycle, raster } = clock

    // 7. In the first phase of cycle 15, it is checked if the expansion flip flop is set.
    //    If so, MCBASE is incremented by 2.
    if (cycle === 15 && phase === 1) {
      if (yexp) {
        mcbase += 2
      }
    }

    // 8. In the first phase of cycle 16, it is checked if the expansion flip flop is set.
    //    If so, MCBASE is incremented by 1. After that, the VIC checks if MCBASE is equal
    //    to 63 and turns of the DMA and the display of the sprite if it is.
    if (cycle === 16 && phase === 1) {
      if (yexp) {
        mcbase += 1
      }
      if (mcbase === 63) {
        dma = false
        display = false
      }
    }

    // 2. If the MxYE bit is set in the first phase of cycle 55, the expansion flip flop is
    //    inverted.
    if (cycle === 55 && phase === 1) {
      if (bitSet(registers.SPRYEX, num)) {
        yexp = !yexp
      }
    }

    // 3. In the first phases of cycle 55 and 56, the VIC checks for every sprite if the
    //    corresponding MxE bit in register $d015 is set and the Y coordinate of the sprite
    //    (odd registers $d001-$d00f) match the lower 8 bits of RASTER. If this is the case
    //    and the DMA for the sprite is still off, the DMA is switched on, MCBASE is
    //    cleared, and if the MxYE bit is set the expansion flip flip is reset.
    if ((cycle === 55 || cycle === 56) && phase === 1) {
      if (bitSet(registers.SPREN, num) && registers[`SPR${num}Y`] === (raster & 0xff) && !dma) {
        dma = true
        mcbase[num] = 0
        if (bitSet(registers.SPRYEX, num)) {
          yexp = false
        }
      }
    }

    // 4. In the first phase of cycle 58, the MC of every sprite is loaded from its
    //    belonging MCBASE (MCBASE->MC) and it is checked if the DMA for the sprite is
    //    turned on and the Y coordinate of the sprite matches the lower 8 bits of RASTER.
    //    If this is the case, the display of the sprite is turned on.
    if (cycle === 58 && phase === 1) {
      mc = mcbase
      if (dma && registers[`SPR${num}Y`] === (raster & 0xff)) {
        display = true
      }
    }
  }

  const postRead = (type, cycle) => {
    // 5. If the DMA for a sprite is turned on, three s-accesses are done in sequence in the
    //    corresponding cycles assigned to the sprite (see the diagrams in section 3.6.3.).
    //    The p-accesses are always done, even if the sprite is turned off. The read data of
    //    the first access is stored in the upper 8 bits of the shift register, that of the
    //    second one in the middle 8 bits and that of the third one in the lower 8 bits. MC
    //    is incremented by one after each s-access.
    if (type === ACCESS_TYPE_SPR_DATA && (cycle === ptrCycle || cycle === ptrCycle + 1)) {
      mc += 1
    }
  }

  return {
    get mc() {
      return mc
    },
    get dma() {
      return dma
    },
    get display() {
      return display
    },

    clearYexp() {
      // 1. The expansion flip flip is set as long as the bit in MxYE in register $d017
      //    corresponding to the sprite is cleared.
      //
      // This was not clear to me as I read it. Other literature has indicated that it means
      // that the latch bit (called "flip flip" here and almost certainly actually meaning
      // "flip flop") is set *when* the appropriate bit in the register (SPRYEX in this code)
      // is cleared. The latch bit does not change if the bit in the register is set.
      //
      // This is actually vital because setting that latch bit (but turning off Y-expansion)
      // at a precise cycle/phase and then turning Y-expansion back on without affecting the
      // latch bit is what enables sprite crunching.
      yexp = true
    },
    preRead,
    postRead,
  }
}
