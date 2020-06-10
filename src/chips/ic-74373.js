// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 74373 octal D-type transparent latch.
 *
 * The 74373 is one of the 7400-series TTL logic chips, consisting of
 * eight transparent latches. These latches normally allow data to flow
 * freely from input to output, but when the latch enable pin `LE` is
 * set to low, the output is latched. That means it retains its current
 * state, no matter what the input pins do in the meantime. Once `LE`
 * goes high again, the outputs once more reflect their inputs.
 *
 * Since this chip is most often used in bus-type applications, the pins
 * are named using more of a bus-type convention. The inputs are `D` and
 * the outputs are `Q`, and the latches are numbered from 0 rather than
 * from 1.
 *
 * The chip has an active-low output enable pin, `_OE`. When this is
 * high, all outputs are set to a high impedance state.
 *
 * | _OE    | LE     | Dn     | Qn     |
 * | :----: | :----: | :----: | :----: |
 * | H      | X      | X      | **Z**  |
 * | L      | H      | L      | **L**  |
 * | L      | H      | H      | **H**  |
 * | L      | L      | X      | **Q₀** |
 *
 * *(Q₀ means whatever level the pin was in the previous state. If the
 * pin was high, then it remains high. If it was low, it remains low.)*
 *
 * The chip comes in a 20-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +---U---+
 *     _OE |1    20| Vcc
 *      Q0 |2    19| Q7
 *      D0 |3    18| D7
 *      D1 |4    17| D6
 *      Q1 |5    16| Q6
 *      Q2 |6    15| Q5
 *      D2 |7    14| D5
 *      D3 |8    13| D4
 *      Q3 |9    12| Q4
 *     GND |10   11| LE
 *         +-------+
 * ```
 * *(GND and Vcc are ground and power supply pins respectively, and they
 * are not emulated.)*
 *
 * In the Commodore 64, U26 is a 74LS373 (a lower-power, faster variant
 * whose emulation is the same). It's used to connect the multiplexed
 * address bus to the lower 8 bits of the main address bus. It latches
 * the low 8 bits of the multiplexed bus so that, when the lines are
 * switched to the high 8 bits, those bits do not leak onto the low 8
 * bits of the main bus.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic74373|Ic74373}` function.
 *
 * @typedef Ic74373
 * @property {Pin} _OE [1] The chip-wide active-low output enable pin.
 *     When this pin is high, all of the `Q` pins are put into a high
 *     impedance state, disconnecting them from their circuits.
 * @property {Pin} LE [11] The latch enable. As long as this pin is
 *     high, data will flow from input to output pins freely. Setting
 *     `LE` to low will latch the output pins, keeping them constant no
 *     matter the levels on the input pins.
 * @property {Pin} D0 [3] The input to latch 1.
 * @property {Pin} Q0 [2] The output from latch 1.
 * @property {Pin} D1 [4] The input to latch 2.
 * @property {Pin} Q1 [5] The output from latch 2.
 * @property {Pin} D2 [7] The input to latch 3.
 * @property {Pin} Q2 [6] The output from latch 3.
 * @property {Pin} D3 [8] The input to latch 4.
 * @property {Pin} Q3 [9] The output from latch 4.
 * @property {Pin} D4 [13] The input to latch 5.
 * @property {Pin} Q4 [12] The output from latch 5.
 * @property {Pin} D5 [14] The input to latch 6.
 * @property {Pin} Q5 [15] The output from latch 6.
 * @property {Pin} D6 [17] The input to latch 7.
 * @property {Pin} Q6 [16] The output from latch 7.
 * @property {Pin} D7 [18] The input to latch 8.
 * @property {Pin} Q7 [19] The output from latch 8.
 * @property {Pin} Vcc [20] The positive power supply. This pin is not
 *     emulated.
 * @property {Pin} GND [10] The ground. This pin is not emulated.
 */

import { Chip, Pin, INPUT, OUTPUT } from "components"
import { range } from "utils"

/**
 * Creates an emulation of the 74373 octal transparent latch.
 *
 * @returns {Ic74373} A new 74373 octal transparent latch.
 * @memberof module:chips
 */
function Ic74373() {
  const chip = Chip(
    // Input pins.
    Pin(3, "D0", INPUT),
    Pin(4, "D1", INPUT),
    Pin(7, "D2", INPUT),
    Pin(8, "D3", INPUT),
    Pin(13, "D4", INPUT),
    Pin(14, "D5", INPUT),
    Pin(17, "D6", INPUT),
    Pin(18, "D7", INPUT),

    // Output pins.
    Pin(2, "Q0", OUTPUT).clear(),
    Pin(5, "Q1", OUTPUT).clear(),
    Pin(6, "Q2", OUTPUT).clear(),
    Pin(9, "Q3", OUTPUT).clear(),
    Pin(12, "Q4", OUTPUT).clear(),
    Pin(15, "Q5", OUTPUT).clear(),
    Pin(16, "Q6", OUTPUT).clear(),
    Pin(19, "Q7", OUTPUT).clear(),

    // Output enable. When this is high, the outputs function normally
    // according to their inputs and LE. When this is low, the outputs
    // are all hi-Z.
    Pin(1, "_OE", INPUT),

    // Latch enable. When set high, data flows transparently through the
    // device, with output pins matching their input pins. When it goes
    // low, the output pins remain in their current state for as long as
    // LE is low, no matter what the inputs do.
    Pin(11, "LE", INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(10, "GND"),
    Pin(20, "Vcc"),
  )

  // "Memory" for the latched values. When _OE returns high while LE is
  // low, these values will be put onto the output pins. (Otherwise, if
  // LE is high, the output pins just get the values of the input pins
  // like normal.)
  const latches = [null, null, null, null, null, null, null, null]

  function dataListener(latch) {
    const qpin = chip[`Q${latch}`]

    return pin => {
      if (chip.LE.high && chip._OE.low) {
        qpin.level = pin.level
      }
    }
  }

  function latchListener() {
    return pin => {
      if (pin.low) {
        for (const i of range(8)) {
          latches[i] = chip[`D${i}`].level
        }
      } else {
        for (const i of range(8)) {
          chip[`Q${i}`].level = chip[`D${i}`].level
          latches[i] = null
        }
      }
    }
  }

  function enableListener() {
    return pin => {
      if (pin.high) {
        for (const i of range(8)) {
          chip[`Q${i}`].float()
        }
      } else {
        const le = chip.LE.low
        for (const i of range(8)) {
          chip[`Q${i}`].level = le ? latches[i] : chip[`D${i}`].level
        }
      }
    }
  }

  for (const i of range(8)) {
    chip[`D${i}`].addListener(dataListener(i))
  }
  chip.LE.addListener(latchListener())
  chip._OE.addListener(enableListener())

  return chip
}

export { Ic74373 }
