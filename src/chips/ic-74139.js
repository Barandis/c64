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
 * In the Commodore 64, the two demultiplexers are chained together by
 * connecting one of the outputs from demux 1 to the enable pin of demux
 * 2. The inputs are the address lines `A8`-`A11`, and the enable pin of
 *    demux 1 comes directly from the PLA's `_IO` output. Thus the
 *    demultiplexers only do work when `_IO` is selected, which requires
 *    that the address be from 0xD000 - 0xDFFF, among other things. A
 *    more specific table for this setup can thus be created.
 *
 * | _IO   | A8    | A9    | A10   | A11   | Address | Active Output |
 * | :---: | :---: | :---: | :---: | :---: | :------ | :------------ |
 * | H     | X     | X     | X     | X     | N/A     | None          |
 * | L     | X     | X     | L     | L     | 0xD000 - 0xD3FF | VIC   |
 * | L     | X     | X     | H     | L     | 0xD400 - 0xD7FF | SID   |
 * | L     | X     | X     | L     | H   | 0xD800 - 0xDBFF | Color RAM |
 * | L     | L     | L     | H     | H     | 0xDC00 - 0xDCFF | CIA 1 |
 * | L     | H     | L     | H     | H     | 0xDD00 - 0xDDFF | CIA 2 |
 * | L     | L     | H     | H     | H     | 0xDE00 - 0xDEFF | I/O 1 |
 * | L     | H     | H     | H     | H     | 0xDF00 - 0xDFFF | I/O 2 |
 *
 * The decoding resolution is only 2 hexadecimal digits for the VIC,
 * SID, and color RAM and 3 hexadecimal digits for the CIAs and I/Os.
 * This means that there will be memory locations that repeat. For
 * example, the VIC only uses 64 addressable locations for its registers
 * (47 registers and 17 more unused addresses) but gets a 1024-address
 * block. The decoding can't tell the difference between 0xD000, 0xD040,
 * 0xD080, and so on because it can only resolve the first two digits,
 * so using any of those addresses will access the VIC's first register,
 * meaning that it's mirrored 16 times. The same goes for the SID (29
 * registers and 3 usused addresses, mirrored in 1024 addresses 32
 * times) and the CIAs (16 registers mirrored in 256 addresses 16
 * times). The color RAM is not mirrored at all (though it does use only
 * 1000 of its 1024 addresses) and the I/O blocks are free to be managed
 * by cartridges as they like.
 *
 * The chip comes in a 16-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +---+--+---+
 *     _G1 |1  +--+ 16| Vcc
 *      A1 |2       15| _G2
 *      B1 |3       14| A2
 *    _Y10 |4       13| B2
 *    _Y11 |5 74139 12| _Y20
 *    _Y12 |6       11| _Y21
 *    _Y13 |7       10| _Y22
 *     GND |8        9| _Y23
 *         +----------+
 * ```
 * *(`GND` and `Vcc` are ground and power supply pins respectively, and
 * they are not emulated.)*
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

import Chip from 'components/chip'
import Pin from 'components/pin'
import { range } from 'utils'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT

export class Ic74139 extends Chip {
  constructor() {
    super(
    // Demultiplexer 1
      new Pin(2, 'A1', INPUT),
      new Pin(3, 'B1', INPUT),
      new Pin(4, '_Y10', OUTPUT).clear(),
      new Pin(5, '_Y11', OUTPUT).set(),
      new Pin(6, '_Y12', OUTPUT).set(),
      new Pin(7, '_Y13', OUTPUT).set(),
      new Pin(1, '_G1', INPUT),

      // Demultiplexer 2
      new Pin(14, 'A2', INPUT),
      new Pin(13, 'B2', INPUT),
      new Pin(12, '_Y20', OUTPUT).clear(),
      new Pin(11, '_Y21', OUTPUT).set(),
      new Pin(10, '_Y22', OUTPUT).set(),
      new Pin(9, '_Y23', OUTPUT).set(),
      new Pin(15, '_G2', INPUT),

      // Power supply and ground pins. These are not emulated.
      new Pin(16, 'Vcc'),
      new Pin(8, 'GND'),
    )

    for (const i of range(1, 2, true)) {
      this[`_G${i}`].addListener(this.#dataListener(i))
      this[`A${i}`].addListener(this.#dataListener(i))
      this[`B${i}`].addListener(this.#dataListener(i))
    }
  }

  #dataListener (demux) {
    const gpin = this[`_G${demux}`]
    const apin = this[`A${demux}`]
    const bpin = this[`B${demux}`]
    const y0pin = this[`_Y${demux}0`]
    const y1pin = this[`_Y${demux}1`]
    const y2pin = this[`_Y${demux}2`]
    const y3pin = this[`_Y${demux}3`]

    return () => {
      y0pin.level = 1 - (gpin.low && apin.low && bpin.low)
      y1pin.level = 1 - (gpin.low && apin.high && bpin.low)
      y2pin.level = 1 - (gpin.low && apin.low && bpin.high)
      y3pin.level = 1 - (gpin.low && apin.high && bpin.high)
    }
  }
}
