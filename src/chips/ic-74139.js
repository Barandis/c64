// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 74139 dual 2-to-4 demultiplexer.
//
// The 74139 is one of the 7400-series TTL logic chips, consisting of a paior of 2-input,
// 4-output demultiplexers. There are four possible binary combinations on two pins (LL, HL,
// LH, and HH), and each of these combinations selects a different one of the output pins to
// activate. Each demultiplexer also has an enable pin.
//
// Most literature names the pins with numbers first. This makes sense since there are
// really two numbers that go into the output's name (the demultiplexer number and the
// output number) and having a letter separate them is quite readable. But since each of
// these pin names becomes a property on the chip, that scheme cannot be used here.
// Therefore each demultiplexer has two inputs starting with A and B, an active-low enable
// pin starting with G, and four inverted outputs whose names start with Y.
//
// | Gn  | An  | Bn  || Yn0 | Yn1 | Yn2 | Yn3 |
// | --- | --- | --- || --- | --- | --- | --- |
// | H   | X   | X   || H   | H   | H   | H   |
// | L   | L   | L   || L   | H   | H   | H   |
// | L   | H   | L   || H   | L   | H   | H   |
// | L   | L   | H   || H   | H   | L   | H   |
// | L   | H   | H   || H   | H   | H   | L   |
//
// In the Commodore 64, the two demultiplexers are chained together by connecting one of the
// outputs from demux 1 to the enable pin of demux 2. The inputs are the address lines
// A8-A11, and the enable pin of demux 1 comes directly from the PLA's IO output. Thus the
// demultiplexers only do work when IO is selected, which requires that the address be from
// $D000 - $DFFF, among other things. A more specific table for this setup can thus be
// created.
//
// | IO  | A8  | A9  | A10 | A11 | Address       || Active Output |
// | --- | --- | --- | --- | --- | ------------- || ------------- |
// | H   | X   | X   | X   | X   | N/A           || None          |
// | L   | X   | X   | L   | L   | $D000 - $D3FF || VIC           |
// | L   | X   | X   | H   | L   | $D400 - $D7FF || SID           |
// | L   | X   | X   | L   | H   | $D800 - $DBFF || Color RAM     |
// | L   | L   | L   | H   | H   | $DC00 - $DCFF || CIA 1         |
// | L   | H   | L   | H   | H   | $DD00 - $DDFF || CIA 2         |
// | L   | L   | H   | H   | H   | $DE00 - $DEFF || I/O 1         |
// | L   | H   | H   | H   | H   | $DF00 - $DFFF || I/O 2         |
//
// The decoding resolution is only 2 hexadecimal digits for the VIC, SID, and color RAM and
// 3 hexadecimal digits for the CIAs and I/Os. This means that there will be memory
// locations that repeat. For example, the VIC only uses 64 addressable locations for its
// registers (47 registers and 17 more unused addresses) but gets a 1024-address block. The
// decoding can't tell the difference between $D000, $D040, $D080, and so on because it can
// only resolve the first two digits, so using any of those addresses will access the VIC's
// first register, meaning that it's mirrored 16 times. The same goes for the SID (29
// registers and 3 usused addresses, mirrored in 1024 addresses 32 times) and the CIAs (16
// registers mirrored in 256 addresses 16 times). The color RAM is not mirrored at all
// (though it does use only 1000 of its 1024 addresses) and the I/O blocks are free to be
// managed by cartridges as they like.
//
// The chip comes in a 16-pin dual in-line package with the following pin assignments.
//
//          +---+--+---+
//       G1 |1  +--+ 16| Vcc
//       A1 |2       15| G2
//       B1 |3       14| A2
//      Y10 |4       13| B2
//      Y11 |5 74139 12| Y20
//      Y12 |6       11| Y21
//      Y13 |7       10| Y22
//      GND |8        9| Y23
//          +----------+
//
// GND and Vcc are ground and power supply pins respectively, and they are not emulated.
//
// In the Commodore 64, U15 is a 74LS139 (a lower-power, faster variant whose emulation is
// the same). Its two demultiplexers are chained together to provide additional address
// decoding when the PLA's IO output is selected.

import Chip from 'components/chip'
import Pin from 'components/pin'
import Pins from 'components/pins'
import { range } from 'utils'

const { INPUT, OUTPUT } = Pin

export default function Ic74139() {
  const pins = Pins(
    // Demultiplexer 1
    Pin(2, 'A1', INPUT),
    Pin(3, 'B1', INPUT),
    Pin(4, 'Y10', OUTPUT).clear(),
    Pin(5, 'Y11', OUTPUT).set(),
    Pin(6, 'Y12', OUTPUT).set(),
    Pin(7, 'Y13', OUTPUT).set(),
    Pin(1, 'G1', INPUT),

    // Demultiplexer 2
    Pin(14, 'A2', INPUT),
    Pin(13, 'B2', INPUT),
    Pin(12, 'Y20', OUTPUT).clear(),
    Pin(11, 'Y21', OUTPUT).set(),
    Pin(10, 'Y22', OUTPUT).set(),
    Pin(9, 'Y23', OUTPUT).set(),
    Pin(15, 'G2', INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(16, 'Vcc'),
    Pin(8, 'GND'),
  )

  const dataListener = demux => {
    const gpin = pins[`G${demux}`]
    const apin = pins[`A${demux}`]
    const bpin = pins[`B${demux}`]
    const y0pin = pins[`Y${demux}0`]
    const y1pin = pins[`Y${demux}1`]
    const y2pin = pins[`Y${demux}2`]
    const y3pin = pins[`Y${demux}3`]

    return () => {
      y0pin.level = 1 - (gpin.low && apin.low && bpin.low)
      y1pin.level = 1 - (gpin.low && apin.high && bpin.low)
      y2pin.level = 1 - (gpin.low && apin.low && bpin.high)
      y3pin.level = 1 - (gpin.low && apin.high && bpin.high)
    }
  }

  for (const i of range(1, 2, true)) {
    pins[`G${i}`].addListener(dataListener(i))
    pins[`A${i}`].addListener(dataListener(i))
    pins[`B${i}`].addListener(dataListener(i))
  }

  return Chip(pins)
}
