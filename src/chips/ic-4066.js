// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 4066 quad bilateral switch.
 *
 * The 4066 is one of the 4000-series CMOS logic chips, consisting of
 * four symmetrical analong switches. The data pins transfer data
 * bidirectionally as long as their associated control pin is low. When
 * the control pin goes hish, no data can be passed through the switch.
 *
 * When the control pin returns to low, both data pins return to the
 * level of the *last of them to be set*. This is a bit of a compromise
 * necessitated by the fact that this is a digital simulation of an
 * analog circuit, but it should be the most natural. Most use cases do
 * not involve switching the direction that data flows through the
 * switch regularly.
 *
 * There is no high-impedance state for the pins of this device. When
 * the control pin his high, the data pins simply take on the level of
 * whatever circuits they're connected to. This is emulated by changing
 * their mode to `{@link module:components.INPUT|INPUT}` so that they do
 * not send signals but can still track changes on their traces.
 *
 * There is no consistency across datahsheets for naming the 4066's
 * pins. Many sheets simply have some data pins marked "IN/OUT" and
 * others marked "OUT/IN", but those don't work well as property names.
 * For consistency with the rest of the logic chips in this module, the
 * data pins have been named `A` and `B`, while thie control pin is
 * named `X`. The `A` and `B` pins are completely interchangeable and do
 * appear in different orders oon many datasheets; this particular
 * arrangement (if not the pin names) is taken from the datasheet for
 * the Texas Instruments CD4066B.
 *
 * The chip comes in a 14-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +---+--+---+
 *      A1 |1  +--+ 14| Vdd
 *      B1 |2       13| X1
 *      B2 |3       12| X4
 *      A2 |4  4066 11| A4
 *      X2 |5       10| B4
 *      X3 |6        9| B3
 *     Vss |7        8| A3
 *         +----------+
 * ```
 * *(`Vdd` and `Vss` are power supply pins and are not emulated.)*
 *
 * This chip is unusual in that it's the only analog chip in the system
 * as emulated (with the exception of the filter portion of the
 * {@link Ic6581|6581}). Even so, it works fine for switching digital
 * signals as well, and one of the Commodore 64's two 4066's is in fact
 * used as a digital switch.
 *
 * In the Commodore 64, U16 and U28 are 4066's. The former is used as a
 * digital switch to control which processor has access to the color
 * RAM's data pins, while the other is used as an analog switch to
 * control which game port is providing paddle data to the
 * {@link Ic6581|6581} SID.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic4066|Ic4066}` function.
 *
 * @typedef Ic4066
 * @property {Pin} A1 [1] One of the data pins on switch 1.
 * @property {Pin} B1 [2] One of the data pins on switch 1.
 * @property {Pin} X1 [13] The control pin for switch 1.
 * @property {Pin} A2 [3] One of the data pins on switch 2.
 * @property {Pin} B2 [4] One of the data pins on switch 2.
 * @property {Pin} X2 [5] The control pin for switch 2.
 * @property {Pin} A3 [9] One of the data pins on switch 2.
 * @property {Pin} B3 [8] One of the data pins on switch 2.
 * @property {Pin} X3 [6] The control pin for switch 2.
 * @property {Pin} A4 [11] One of the data pins on switch 2.
 * @property {Pin} B4 [10] One of the data pins on switch 2.
 * @property {Pin} X4 [12] The control pin for switch 2.
 * @property {Pin} Vcc [14] The positive power supply. This pin is not
 *     emulated.
 * @property {Pin} Vss [7] The ground. This pin is not emulated.
 */

import { Chip } from 'components'
import Pin from 'components/pin'
import { range } from 'utils'

const INPUT = Pin.INPUT
const BIDIRECTIONAL = Pin.BIDIRECTIONAL

/**
 * Creates an emulation of the 4066 quad bilateral switch.
 *
 * @returns {Ic4066} A new 4066 quad bilateral switch.
 * @memberof module:chips
 */
function Ic4066() {
  const chip = Chip(
    // I/O and control pins for switch 1
    new Pin(1, 'A1', BIDIRECTIONAL),
    new Pin(2, 'B1', BIDIRECTIONAL),
    new Pin(13, 'X1', INPUT),

    // I/O and control pins for switch 2
    new Pin(3, 'A2', BIDIRECTIONAL),
    new Pin(4, 'B2', BIDIRECTIONAL),
    new Pin(5, 'X2', INPUT),

    // I/O and control pins for switch 3
    new Pin(9, 'A3', BIDIRECTIONAL),
    new Pin(8, 'B3', BIDIRECTIONAL),
    new Pin(6, 'X3', INPUT),

    // I/O and control pins for switch 4
    new Pin(11, 'A4', BIDIRECTIONAL),
    new Pin(10, 'B4', BIDIRECTIONAL),
    new Pin(12, 'X4', INPUT),

    // Power supply and ground pins. These are not emulated.
    new Pin(14, 'Vdd'),
    new Pin(7, 'GND'),
  )

  const last = [null, null, null, null]

  function controlListener(gate) {
    const xpin = chip[`X${gate}`]
    const apin = chip[`A${gate}`]
    const bpin = chip[`B${gate}`]

    return () => {
      if (xpin.high) {
        apin.mode = INPUT
        bpin.mode = INPUT
      } else {
        apin.mode = BIDIRECTIONAL
        bpin.mode = BIDIRECTIONAL

        if (last[gate - 1] === apin) {
          bpin.level = apin.level
        } else if (last[gate - 1] === bpin) {
          apin.level = bpin.level
        } else {
          apin.clear()
          bpin.clear()
        }
      }
    }
  }

  function dataListener(gate) {
    const xpin = chip[`X${gate}`]
    const apin = chip[`A${gate}`]
    const bpin = chip[`B${gate}`]

    return pin => {
      const outpin = pin === apin ? bpin : apin
      last[gate - 1] = pin
      if (xpin.low) {
        outpin.level = pin.level
      }
    }
  }

  for (const i of range(1, 4, true)) {
    chip[`X${i}`].addListener(controlListener(i))
    chip[`A${i}`].addListener(dataListener(i))
    chip[`B${i}`].addListener(dataListener(i))
  }

  return chip
}

export { Ic4066 }
