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
export default class ExternalFilter {
  // The value on this clock cycle of the high-pass component of the filter.
  /** @type {number} */
  #hp

  // The value on this clock cycle of the low-pass component of the filter.
  /** @type {number} */
  #lp

  // The current output level from the external filter.
  /** @type {number} */
  #output

  constructor() {
    this.reset()
  }

  reset(value = true) {
    if (value) {
      this.#hp = 0
      this.#lp = 0
      this.#output = 0
    }
  }

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
    const dlp = ((LP_CUTOFF >> 8) * (input - this.#lp)) >> 12
    const dhp = (HP_CUTOFF * (this.#lp - this.#hp)) >> 20
    this.#output = this.#lp - this.#hp
    this.#lp += dlp
    this.#hp += dhp
  }

  get output() {
    return this.#output
  }
}
