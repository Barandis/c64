// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 7406 hex inverter.
//
// The 7406 is one of the 7400-series TTL logic chips, consisting of six single-input
// inverters. An inverter is the simplest of logic gates: if the input is low, the output is
// high, and vice versa.
//
// | An  || Yn  |
// | --- || --- |
// | L   || H   |
// | H   || L   |
//
// The chip comes in a 14-pin dual in-line package with the following pin assignments.
//
//         +---+--+---+
//      A1 |1  +--+ 14| Vcc
//      Y1 |2       13| A6
//      A2 |3       12| Y6
//      Y2 |4  7406 11| A5
//      A3 |5       10| Y5
//      Y3 |6        9| A4
//     GND |7        8| Y4
//         +----------+
//
// GND and Vcc are ground and power supply pins respectively, and they are not emulated.
//
// In the Commodore 64, U8 is a 7406. It's responsible for inverting logic signals that are
// expected in the inverse they're given, such as the 6567's AEC signal being turned into
// the inverse AEC signal for the 82S100.

import Chip from 'components/chip'
import Pin from 'components/pin'
import { range } from 'utils'

const { INPUT, OUTPUT } = Pin

export default function Ic7406() {
  const chip = Chip(
    // Input pins. In the TI data sheet, these are named "1A", "2A", etc., and the C64
    // schematic does not suggest names for them. Since these names are not legal JS
    // variable names, I've switched the letter and number.
    Pin(1, 'A1', INPUT),
    Pin(3, 'A2', INPUT),
    Pin(5, 'A3', INPUT),
    Pin(9, 'A4', INPUT),
    Pin(11, 'A5', INPUT),
    Pin(13, 'A6', INPUT),

    // Output pins. Similarly, the TI data sheet refers to these as "1Y", "2Y", etc.
    Pin(2, 'Y1', OUTPUT).set(),
    Pin(4, 'Y2', OUTPUT).set(),
    Pin(6, 'Y3', OUTPUT).set(),
    Pin(8, 'Y4', OUTPUT).set(),
    Pin(10, 'Y5', OUTPUT).set(),
    Pin(12, 'Y6', OUTPUT).set(),

    // Power supply and ground pins, not emulated
    Pin(14, 'Vcc'),
    Pin(7, 'GND'),
  )

  const dataListener = gate => {
    const apin = chip[`A${gate}`]
    const ypin = chip[`Y${gate}`]

    return () => (ypin.level = +apin.low)
  }

  for (const i of range(1, 6, true)) {
    chip[`A${i}`].addListener(dataListener(i))
  }

  return chip
}
