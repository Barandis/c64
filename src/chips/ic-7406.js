// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 7406 hex inverter.
 *
 * The 7406 is one of the 7400-series TTL logic chips, consisting of six
 * single-input inverters. An inverter is the simplest of logic gates:
 * if the input is low, the output is high, and vice versa.
 *
 * | An     | Yn     |
 * | :----: | :----: |
 * | L      | **H**  |
 * | H      | **L**  |
 *
 * The chip comes in a 14-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +---U---+
 *      A1 |1    14| Vcc
 *      Y1 |2    13| A6
 *      A2 |3    12| Y6
 *      Y2 |4    11| A5
 *      A3 |5    10| Y5
 *      Y3 |6     9| A4
 *     GND |7     8| Y4
 *         +-------+
 * ```
 * *(GND and Vcc are ground and power supply pins respectively, and they
 * are not emulated.)*
 *
 * In the Commodore 64, U8 is a 7406. It's responsible for inverting
 * logic signals that are expected in the inverse they're given, such as
 * the 6567's `AEC` signal being turned into the inverse `_AEC` signal
 * for the 82S100.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic7406|Ic7406}` function.
 *
 * @typedef Ic7406
 * @property {Pin} A1 [1] The input of inverter 1.
 * @property {Pin} Y1 [2] The output of inverter 1.
 * @property {Pin} A2 [3] The input of inverter 2.
 * @property {Pin} Y2 [4] The output of inverter 2.
 * @property {Pin} A3 [5] The input of inverter 3.
 * @property {Pin} Y3 [6] The output of inverter 3.
 * @property {Pin} A4 [9] The input of inverter 4.
 * @property {Pin} Y4 [8] The output of inverter 4.
 * @property {Pin} A5 [11] The input of inverter 5.
 * @property {Pin} Y5 [10] The output of inverter 5.
 * @property {Pin} A6 [13] The input of inverter 6.
 * @property {Pin} Y6 [12] The output of inverter 6.
 * @property {Pin} Vcc [14] The positive power supply. This pin is not
 *     emulated.
 * @property {Pin} GND [7] The ground. This pin is not emulated.
 */

import { Chip, Pin, INPUT, OUTPUT } from "components"

/**
 * Creates an emulation of the 7406 hex inverter.
 *
 * @returns {Ic7406} A new 7406 hex inverter.
 * @memberof module:chips
 */
function Ic7406() {
  const chip = Chip(
    // Input pins. In the TI data sheet, these are named "1A", "2A",
    // etc., and the C64 schematic does not suggest named for them.
    // Since these names are not legal JS variable names, I've switched
    // the letter and number.
    Pin(1, "A1", INPUT),
    Pin(3, "A2", INPUT),
    Pin(5, "A3", INPUT),
    Pin(9, "A4", INPUT),
    Pin(11, "A5", INPUT),
    Pin(13, "A6", INPUT),

    // Output pins. Similarly, the TI data sheet refers to these as
    // "1Y", "2Y", etc.
    Pin(2, "Y1", OUTPUT).set(),
    Pin(4, "Y2", OUTPUT).set(),
    Pin(6, "Y3", OUTPUT).set(),
    Pin(8, "Y4", OUTPUT).set(),
    Pin(10, "Y5", OUTPUT).set(),
    Pin(12, "Y6", OUTPUT).set(),

    // Power supply and ground pins, not emulated
    Pin(14, "Vcc"),
    Pin(7, "GND"),
  )

  function listener(out) {
    return pin => (out.level = +pin.low)
  }

  chip.A1.addListener(listener(chip.Y1))
  chip.A2.addListener(listener(chip.Y2))
  chip.A3.addListener(listener(chip.Y3))
  chip.A4.addListener(listener(chip.Y4))
  chip.A5.addListener(listener(chip.Y5))
  chip.A6.addListener(listener(chip.Y6))

  return chip
}

export { Ic7406 }
