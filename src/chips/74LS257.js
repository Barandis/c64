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

import { createPin, INPUT, OUTPUT } from "circuits/pin"
import { LOW, HIGH, HI_Z } from "circuits/state"

export function create74LS257() {
  const pins = {
    // Select. When this is low, the Y output pins will take on the same value as their A input
    // pins. When this is high, the Y output pins will instead take on the value of their B input
    // pins.
    SEL: createPin(1, "SEL", INPUT),

    // Output enable. When this is high, all of the Y output pins will be forced into hi-z, whatever
    // the values of their input pins.
    _OE: createPin(15, "_OE", INPUT),

    // Group 1 inputs and output
    A1: createPin(2, "A1", INPUT),
    B1: createPin(3, "B1", INPUT),
    Y1: createPin(4, "Y1", OUTPUT),

    // Group 2 input and output
    A2: createPin(5, "A2", INPUT),
    B2: createPin(6, "B2", INPUT),
    Y2: createPin(7, "Y2", OUTPUT),

    // Group 3 inputs and output
    A3: createPin(11, "A3", INPUT),
    B3: createPin(10, "B3", INPUT),
    Y3: createPin(9, "Y3", OUTPUT),

    // Group 4 inputs and output
    A4: createPin(14, "A4", INPUT),
    B4: createPin(13, "B4", INPUT),
    Y4: createPin(12, "Y4", OUTPUT),

    // Power supply pins. These are not emulated.
    GND: createPin(8, "GND", INPUT, HI_Z),
    VCC: createPin(16, "VCC", INPUT, HI_Z),
  }

  // Sets the value of the output (Y) pin based on the values of its input pins (A and B) and the
  // select and output enable pins.
  function setOutput(apin, bpin, ypin) {
    if (pins._OE.state === HIGH) {
      ypin.state = HI_Z
    } else if (pins.SEL.state === LOW) {
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
