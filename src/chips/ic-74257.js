// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 74257 quad 2-to-1 multiplexer.
//
// The 74257 is one of the 7400-series TTL logic chips, consisting of four 2-to-1
// multiplexers. Each multiplexer is essentially a switch which uses a single, shared select
// signal to choose which of its two inputs to reflect on its output. Each output is
// tri-state.
//
// This chip is exactly the same as the 74258 except that the latter has inverted outputs
// and this one doesn't.
//
// The inputs to each multiplexer are the A and B pins, and the Y pins are their outputs.
// The SEL pin selects between the A inputs (when SEL is low) and the B inputs (when SEL is
// high). This single pin selects the outputs for all four multiplexers simultaneously. The
// active low output-enable pin, OE, tri-states all four outputs when it's set high.
//
// | OE  | SEL | An  | Bn  || Yn  |
// | --- | --- | --- | --- || --- |
// | H   | X   | X   | X   || Z   |
// | L   | L   | L   | X   || L   |
// | L   | L   | H   | X   || H   |
// | L   | H   | X   | L   || L   |
// | L   | H   | X   | H   || H   |
//
// The chip comes in a 16-pin dual in-line package with the following pin assignments.
//
//         +---+--+---+
//     SEL |1  +--+ 16| Vcc
//      A1 |2       15| OE
//      B1 |3       14| A4
//      Y1 |4       13| B4
//      A2 |5 74257 12| Y4
//      B2 |6       11| A3
//      Y2 |7       10| B3
//     GND |8        9| Y3
//         +----------+
//
// GND and Vcc are ground and power supply pins respectively, and they are not emulated.
//
// In the Commodore 64, both U13 and U25 are 74LS257 chips (a lower-power, faster variant
// whose emulation is the same). They are used together to multiplex the CPU's 16 address
// lines into the 8 lines expected by the 4164 DRAM chips.

import Chip from 'components/chip'
import Pin from 'components/pin'
import { range } from 'utils'

const { INPUT, OUTPUT } = Pin

export default function Ic74257() {
  const chip = Chip(
    // Select. When this is low, the Y output pins will take on the same value as their A
    // input pins. When this is high, the Y output pins will instead take on the value of
    // their B input pins.
    Pin(1, 'SEL', INPUT),

    // Output enable. When this is high, all of the Y output pins will be forced into
    // hi-z, whatever the values of their input pins.
    Pin(15, 'OE', INPUT),

    // Group 1 inputs and output
    Pin(2, 'A1', INPUT),
    Pin(3, 'B1', INPUT),
    Pin(4, 'Y1', OUTPUT).clear(),

    // Group 2 input and output
    Pin(5, 'A2', INPUT),
    Pin(6, 'B2', INPUT),
    Pin(7, 'Y2', OUTPUT).clear(),

    // Group 3 inputs and output
    Pin(11, 'A3', INPUT),
    Pin(10, 'B3', INPUT),
    Pin(9, 'Y3', OUTPUT).clear(),

    // Group 4 inputs and output
    Pin(14, 'A4', INPUT),
    Pin(13, 'B4', INPUT),
    Pin(12, 'Y4', OUTPUT).clear(),

    // Power supply pins. These are not emulated.
    Pin(8, 'GND'),
    Pin(16, 'Vcc'),
  )

  const dataListener = mux => {
    const apin = chip[`A${mux}`]
    const bpin = chip[`B${mux}`]
    const ypin = chip[`Y${mux}`]

    return () => {
      if (chip.OE.high) {
        ypin.float()
      } else if (chip.SEL.low) {
        ypin.level = apin.level
      } else {
        ypin.level = bpin.level
      }
    }
  }

  const controlListener = () => {
    const listeners = [...range(1, 4, true)].map(i => dataListener(i))
    return () => listeners.forEach(listener => listener())
  }

  chip.SEL.addListener(controlListener())
  chip.OE.addListener(controlListener())
  for (const i of range(1, 4, true)) {
    chip[`A${i}`].addListener(dataListener(i))
    chip[`B${i}`].addListener(dataListener(i))
  }

  return chip
}
