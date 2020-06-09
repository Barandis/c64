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
 * The chip is in a 14-pin dual in-line package with the following pin
 * assignments.
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
 * @typedef Ic7406
 * @memberof module:chips
 * @property {module:components.Pin} A1 [1] The input of the first
 *     inverter.
 * @property {module:components.Pin} A2 [3] The input of the second
 *     inverter.
 * @property {module:components.Pin} A3 [5] The input of the third
 *     inverter.
 * @property {module:components.Pin} A4 [9] The input of the fourth
 *     inverter.
 * @property {module:components.Pin} A5 [11] The input of the fifth
 *     nverter.
 * @property {module:components.Pin} A6 [13] The input of the sixth
 *     inverter.
 * @property {module:components.Pin} Y1 [2] The output of the first
 *     inverter.
 * @property {module:components.Pin} Y2 [4] The output of the second
 *     inverter.
 * @property {module:components.Pin} Y3 [6] The output of the third
 *     inverter.
 * @property {module:components.Pin} Y4 [8] The output of the fourth
 *     inverter.
 * @property {module:components.Pin} Y5 [10] The output of the fifth
 *     inverter.
 * @property {module:components.Pin} Y6 [12] The output of the sixth
 *     inverter.
 * @property {module:components.Pin} Vcc [14] The positive power supply.
 *     This pin is not emulated.
 * @property {module:components.Pin} GND [7] The ground. This pin is not
 *     emulated.
 */

import { Chip, Pin, INPUT, OUTPUT } from "components"

/**
 * Creates an emulation of the 7406 hex inverter.
 *
 * @returns {module:chips.Ic7406} A new 7406 hex inverter.
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

  chip.A1.addListener(pin => (chip.Y1.level = pin.low))
  chip.A2.addListener(pin => (chip.Y2.level = pin.low))
  chip.A3.addListener(pin => (chip.Y3.level = pin.low))
  chip.A4.addListener(pin => (chip.Y4.level = pin.low))
  chip.A5.addListener(pin => (chip.Y5.level = pin.low))
  chip.A6.addListener(pin => (chip.Y6.level = pin.low))

  return chip
}

export { Ic7406 }
