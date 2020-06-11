// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 74258 quad 2-to-1 multiplexer.
 *
 * The 74258 is one of the 7400-series TTL logic chips, consisting of
 * four 2-to-1 multiplexers. Each multiplexer is essentially a switch
 * which uses a single, shared select signal to choose which of its two
 * inputs to reflect on its output. Each output is tri-state.
 *
 * This chip is exactly the same as the `{@link Ic74257}` except that
 * the this one has inverted outputs and the other doesn't.
 *
 * The inputs to each multiplexer are the `A` and `B` pins, and the `_Y`
 * pins are their inverted outputs. The `SEL` pin selects between the
 * `A` inputs (when `SEL` is low) and the `B` inputs (when `SEL` is
 * high). This single pin selects the outputs for all four multiplexers
 * simultaneously. The active low output-enable pin, `_OE`, tri-states
 * all four outputs when it's set high.
 *
 * | _OE    | SEL    | An     | Bn     | Yn     |
 * | :----: | :----: | :----: | :----: | :----: |
 * | H      | X      | X      | X      | **Z**  |
 * | L      | L      | L      | X      | **H**  |
 * | L      | L      | H      | X      | **L**  |
 * | L      | H      | X      | L      | **H**  |
 * | L      | H      | X      | H      | **L**  |
 *
 * The chip comes in a 16-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +---+--+---+
 *     SEL |1  +--+ 16| Vcc
 *      A1 |2       15| _OE
 *      B1 |3       14| A4
 *     _Y1 |4       13| B4
 *      A2 |5 74258 12| _Y4
 *      B2 |6       11| A3
 *     _Y2 |7       10| B3
 *     GND |8        9| _Y3
 *         +----------+
 * ```
 * *(`GND` and `Vcc` are ground and power supply pins respectively, and
 * they are not emulated.)*
 *
 * In the Commodore 64, U14 is a 74LS258 (a lower-power, faster variant
 * whose emulation is the same). It's used to multiplex the upper two
 * lines of the multiplexed address bus from the `A6` and `A7` lines
 * from the {@link Ic6567|6567} VIC and the `_VA14` and `_VA15` lines
 * from one of the {@link Ic6526|6526} CIAs.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic74258|Ic74258}` function.
 *
 * @typedef Ic74258
 * @property {Pin} SEL [1] The chip-wide select pin. When this pin is
 *     low, all of the `Y` pins will have the inverse level of their
 *     respective `A` pins. When it's high, the `_Y` pins will instead
 *     reflect the inverse levels of the corresponding `B` pins.
 * @property {Pin} _OE [15] The chip-wide active-low output enable pin.
 *     When this pin is high, all of the `_Y` pins are put into a high
 *     impedance state, disconnecting them from their circuits.
 * @property {Pin} A1 [2] The first input to multiplexer 1.
 * @property {Pin} B1 [3] The second input to multiplexer 1.
 * @property {Pin} Y1 [4] The inverted output from multiplexer 1.
 * @property {Pin} A2 [5] The first input to multiplexer 2.
 * @property {Pin} B2 [6] The second input to multiplexer 2.
 * @property {Pin} Y2 [7] The inverted output from multiplexer 2.
 * @property {Pin} A3 [11] The first input to multiplexer 3.
 * @property {Pin} B3 [10] The second input to multiplexer 3.
 * @property {Pin} Y3 [9] The inverted output from multiplexer 3.
 * @property {Pin} A4 [14] The first input to multiplexer 4.
 * @property {Pin} B4 [13] The second input to multiplexer 4.
 * @property {Pin} Y4 [12] The inverted output from multiplexer 4.
 * @property {Pin} Vcc [16] The positive power supply. This pin is not
 *     emulated.
 * @property {Pin} GND [8] The ground. This pin is not emulated.
 */

import { Chip, Pin, INPUT, OUTPUT } from "components"
import { range } from "utils"

/**
 * Creates an emulation of the 74258 quad 2-to-1 multiplexer.
 *
 * @returns {Ic74258} A new 74258 quad 2-to-1 multiplexer.
 * @memberof module:chips
 */
function Ic74258() {
  const chip = Chip(
    // Select. When this is low, the Y output pins will take on the same
    // value as their A input pins. When this is high, the Y output pins
    // will instead take on the value of their B input pins.
    Pin(1, "SEL", INPUT),

    // Output enable. When this is high, all of the Y output pins will
    // be forced into hi-z, whatever the values of their input pins.
    Pin(15, "_OE", INPUT),

    // Group 1 inputs and output
    Pin(2, "A1", INPUT),
    Pin(3, "B1", INPUT),
    Pin(4, "_Y1", OUTPUT).set(),

    // Group 2 input and output
    Pin(5, "A2", INPUT),
    Pin(6, "B2", INPUT),
    Pin(7, "_Y2", OUTPUT).set(),

    // Group 3 inputs and output
    Pin(11, "A3", INPUT),
    Pin(10, "B3", INPUT),
    Pin(9, "_Y3", OUTPUT).set(),

    // Group 4 inputs and output
    Pin(14, "A4", INPUT),
    Pin(13, "B4", INPUT),
    Pin(12, "_Y4", OUTPUT).set(),

    // Power supply pins. These are not emulated.
    Pin(8, "GND"),
    Pin(16, "Vcc"),
  )

  function dataListener(mux) {
    const apin = chip[`A${mux}`]
    const bpin = chip[`B${mux}`]
    const ypin = chip[`_Y${mux}`]

    return () => {
      if (chip._OE.high) {
        ypin.float()
      } else if (chip.SEL.low) {
        ypin.level = +!apin.level
      } else {
        ypin.level = +!bpin.level
      }
    }
  }

  function controlListener() {
    const listeners = [...range(1, 4, true)].map(i => dataListener(i))
    return () => listeners.forEach(listener => listener())
  }

  chip.SEL.addListener(controlListener())
  chip._OE.addListener(controlListener())
  for (const i of range(1, 4, true)) {
    chip[`A${i}`].addListener(dataListener(i))
    chip[`B${i}`].addListener(dataListener(i))
  }

  return chip
}

export { Ic74258 }
