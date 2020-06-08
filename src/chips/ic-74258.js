// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 74258 family of quad dual-input tri-state
// multiplexers. The most commonly used member of this family was the
// 74LS258, but the differences between members are electrical in nature
// and this emulation will serve for all of them. This IC differs from
// the 74LS257 in that this one inverts the outputs.
//
// This multiplexer chooses the value of its four output pins (Y1-Y4)
// based on the values of its input pins (A1-A4 and B1-B4) and the SEL
// pin. When SEL is low, the Y pins take on the inverse of the value of
// the A pins of their groups (Y1 becomes A1's value, Y2 becomes A2's
// value, etc.). When SEL is high, the Y pins instead take on the
// inverse of the value of their B pins instead.
//
// The output enable pin (_OE) is used to put all of the output pins
// into a high-impedence state, effectively disconnecting them from
// whatever circuit they're connected to. A low _OE means normal
// operation; setting _OE high forces the outputs into hi-z no matter
// what the values of any other pins.
//
// Each multiplexer is independent of the other three. Their inputs and
// outputs are unaffected by the inputs and outputs of any other
// multiplexer. Only SEL and _OE affects all four multiplexers
// simultaneously.
//
// On the C64 schematic, a 74LS258 is found at U14.

import { Pin, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { Chip } from "components/chip"

export function Ic74258() {
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
    Pin(4, "_Y1", OUTPUT, 1),

    // Group 2 input and output
    Pin(5, "A2", INPUT),
    Pin(6, "B2", INPUT),
    Pin(7, "_Y2", OUTPUT, 1),

    // Group 3 inputs and output
    Pin(11, "A3", INPUT),
    Pin(10, "B3", INPUT),
    Pin(9, "_Y3", OUTPUT, 1),

    // Group 4 inputs and output
    Pin(14, "A4", INPUT),
    Pin(13, "B4", INPUT),
    Pin(12, "_Y4", OUTPUT, 1),

    // Power supply pins. These are not emulated.
    Pin(8, "GND", UNCONNECTED),
    Pin(16, "VCC", UNCONNECTED),
  )

  // Sets the value of the output (Y) pin based on the values of its
  // input pins (A and B) and the select and output enable pins.
  function setOutput(apin, bpin, ypin) {
    if (chip._OE.high) {
      ypin.float()
    } else if (chip.SEL.low) {
      ypin.level = !apin.level
    } else {
      ypin.level = !bpin.level
    }
  }

  // Sets Y1 based on A1, B1, SEL, and _OE.
  function setGroup1() {
    setOutput(chip.A1, chip.B1, chip._Y1)
  }

  // Sets Y2 based on A2, B2, SEL, and _OE.
  function setGroup2() {
    setOutput(chip.A2, chip.B2, chip._Y2)
  }

  // Sets Y3 based on A3, B3, SEL, and _OE.
  function setGroup3() {
    setOutput(chip.A3, chip.B3, chip._Y3)
  }

  // Sets Y4 based on A4, B4, SEL, and _OE.
  function setGroup4() {
    setOutput(chip.A4, chip.B4, chip._Y4)
  }

  // Fires when the value of SEL changes. This recalculates the values
  // of all Y pins.
  chip.SEL.addListener(() => {
    setGroup1()
    setGroup2()
    setGroup3()
    setGroup4()
  })
  // Fires when the value of _OE changes. This recalculates the values
  // of all Y pins.
  chip._OE.addListener(() => {
    setGroup1()
    setGroup2()
    setGroup3()
    setGroup4()
  })
  // Fired when the values of A or B pins change. They recalculate the
  // value of the same group's Y pin only.
  chip.A1.addListener(() => setGroup1())
  chip.B1.addListener(() => setGroup1())
  chip.A2.addListener(() => setGroup2())
  chip.B2.addListener(() => setGroup2())
  chip.A3.addListener(() => setGroup3())
  chip.B3.addListener(() => setGroup3())
  chip.A4.addListener(() => setGroup4())
  chip.B4.addListener(() => setGroup4())

  return chip
}