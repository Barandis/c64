// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ACCESS_TYPE_BM_CHAR } from './constants'

export default function BackgroundRegisters() {
  let vc = 0
  let vcbase = 0
  let rc = 0
  let vmli = 0

  let idle = false
  let lastBadLine = 0

  const preRead = clock => {
    const { phase, cycle, raster, badLine } = clock

    if (!lastBadLine && badLine) {
      idle = false
    }
    lastBadLine = badLine

    // 1. Once somewhere outside of the range of raster lines $30-$f7 (i.e. outside of the
    //    Bad Line range), VCBASE is reset to zero. This is presumably done in raster line
    //    0, the exact moment cannot be determined and is irrelevant.
    if (raster === 0 && cycle === 1 && phase === 1) {
      vcbase = 0
    }

    // 2. In the first phase of cycle 14 of each line, VC is loaded from VCBASE (VCBASE->VC)
    //    and VMLI is cleared. If there is a Bad Line Condition in this phase, RC is also
    //    reset to zero.
    if (cycle === 14 && phase === 1) {
      vc = vcbase
      vmli = 0
      if (badLine) {
        rc = 0
      }
    }

    // (Graphics)
    // 5. In the first phase of cycle 58, the VIC checks if RC=7. If so, the video logic
    //    goes to idle state and VCBASE is loaded from VC (VC->VCBASE). If the video logic
    //    is in display state afterwards (this is always the case if there is a Bad Line
    //    Condition), RC is incremented.
    if (cycle === 58 && phase === 1) {
      if (rc === 7) {
        idle = true
        vcbase = vc
      }
      if (!idle) {
        rc += 1
      }
    }
  }

  const postRead = type => {
    // 4. VC and VMLI are incremented after each g-access in display state.
    if (type === ACCESS_TYPE_BM_CHAR && !idle) {
      vc += 1
      vmli += 1
    }
  }

  return {
    get vc() {
      return vc
    },
    get rc() {
      return rc
    },
    get vmli() {
      return vmli
    },
    get idle() {
      return idle
    },

    preRead,
    postRead,
  }
}
