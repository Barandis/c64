// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { bitSet, setBitValue } from 'utils'
import { DEN, ERST, IRQ, IRST, RST8 } from './constants'

// The number of clock cycles in a raster line. This is different between different VIC
// versions and even revisions; the 6569 (the PAL equivalent) has 63 cycles per line, while
// the 6567R56A has 64 cycles per line. The particular one emulated here is the 6567R8,
// which uses 65 cycles per line.
const CYCLES_PER_LINE = 65

// The number of raster lines in a single frame. This again is different between different
// versions of the VIC; the 6567R56A has 262 while the 6569 has 312.
const RASTER_LINES_PER_FRAME = 263

// The minimum and maximum raster lines that produce visible graphic output. This does not
// include the border. Bad line conditions can only happen on a line in the visible range.
const RASTER_MIN_VISIBLE = 48
const RASTER_MAX_VISIBLE = 247

export default function ClockModule(pins, registers) {
  let raster = RASTER_LINES_PER_FRAME
  let cycle = CYCLES_PER_LINE
  let phase = 2

  let den = false
  let badLine = false

  let updateRaster = false
  let rasterLatch = 0

  const update = () => {
    updateRaster = false
    // All of this just ensures that phase resets to 1 after reaching 2, cycle resets to 1
    // after cycle 65, and the raster line resets to 0 after raster line 311. Cycle numbers
    // are 1-based mostly because that's how they are in all of the timing diagrams I have
    // available, and phase is 1-based because the literature invariably talkes about "phase
    // 1" and "phase 2".
    if (phase === 2) {
      phase = 1
      cycle += 1
      if (cycle > CYCLES_PER_LINE) {
        cycle = 1
        raster += 1
        updateRaster = true
        if (raster >= RASTER_LINES_PER_FRAME) {
          raster = 0
        }
      }
    } else {
      phase = 2
    }

    // Raster value is 9 bits - the MSB comes from the RST8 bit in the CTRL1 register; the
    // other 8 bits come from the RASTER register
    if (updateRaster) {
      registers.RASTER = raster & 0xff
      registers.CTRL1 = setBitValue(registers.CTRL1, RST8, (raster & 0x100) >> 8)

      // Fire an interrupt if the raster line has just changed to the one set via register
      // AND if the raster interrupt enable bit is set
      if (raster === rasterLatch && bitSet(registers.IE, ERST)) {
        registers.IR |= (1 << IRQ) | (1 << IRST)
        pins.IRQ.clear()
      }
    }

    // The value of the DEN (display enable) bit on raster line 0x30 is recorded and used
    // for the rest of the frame for determining whether a line is a bad line. (Whether the
    // display is enabled or not cannot be changed in the middle of a frame, even if the
    // register value itself changes in the middle of a frame.) This happens at an
    // "arbitrary" cycle and phase on line $30, so we just choose the first one.
    if (raster === RASTER_MIN_VISIBLE && cycle === 1 && phase === 1) {
      den = bitSet(registers.CTRL1, DEN)
    }

    // From http://www.zimmers.net/cbmpics/cbm/c64/vic-ii.txt:
    //
    // A Bad Line Condition is given at any arbitrary clock cycle, if at the negative edge
    // of ø0 at the beginning of the cycle RASTER >= $30 and RASTER <= $f7 and the lower
    // three bits of RASTER are equal to YSCROLL and if the DEN bit was set during an
    // arbitrary cycle of raster line $30.
    const yscroll = registers.CTRL1 & 0x07
    badLine =
      raster >= RASTER_MIN_VISIBLE &&
      raster <= RASTER_MAX_VISIBLE &&
      (raster & 0x07) === yscroll &&
      den
  }

  update()

  return {
    update,

    get phase() {
      return phase
    },

    get cycle() {
      return cycle
    },

    get raster() {
      return raster
    },

    get badLine() {
      return badLine
    },

    setRasterLatchLow8(value) {
      rasterLatch = (rasterLatch & 0x100) | value
    },

    setRasterLatchMsb(value) {
      rasterLatch = setBitValue(rasterLatch, 8, value)
    },
  }
}
