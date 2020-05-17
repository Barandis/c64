/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// An emulation of the 74139 family of dual 2-line to 4-line demultiplexers. The variant used in the
// Commodore 64 was the 74LS139, but as the variants differ only in timing and electrical levels,
// this emulation should work well for them all.
//
// The 74LS139 takes two input lines and, depending on which of the four possible states they're in
// (00, 01, 10, and 11), activates one of the four output pins. The output pins are active low, so
// at any given time one of them will be low while the others are high. An exception to this comes
// from an additional input per demultiplexer, an enable signal. If this active-low pin is set high,
// then all outputs for that demux are also high. Note that this is not a tri-state device;
// "deactivating" a demux sets all of the outputs to high, not to a high-impedance state.
//
// On the C64 schematic, a 74LS139 can be found as U15.

import { createPin, INPUT, OUTPUT } from "circuits/pin"
import { LOW, HIGH, HI_Z } from "circuits/state"

export function create74LS139() {
  // A typical naming scheme for these pins (Fairchild, Texas Instruments) has the outputs as 1Y0,
  // 1Y1, etc. (TI also has the inputs in this number-first form, 1G, 1A, and 1B, for instance).
  // Since using these names wouldn't allow access with the dot operator, I've moved the first
  // number after the letter. (There are other schemes as well - an ON Semiconductor datasheet lists
  // them as Ea, A0a, A1a, O0a, O1a, etc., but A, B, and Y is closer to what is written on the
  // schematic.)
  const pins = {
    // Demultiplexer 1
    A1: createPin(2, "A1", INPUT),
    B1: createPin(3, "B1", INPUT),
    _Y10: createPin(4, "_Y10", OUTPUT, LOW),
    _Y11: createPin(5, "_Y11", OUTPUT, HIGH),
    _Y12: createPin(6, "_Y12", OUTPUT, HIGH),
    _Y13: createPin(7, "_Y13", OUTPUT, HIGH),
    _G1: createPin(1, "_G1", INPUT),

    // Demultiplexer 2
    A2: createPin(14, "A2", INPUT),
    B2: createPin(13, "B2", INPUT),
    _Y20: createPin(12, "_Y20", OUTPUT, LOW),
    _Y21: createPin(11, "_Y21", OUTPUT, HIGH),
    _Y22: createPin(10, "_Y22", OUTPUT, HIGH),
    _Y23: createPin(9, "_Y23", OUTPUT, HIGH),
    _G2: createPin(15, "_G2", INPUT),

    // Power supply and ground pins. These are not emulated.
    VCC: createPin(16, "VCC", INPUT, HI_Z),
    GND: createPin(8, "GND", INPUT, HI_Z),
  }

  function setOutput(gpin, apin, bpin, y0pin, y1pin, y2pin, y3pin) {
    y0pin.state = !(gpin.low && apin.low && bpin.low)
    y1pin.state = !(gpin.low && apin.high && bpin.low)
    y2pin.state = !(gpin.low && apin.low && bpin.high)
    y3pin.state = !(gpin.low && apin.high && bpin.high)
  }

  function setDemux1() {
    setOutput(pins._G1, pins.A1, pins.B1, pins._Y10, pins._Y11, pins._Y12, pins._Y13)
  }

  function setDemux2() {
    setOutput(pins._G2, pins.A2, pins.B2, pins._Y20, pins._Y21, pins._Y22, pins._Y23)
  }

  pins._G1.addListener(setDemux1)
  pins.A1.addListener(setDemux1)
  pins.B1.addListener(setDemux1)
  pins._G2.addListener(setDemux2)
  pins.A2.addListener(setDemux2)
  pins.B2.addListener(setDemux2)

  const demux = {
    pins,
  }

  for (const name in pins) {
    demux[name] = pins[name]
  }

  return demux
}
