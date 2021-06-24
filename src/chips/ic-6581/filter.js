// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { bitSet, hi4, lo4, range } from 'utils'
import { DSCNV3, FILTBP, FILTEXT, FILTHP, FILTLP, FILTV1, FILTV2, FILTV3 } from './constants'

// Sample cutoff frequencies for different values of FCHI and FCLO.
//
// Each element is a tuple consisting of the total register value (combining FCHI and FCLO)
// and the actual cutoff frequency in hertz. Each of these comes from measurements of actual
// Commodore 64's made by the folks who created reSID. (I don't have actual hardware to make
// these measurements.)
//
// These are used as control points in a spline interpolation function to come up with the
// cutoff frequency for *any* FCHI and FCLO register values. There are repeats for the end
// points so that there are sufficient control points for interpolations at very low and
// very high register values. There are also repeats around a discontinuity in the middle
// of the register range (between 1023 and 1024) for the same reason.
const CUTOFF_SAMPLES = [
  // [Register value, cutoff frequency (Hz)], // FCHI FCLO
  [0, 220], //      0x00 0x00 (repeated end point)
  [0, 220], //      0x00 0x00
  [128, 230], //    0x10 0x00
  [256, 250], //    0x20 0x00
  [384, 300], //    0x30 0x00
  [512, 420], //    0x40 0x00
  [640, 780], //    0x50 0x00
  [768, 1600], //   0x60 0x00
  [832, 2300], //   0x68 0x00
  [896, 3200], //   0x70 0x00
  [960, 4300], //   0x78 0x00
  [992, 5000], //   0x7c 0x00
  [1008, 5400], //  0x7e 0x00
  [1016, 5700], //  0x7f 0x00
  [1023, 6000], //  0x7f 0x07
  [1023, 6000], //  0x7f 0x07 (discontinuity)
  [1024, 4600], //  0x80 0x00
  [1024, 4600], //  0x80 0x00
  [1032, 4800], //  0x81 0x00
  [1056, 5300], //  0x84 0x00
  [1088, 6000], //  0x88 0x00
  [1120, 6600], //  0x8c 0x00
  [1152, 7200], //  0x90 0x00
  [1280, 9500], //  0xa0 0x00
  [1408, 12000], // 0xb0 0x00
  [1536, 14500], // 0xc0 0x00
  [1664, 16000], // 0xd0 0x00
  [1792, 17100], // 0xe0 0x00
  [1920, 17700], // 0xf0 0x00
  [2047, 18000], // 0xff 0x07
  [2047, 18000], // 0xff 0x07 (repeated end point)
]

// The mixer after the filter in the 6581 has a small DC offset. This offset was measured
// on a physical 6581 to be -0.06V, the difference between the output pin voltage with a
// zero sound output at zero volume versus at full volume. This is -1/18 the dynamic range
// of one voice.
const OFFSET = Math.round(-0xfff * (0xff / 18)) >> 7

// ----------------------------------------------------------------------------------------
// INTERPOLATION
//
// The purpose of the next three functions are to interpolate the cutoff frequency of any
// FCHI/FCLO register setting based on the known values in the table above.
//
// The method used here is to use the table values as points (with the register value as x
// and the cutoff frequency as y) and then to calculate piecewise cubic polynomials using
// these points as control points. This will give us an interpolated value of y for *any*
// value of x, not just the ones in the table.
//
// Each curve segment is specified by four control points. (These will be referred to as
// p0, p1, p2, and p3, which are made up of x and y values (x0, y0), (x1, y1), (x2, y2), and
// (x3, y3) respectively.) p0 and p3 are used to determine the "shape" of the curve segment,
// but only the values between p1 and p2 (inclusive) will be calculated for each segment.
//
// The first step is to calculate approximations of the derivatives of the curve segment at
// p1 and p2; these are simply the differences between the two control points surrounding
// them:
//
//     f'(x1) = k1 = (y2 - y0) / (x2 - x0)
//     f'(x2) = k2 = (y3 - y1) / (x3 - x1)
//
// Then, with two points (xi, yi) and (xj, yj), along with their derivatives ki and kj, the
// following set of linear equations can be derived.
//
//     | 1  xi   xi^2   xi^3 | | d |   | yi |
//     |     1  2xi    3xi^2 | | c | = | ki |
//     | 1  xj   xj^2   xj^3 | | b |   | yj |
//     |     1  2xj    3xj^2 | | a |   | kj |
//
// Solving with Gaussian elimination, we get the coefficients for the cubic polynomial
// representing that curve segment. For f(x) = ax^3 + bx^2 + cx + d, and taking dx = xj - xi
// and dy = yj - yi, the coefficients are
//
//     a = (ki + kj - 2 * dy / dx) / (dx * dx)
//     b = ((kj - ki) / dx - 3 * a * (xi + xj)) / 2
//     c = ki - (3 * a * xi + 2 * b) * xi
//     d = yi - ((xi * a + b) * xi + c) * xi
//
// With these coefficients now known, we can solve for y for each x between x1 and x2 with
// any number of methods. We've used forward differencing here just because it's kinda neat.
// This finds the next point by using first, second, and third derivatives to find the next
// point and then the next of each of those derivatives.
//
//     y = ((a * x1 + b) * x1 + c) * x1 + d
//     dy = (3 * a * (x1 + r) + 2 * b) * x1 * r + ((a * r + b) * r + x) * r
//     d2y = (6 * a * (x1 + r) + 2 * b) * r * r
//     d3y = 6 * a * r * r * r
//
// The next y is calculated by adding dy to the previous y, then the next dy is calculated
// by adding d2y to the previous dy, and so on. `r` here is the resolution, or how far there
// is to be between each x. Since we want every x calculated, we use 1 for this value.

function coefficients(x1, y1, x2, y2, k1, k2) {
  const dx = x2 - x1
  const dy = y2 - y1

  const a = (k1 + k2 - (2 * dy) / dx) / (dx * dx)
  const b = ((k2 - k1) / dx - 3 * (x1 + x2) * a) / 2
  const c = k1 - (3 * x1 * a + 2 * b) * x1
  const d = y1 - ((x1 * a + b) * x1 + c) * x1

  return [a, b, c, d]
}

// Calculate each point by summing derivatives. The `r` is kept here mostly to make it more
// clear what the derivatives are doing; we use 1 so that we get one y per x, so most of
// them could actually just disappear.
function forwardDifference(x1, y1, x2, y2, k1, k2, r, values) {
  const [a, b, c, d] = coefficients(x1, y1, x2, y2, k1, k2)

  let y = ((a * x1 + b) * x1 + c) * x1 + d
  let dy = (3 * a * (x1 + r) + 2 * b) * x1 * r + ((a * r + b) * r + c) * r
  let d2y = (6 * a * (x1 + r) + 2 * b) * r * r
  const d3y = 6 * a * r * r * r

  for (const x of range(x1, x2, r, true)) {
    values[x] = y < 0 ? 0 : Math.round(y)
    y += dy
    dy += d2y
    d2y += d3y
  }
}

function interpolate() {
  let k1
  let k2

  const values = []

  for (const i of range(CUTOFF_SAMPLES.length - 3)) {
    const [x0, y0] = CUTOFF_SAMPLES[i]
    const [x1, y1] = CUTOFF_SAMPLES[i + 1]
    const [x2, y2] = CUTOFF_SAMPLES[i + 2]
    const [x3, y3] = CUTOFF_SAMPLES[i + 3]

    // Skip if x1 and x2 are equal; single point.
    if (x1 !== x2) {
      if (x0 === x1 && x2 === x3) {
        // Both points repeated; straight line.
        k1 = (y2 - y1) / (x2 - x1)
        k2 = k1
      } else if (x0 === x1) {
        // x0 and x1 are equal; use f''(x1) = 0.
        k2 = (y3 - y1) / (x3 - x1)
        k1 = ((3 * (y2 - y1)) / (x2 - x1) - k2) / 2
      } else if (x2 === x3) {
        // x2 and x3 are equal; use f''(x2) = 0
        k1 = (y2 - y0) / (x2 - x0)
        k2 = ((3 * (y2 - y1)) / (x2 - x1) - k1) / 2
      } else {
        // Nothing equal; normal curve.
        k1 = (y2 - y0) / (x2 - x0)
        k2 = (y3 - y1) / (x3 - x1)
      }

      forwardDifference(x1, y1, x2, y2, k1, k2, 1, values)
    }
  }
  return values
}

const CUTOFF_FREQS = interpolate()

export default function Filter() {
  // The value of the frequency cutoff registers, an 11-bit number.
  let cut = 0

  // The filter resonance from the register, a 4-bit number.
  let res = 0

  // The master volume from the register, a 4-bit number.
  let volume = 0

  // Whether or not the low-pass filter is engaged.
  let filtlp = false

  // Whether or not the band-pass filter is engaged.
  let filtbp = false

  // Whether or not the high-pass filter is engaged.
  let filthp = false

  // Whether or not voice 1 is being filtered.
  let filtv1 = false

  // Whether or not voice 2 is being filtered.
  let filtv2 = false

  // Whether or not voice 3 is being filtered.
  let filtv3 = false

  // Whether or not the external input is being filtered.
  let filtext = false

  // Set to `true` if voice 3 is producing no output. This will only happen if filtv3 is
  // `false`. It allows voice 3 to be used purely for sync/modulation without adding
  // anything to the output.
  let dscnv3 = false

  // The value on this clock cycle of the low-pass component of the filter.
  let lp = 0

  // The value on this clock cycle of the band-pass component of the filter.
  let bp = 0

  // The value on this clock cycle of the high-pass component of the filter.
  let hp = 0

  // The value on this clock cycle of the unfiltered output.
  let nf = 0

  // The filter cutoff frequency, in hertz. This is capped at 16000 and is calculated at
  // creation time, so this 0 value is only a placeholder.
  let fc = 0

  // The resonance. This is actually stored as 1024 / Q, since that's what's used in the
  // resonance calculation. This is calculated at creation time, so this 0 value is only a
  // placeholder.
  let q = 0

  // Calculates the cutoff frequency based on the value of the #cut field. This number
  // allows for a max frequency of 16kHz and also multiples the value by a constant that
  // will allow division by 1,000,000 (which happens in filter calculations) to instead just
  // be a right shift of 20 bits.
  const calcFc = () => {
    fc = Math.round(2 * Math.PI * Math.min(CUTOFF_FREQS[cut], 16000) * 1.048576)
  }

  // Calculates 1000 / Q, the resonance value. This value is multiplied by a constant which
  // turns division by 1000 (which happens in filter calculations) to be done by right
  // shifting 10 bits.
  const calcQ = () => {
    q = Math.round(1024 / (0.707 + res / 15))
  }

  calcFc()
  calcQ()

  return {
    // Processes changes to the CUTLO register by setting the low 3 bits of #cut.
    cutlo(value) {
      cut = (cut & 0x7f8) | (value & 0x007)
      calcFc()
    },

    // Processes changes to the CUTHI register by setting the high 8 bits of #cut.
    cuthi(value) {
      cut = ((value << 3) & 0x7f8) | (cut & 0x007)
      calcFc()
    },

    // Processes changes to the RESON register by setting the value of #res and setting
    // filter flags for each of the voices.
    reson(value) {
      res = hi4(value)
      calcQ()

      filtv1 = bitSet(value, FILTV1)
      filtv2 = bitSet(value, FILTV2)
      filtv3 = bitSet(value, FILTV3)
      filtext = bitSet(value, FILTEXT)
    },

    // Processes changes to the SIGVOL register by setting the value of #volume and setting
    // flags to indicate which type of filter is engaged.
    sigvol(value) {
      volume = lo4(value)

      filtlp = bitSet(value, FILTLP)
      filtbp = bitSet(value, FILTBP)
      filthp = bitSet(value, FILTHP)
      dscnv3 = bitSet(value, DSCNV3)
    },

    // Resets the filter to its starting state. This is 0 in the cutoff and resonance
    // registers, no filters enabled, no voices being filtered, and zero volume.
    reset(value = true) {
      if (value) {
        cut = 0
        res = 0
        volume = 0

        filtlp = false
        filtbp = false
        filthp = false

        filtv1 = false
        filtv2 = false
        filtv3 = false
        filtext = false

        dscnv3 = false

        lp = 0
        bp = 0
        hp = 0
        nf = 0

        calcFc()
        calcQ()
      }
    },

    // Runs on each clock cycle. Unlike most clock methods, this takes the current values
    // for each of the voices and for the external input. It then calculates the output
    // values for each of the filter channels and for the non-filtered output.
    clock(voice1, voice2, voice3, external) {
      const v1 = voice1 >> 7
      const v2 = voice2 >> 7
      const v3 = dscnv3 && !filtv3 ? 0 : voice3 >> 7
      const ext = external >> 7

      let level = 0
      nf = 0

      if (filtv1) level += v1
      else nf += v1

      if (filtv2) level += v2
      else nf += v2

      if (filtv3) level += v3
      else nf += v3

      if (filtext) level += ext
      else nf += ext

      // This is the actual calculation of the filter outputs.
      const dbp = (fc * hp) >> 20
      const dlp = (fc * bp) >> 20
      bp -= dbp
      lp -= dlp
      hp = ((bp * q) >> 10) - lp - level
    },

    // Returns the current output value of the filter mixer. This simply adds each filter
    // channel together along with the DC offset, then multiplies that by the volume.
    get output() {
      let level = nf

      if (filtlp) level += lp
      if (filtbp) level += bp
      if (filthp) level += hp

      return (level + OFFSET) * volume
    },
  }
}
