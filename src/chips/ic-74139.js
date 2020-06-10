// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 74139 dual 2-to-4 demultiplexer.
 *
 * The 74139 is one of the 7400-series TTL logic chips, consisting of a
 * paior of 2-input, 4-output demultiplexers. There are four possible
 * binary combinations on two pins (LL, HL, LH, and HH), and each of
 * these combinations selects a different one of the output pins to
 * activate. Each demultiplexer also has an enable pin.
 *
 * Most literature names the pins with numbers first. This makes sense
 * since there are really two numbers that go into the output's name
 * (the demultiplexer number and the output number) and having a letter
 * separate them is quite readable. But since each of these pin names
 * becomes a property on the chip, that scheme cannot be used here.
 * Therefore each demultiplexer has two inputs starting with `A` and
 * `B`, an active-low enable pin starting with `_G`, and four inverted
 * outputs whose names start with `_Y`.
 *
 * | _Gn    | An     | Bn     | _Yn0   | _Yn1   | _Yn2   | _Yn3   |
 * | :----: | :----: | :----: | :----: | :----: | :----: | :----: |
 * | H      | X      | X      | **H**  | **H**  | **H**  | **H**  |
 * | L      | L      | L      | **L**  | **H**  | **H**  | **H**  |
 * | L      | H      | L      | **H**  | **L**  | **H**  | **H**  |
 * | L      | L      | H      | **H**  | **H**  | **L**  | **H**  |
 * | L      | H      | H      | **H**  | **H**  | **H**  | **L**  |
 *
 * The chip comes in a 16-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +---U---+
 *     _G1 |1    16| Vcc
 *      A1 |2    15| _G2
 *      B1 |3    14| A2
 *    _Y10 |4    13| B2
 *    _Y11 |5    12| _Y20
 *    _Y12 |6    11| _Y21
 *    _Y13 |7    10| _Y22
 *     GND |8     9| _Y23
 *         +-------+
 * ```
 * *(GND and Vcc are ground and power supply pins respectively, and they
 * are not emulated.)*
 *
 * In the Commodore 64, U15 is a 74LS139 (a lower-power, faster variant
 * whose emulation is the same). Its two demultiplexers are chained
 * together to provide additional address decoding when the PLA's `_IO`
 * output is selected.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic74139|Ic74139}` function.
 *
 * @typedef Ic74139
 * @property {Pin} _G1 [1] The active-low enable pin for demultiplexer
 *     1.
 * @property {Pin} A1 [2] The first input to demultiplexer 1.
 * @property {Pin} B1 [3] The second input to demultiplexer 1.
 * @property {Pin} _Y10 [4] The first inverted output from demultiplexer
 *     1.
 * @property {Pin} _Y11 [5] The second inverted output from
 *     demultiplexer 1.
 * @property {Pin} _Y12 [6] The third inverted output from demultiplexer
 *     1.
 * @property {Pin} _Y13 [7] The fourth inverted output from
 *     demultiplexer 1.
 * @property {Pin} _G2 [15] The active-low enable pin for demultiplexer
 *     2.
 * @property {Pin} A2 [14] The first input to demultiplexer 2.
 * @property {Pin} B2 [13] The second input to demultiplexer 2.
 * @property {Pin} _Y20 [12] The first inverted output from
 *     demultiplexer 2.
 * @property {Pin} _Y21 [11] The second inverted output from
 *     demultiplexer 2.
 * @property {Pin} _Y22 [10] The third inverted output from
 *     demultiplexer 2.
 * @property {Pin} _Y23 [9] The fourth inverted output from
 *     demultiplexer 2.
 * @property {Pin} Vcc [16] The positive power supply. This pin is not
 *     emulated.
 * @property {Pin} GND [8] The ground. This pin is not emulated.
 */

import { Chip, Pin, INPUT, OUTPUT } from "components"
import { range } from "utils"

/**
 * Creates an emulation of the 74139 dual 2-to-4 demultiplexer.
 *
 * @returns {Ic74139} A new 74139 dual 2-to-4 demultiplexer.
 * @memberof module:chips
 */
function Ic74139() {
  const chip = Chip(
    // Demultiplexer 1
    Pin(2, "A1", INPUT),
    Pin(3, "B1", INPUT),
    Pin(4, "_Y10", OUTPUT).clear(),
    Pin(5, "_Y11", OUTPUT).set(),
    Pin(6, "_Y12", OUTPUT).set(),
    Pin(7, "_Y13", OUTPUT).set(),
    Pin(1, "_G1", INPUT),

    // Demultiplexer 2
    Pin(14, "A2", INPUT),
    Pin(13, "B2", INPUT),
    Pin(12, "_Y20", OUTPUT).clear(),
    Pin(11, "_Y21", OUTPUT).set(),
    Pin(10, "_Y22", OUTPUT).set(),
    Pin(9, "_Y23", OUTPUT).set(),
    Pin(15, "_G2", INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(16, "Vcc"),
    Pin(8, "GND"),
  )

  function listener(demux) {
    const gpin = chip[`_G${demux}`]
    const apin = chip[`A${demux}`]
    const bpin = chip[`B${demux}`]
    const y0pin = chip[`_Y${demux}0`]
    const y1pin = chip[`_Y${demux}1`]
    const y2pin = chip[`_Y${demux}2`]
    const y3pin = chip[`_Y${demux}3`]

    return () => {
      y0pin.level = 1 - (gpin.low && apin.low && bpin.low)
      y1pin.level = 1 - (gpin.low && apin.high && bpin.low)
      y2pin.level = 1 - (gpin.low && apin.low && bpin.high)
      y3pin.level = 1 - (gpin.low && apin.high && bpin.high)
    }
  }

  for (const i of range(1, 2, true)) {
    chip[`_G${i}`].addListener(listener(i))
    chip[`A${i}`].addListener(listener(i))
    chip[`B${i}`].addListener(listener(i))
  }

  return chip
}

export { Ic74139 }
