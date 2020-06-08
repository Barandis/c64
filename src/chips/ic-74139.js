// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 74139 family of dual 2-line to 4-line
// demultiplexers. The variant used in the Commodore 64 was the 74LS139,
// but as the variants differ only in timing and electrical levels, this
// emulation should work well for them all.
//
// The 74LS139 takes two input lines and, depending on which of the four
// possible states they're in (00, 01, 10, and 11), activates one of the
// four output pins. The output pins are active low, so at any given
// time one of them will be low while the others are high. An exception
// to this comes from an additional input per demultiplexer, an enable
// signal. If this active-low pin is set high, then all outputs for that
// demux are also high. Note that this is not a tri-state device;
// "deactivating" a demux sets all of the outputs to high, not to a
// high-impedance state.
//
// On the C64 schematic, a 74LS139 can be found as U15.

import { Pin, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { Chip } from "components/chip"

export function Ic74139() {
  // A typical naming scheme for these pins (Fairchild, Texas
  // Instruments) has the outputs as 1Y0, 1Y1, etc. (TI also has the
  // inputs in this number-first form, 1G, 1A, and 1B, for instance).
  // Since using these names wouldn't allow access with the dot
  // operator, I've moved the first number after the letter. (There are
  // other schemes as well - an ON Semiconductor datasheet lists them as
  // Ea, A0a, A1a, O0a, O1a, etc., but A, B, and Y is closer to what is
  // written on the schematic.)
  const chip = Chip(
    // Demultiplexer 1
    Pin(2, "A1", INPUT),
    Pin(3, "B1", INPUT),
    Pin(4, "_Y10", OUTPUT, 0),
    Pin(5, "_Y11", OUTPUT, 1),
    Pin(6, "_Y12", OUTPUT, 1),
    Pin(7, "_Y13", OUTPUT, 1),
    Pin(1, "_G1", INPUT),

    // Demultiplexer 2
    Pin(14, "A2", INPUT),
    Pin(13, "B2", INPUT),
    Pin(12, "_Y20", OUTPUT, 0),
    Pin(11, "_Y21", OUTPUT, 1),
    Pin(10, "_Y22", OUTPUT, 1),
    Pin(9, "_Y23", OUTPUT, 1),
    Pin(15, "_G2", INPUT),

    // Power supply and ground pins. These are not emulated.
    Pin(16, "VCC", UNCONNECTED),
    Pin(8, "GND", UNCONNECTED),
  )

  function setOutput(gpin, apin, bpin, y0pin, y1pin, y2pin, y3pin) {
    y0pin.level = !(gpin.low && apin.low && bpin.low)
    y1pin.level = !(gpin.low && apin.high && bpin.low)
    y2pin.level = !(gpin.low && apin.low && bpin.high)
    y3pin.level = !(gpin.low && apin.high && bpin.high)
  }

  function setDemux1() {
    setOutput(
      chip._G1, chip.A1, chip.B1, chip._Y10, chip._Y11, chip._Y12, chip._Y13
    )
  }

  function setDemux2() {
    setOutput(
      chip._G2, chip.A2, chip.B2, chip._Y20, chip._Y21, chip._Y22, chip._Y23
    )
  }

  chip._G1.addListener(setDemux1)
  chip.A1.addListener(setDemux1)
  chip.B1.addListener(setDemux1)
  chip._G2.addListener(setDemux2)
  chip.A2.addListener(setDemux2)
  chip.B2.addListener(setDemux2)

  return chip
}
