// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 7408 quad two-input AND gate.
 *
 * The 7408 is one of the 7400-series TTL logic circuits, consisting of
 * four dual-input AND gates. An AND gate's output is high as long as
 * all of its outputs are high; otherwise the output is low.
 *
 * The `A` and `B` pins are inputs while the `Y` pins are the outputs.
 *
 * | An     | Bn     | Yn     |
 * | :----: | :----: | :----: |
 * | L      | L      | **L**  |
 * | L      | H      | **L**  |
 * | H      | L      | **L**  |
 * | H      | H      | **H**  |
 *
 * The chip comes in a 14-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +---U---+
 *      A1 |1    14| Vcc
 *      B1 |2    13| B4
 *      Y1 |3    12| A4
 *      A2 |4    11| Y4
 *      B2 |5    10| B3
 *      Y2 |6     9| A3
 *     GND |7     8| Y3
 *         +-------+
 * ```
 * *(GND and Vcc are ground and power supply pins respectively, and they
 * are not emulated.)*
 *
 * In the Commodore 64, U27 is a 74LS08 (a lower-power, faster variant
 * whose emulation is the same). It's used for combining control signals
 * from various sources, such as the `BA` signal from the
 * {@link Ic6567|6567} VIC and the `_DMA` signal from the expansion port
 * combining into the `RDY` signal for the {@link Ic6510|6510} CPU.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic7408|Ic7408}` function.
 *
 * @typedef Ic7408
 * @property {Pin} A1 [1] One of the inputs to gate 1.
 * @property {Pin} B1 [2] One of the inputs to gate 1.
 * @property {Pin} Y1 [3] The output from gate 1.
 * @property {Pin} A2 [4] One of the inputs to gate 2.
 * @property {Pin} B2 [5] One of the inputs to gate 2.
 * @property {Pin} Y2 [6] The output from gate 2.
 * @property {Pin} A3 [9] One of the inputs to gate 3.
 * @property {Pin} B3 [10] One of the inputs to gate 3.
 * @property {Pin} Y3 [8] The output from gate 3.
 * @property {Pin} A4 [12] One of the inputs to gate 4.
 * @property {Pin} B4 [13] One of the inputs to gate 4.
 * @property {Pin} Y4 [11] The output from gate 4.
 * @property {Pin} Vcc [14] The positive power supply. This pin is not
 *     emulated.
 * @property {Pin} GND [7] The ground. This pin is not emulated.
 */

import { Chip, Pin, INPUT, OUTPUT } from "components"
import { range } from "utils"

/**
 * Creates an emulation of the 7408 quad two-input AND gate.
 *
 * @returns {Ic7408} A new 7408 quad two-input AND gate.
 * @memberof module:chips
 */
function Ic7408() {
  const chip = Chip(
    // Gate 1 inputs and output
    Pin(1, "A1", INPUT),
    Pin(2, "B1", INPUT),
    Pin(3, "Y1", OUTPUT).clear(),

    // Gate 2 inputs and output
    Pin(4, "A2", INPUT),
    Pin(5, "B2", INPUT),
    Pin(6, "Y2", OUTPUT).clear(),

    // Gate 3 inputs and output
    Pin(9, "A3", INPUT),
    Pin(10, "B3", INPUT),
    Pin(8, "Y3", OUTPUT).clear(),

    // Gate 4 inputs and output
    Pin(12, "A4", INPUT),
    Pin(13, "B4", INPUT),
    Pin(11, "Y4", OUTPUT).clear(),

    // Power supply and ground pins, not emulated
    Pin(14, "Vcc"),
    Pin(7, "GND"),
  )

  function listener(gate) {
    const apin = chip[`A${gate}`]
    const bpin = chip[`B${gate}`]
    const ypin = chip[`Y${gate}`]

    return () => (ypin.level = apin.level && bpin.level)
  }

  for (const i of range(1, 4, true)) {
    chip[`A${i}`].addListener(listener(i))
    chip[`B${i}`].addListener(listener(i))
  }

  return chip
}

export { Ic7408 }
