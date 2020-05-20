/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// An emulation of the 74257 family of quad dual-input tri-state multiplexers. The most commonly
// used member of this family was the 74LS257, but the differences between members are electrical
// in nature and this emulation will serve for all of them.
//
// This multiplexer chooses the value of its four output pins (Y1-Y4) based on the values of its
// input pins (A1-A4 and B1-B4) and the SEL pin. When SEL is low, the Y pins take on the value of
// the A pins of their groups (Y1 becomes A1's value, Y2 becomes A2's value, etc.). When SEL is
// high, the Y pins instead take on the value of their B pins instead.
//
// The output enable pin (_OE) is used to put all of the output pins into a high-impedence state,
// effectively disconnecting them from whatever circuit they're connected to. A low _OE means normal
// operation; setting _OE high forces the outputs into hi-z no matter what the values of any other
// pins.
//
// Each multiplexer is independent of the other three. Their inputs and outputs are unaffected by
// the inputs and outputs of any other multiplexer. Only SEL and _OE affects all four multiplexers
// simultaneously.
//
// On the C64 schematic, both U13 and U25 were 74LS257's.

import { newPin, INPUT, OUTPUT, newPinArray, UNCONNECTED } from "components/pin"

export function new74257() {
  const pins = newPinArray(
    // Select. When this is low, the Y output pins will take on the same value as their A input
    // pins. When this is high, the Y output pins will instead take on the value of their B input
    // pins.
    newPin(1, "SEL", INPUT),

    // Output enable. When this is high, all of the Y output pins will be forced into hi-z, whatever
    // the values of their input pins.
    newPin(15, "_OE", INPUT),

    // Group 1 inputs and output
    newPin(2, "A1", INPUT),
    newPin(3, "B1", INPUT),
    newPin(4, "Y1", OUTPUT, false),

    // Group 2 input and output
    newPin(5, "A2", INPUT),
    newPin(6, "B2", INPUT),
    newPin(7, "Y2", OUTPUT, false),

    // Group 3 inputs and output
    newPin(11, "A3", INPUT),
    newPin(10, "B3", INPUT),
    newPin(9, "Y3", OUTPUT, false),

    // Group 4 inputs and output
    newPin(14, "A4", INPUT),
    newPin(13, "B4", INPUT),
    newPin(12, "Y4", OUTPUT, false),

    // Power supply pins. These are not emulated.
    newPin(8, "GND", UNCONNECTED),
    newPin(16, "VCC", UNCONNECTED),
  )

  // Sets the value of the output (Y) pin based on the values of its input pins (A and B) and the
  // select and output enable pins.
  function setOutput(apin, bpin, ypin) {
    if (pins._OE.high) {
      ypin.state = null
    } else if (pins.SEL.low) {
      ypin.state = apin.state
    } else {
      ypin.state = bpin.state
    }
  }

  // Sets Y1 based on A1, B1, SEL, and _OE.
  function setGroup1() {
    setOutput(pins.A1, pins.B1, pins.Y1)
  }

  // Sets Y2 based on A2, B2, SEL, and _OE.
  function setGroup2() {
    setOutput(pins.A2, pins.B2, pins.Y2)
  }

  // Sets Y3 based on A3, B3, SEL, and _OE.
  function setGroup3() {
    setOutput(pins.A3, pins.B3, pins.Y3)
  }

  // Sets Y4 based on A4, B4, SEL, and _OE.
  function setGroup4() {
    setOutput(pins.A4, pins.B4, pins.Y4)
  }

  // Fires when the value of SEL changes. This recalculates the values of all Y pins.
  pins.SEL.addListener(() => {
    setGroup1()
    setGroup2()
    setGroup3()
    setGroup4()
  })
  // Fires when the value of _OE changes. This recalculates the values of all Y pins.
  pins._OE.addListener(() => {
    setGroup1()
    setGroup2()
    setGroup3()
    setGroup4()
  })
  // Fired when the values of A or B pins change. They recalculate the value of the same group's
  // Y pin only.
  pins.A1.addListener(() => setGroup1())
  pins.B1.addListener(() => setGroup1())
  pins.A2.addListener(() => setGroup2())
  pins.B2.addListener(() => setGroup2())
  pins.A3.addListener(() => setGroup3())
  pins.B3.addListener(() => setGroup3())
  pins.A4.addListener(() => setGroup4())
  pins.B4.addListener(() => setGroup4())

  const mux = {
    pins,
  }

  for (const name in pins) {
    mux[name] = pins[name]
  }

  return mux
}
