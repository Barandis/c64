// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Cutoff frequencies (high and low) for the external filter. According to the schematic,
// the frequencies are calculated as follows.
//
// LP: R7 = 10k, C37 = 1000pF. Fc = 1 / RC = 1 / (1e4 * 1e-9) = 100000
// HP: R38 = 1k, C113 = 10uF.  Fc = 1 / RC = 1 / (1e3 * 1e-5) = 100
//
// Each is multiplied by 1.048576 so that later division by 1000000 can be done by right
// shifting 20 bits instead.
const LP_CUTOFF = 104858
const HP_CUTOFF = 105

// This represents the non-IC circuitry that comes *after* the 6581 but *before* the output.
// As such, what's emulated here isn't part of the 6581 at all, but is instead a filter
// that exists specifically in the Commodore 64.
//
// The filter consists of a high-pass filter tuned to 16Hz and a low-pass filter tuneed to
// 16kHz.
export default function ExternalFilter() {
  // The value on this clock cycle of the high-pass component of the filter.
  let hp = 0

  // The value on this clock cycle of the low-pass component of the filter.
  let lp = 0

  // The current output level from the external filter.
  let output = 0

  return {
    // Resets the filter. This simply sets all output values to zero. (The parameter is
    // present because other components of the 6581 need to know the level of the RES pin;
    // this filter does not, and reset happens only when the argument is true.)
    reset(value = true) {
      if (value) {
        hp = 0
        lp = 0
        output = 0
      }
    },

    // Called each time the clock cycles to high. This simply recalculates the filter and
    // total outputs from the input signal.
    clock(input) {
      // Calculate filter outputs.
      //
      //   output = lp - hp
      //   lp = lp + Fc(lo) * (input - lp)
      //   hp = hp + Fc(hi) * (lp - hp)
      //
      // The 20-bit shift is because of the need to divide the filter deltas by 1 million,
      // given the 1MHz clock rate. The two cutoff frequencies come pre-multiplied by
      // 1.048576. Shifting the results to the right 20 bits is the same as dividing by
      // 1048576 (2^20). The result is a divide-by-a-million result that is done with a fast
      // bit shift instead of a slow division.
      const dlp = ((LP_CUTOFF >> 8) * (input - lp)) >> 12
      const dhp = (HP_CUTOFF * (lp - hp)) >> 20
      output = lp - hp
      lp += dlp
      hp += dhp
    },

    // Returns the output level of the external filter on this clock cycle.
    get output() {
      return output
    },
  }
}
