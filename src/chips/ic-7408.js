// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Emulation of the 7408 quad two-input AND gate.
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
 * The chip is in a 14-pin dual in-line package with the following pin
 * assignments.
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
 * {@link modules:chip.Ic6567|6567} VIC and the `_DMA` signal from the
 * expansion port combining into the `RDY` signal for the
 * {@link modules:chip.Ic6510|6510} CPU.
 *
 * @typedef Chip7408
 * @memberof module:chips
 * @property {module:components.Pin} A1 [1] One of the inputs to gate 1.
 * @property {module:components.Pin} B1 [2] One of the inputs to gate 1.
 * @property {module:components.Pin} Y1 [3] The output from gate 1.
 * @property {module:components.Pin} A2 [4] One of the inputs to gate 2.
 * @property {module:components.Pin} B2 [5] One of the inputs to gate 2.
 * @property {module:components.Pin} Y2 [6] The output from gate 2.
 * @property {module:components.Pin} A3 [9] One of the inputs to gate 3.
 * @property {module:components.Pin} B3 [10] One of the inputs to gate
 *     3.
 * @property {module:components.Pin} Y3 [8] The output from gate 3.
 * @property {module:components.Pin} A4 [12] One of the inputs to gate
 *     4.
 * @property {module:components.Pin} B4 [13] One of the inputs to gate
 *     4.
 * @property {module:components.Pin} Y4 [11] The output from gate 4.
 * @property {module:components.Pin} Vcc [14] The positive power supply.
 *     This pin is not emulated.
 * @property {module:components.Pin} GND [7] The ground. This pin is not
 *     emulated.
 */

import { Chip, Pin, INPUT, OUTPUT } from "components"

/**
 * Creates an emulation of the 7408 quad two-input AND gate.
 *
 * @returns {module:chips.Chip7408} A new 7408 quad two-input AND gate.
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
    Pin(14, "VCC"),
    Pin(7, "GND"),
  )

  function listener(other, out) {
    return pin => (out.level = pin.level && other.level)
  }

  chip.A1.addListener(listener(chip.B1, chip.Y1))
  chip.B1.addListener(listener(chip.A1, chip.Y1))
  chip.A2.addListener(listener(chip.B2, chip.Y2))
  chip.B2.addListener(listener(chip.A2, chip.Y2))
  chip.A3.addListener(listener(chip.B3, chip.Y3))
  chip.B3.addListener(listener(chip.A3, chip.Y3))
  chip.A4.addListener(listener(chip.B4, chip.Y4))
  chip.B4.addListener(listener(chip.A4, chip.Y4))

  return chip
}

export { Ic7408 }
