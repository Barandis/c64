/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// Emulation of the 4066 quad bilateral switch.
//
// This chip contains four different independent switches. Each has a pair of bidirectional analog
// input/outputs and a single digital control input. If the control is low, then data passes freely
// back and forth across the data pins. When the control goes high, it acts as an opening switch,
// and the data input/outputs become disconnected.
//
// There is no hi-Z state with this chip. If the switch is opened, each data pin takes on the value
// dictated by the rest of its circuit.
//
// One challenge with this emulation is determining what value the input/output pins should take
// after the control pin returns to low. Reasoning that in most applications, one I/O pin will be
// used consistently for input and the other for output, I've implemented it so that the last pin
// set determines the value of both pins when the switch closes.
//
// This chip works fine with either analog or digital signals. In fact, in the Commodore 64 there
// are two 4066's, and one works with analog signals (the analog inputs of the control ports) while
// the other works with digital (part of the data bus).
//
// On the C64 schematic, U16 and U28 are 4066's.

import { createPin, INPUT, BIDIRECTIONAL } from "components/pin"

export function create4066() {
  const pins = {
    // I/O and control pins for switch 1
    X1: createPin(1, "X1", BIDIRECTIONAL),
    Y1: createPin(2, "Y1", BIDIRECTIONAL),
    A1: createPin(13, "A1", INPUT),

    // I/O and control pins for switch 2
    X2: createPin(3, "X2", BIDIRECTIONAL),
    Y2: createPin(4, "Y2", BIDIRECTIONAL),
    A2: createPin(5, "A2", INPUT),

    // I/O and control pins for switch 3
    X3: createPin(9, "X3", BIDIRECTIONAL),
    Y3: createPin(8, "Y3", BIDIRECTIONAL),
    A3: createPin(6, "A3", INPUT),

    // I/O and control pins for switch 4
    X4: createPin(11, "X4", BIDIRECTIONAL),
    Y4: createPin(10, "Y4", BIDIRECTIONAL),
    A4: createPin(12, "A4", INPUT),

    // Power supply and ground pins. These are not emulated.
    VDD: createPin(14, "VDD", "INPUT", null),
    GND: createPin(7, "GND", INPUT, null),
  }

  const last = [null, null, null, null]

  function setControl(num) {
    const apin = pins[`A${num}`]
    const xpin = pins[`X${num}`]
    const ypin = pins[`Y${num}`]

    if (apin.high) {
      xpin.mode = INPUT
      ypin.mode = INPUT
      xpin.reset()
      ypin.reset()
    } else {
      xpin.mode = BIDIRECTIONAL
      ypin.mode = BIDIRECTIONAL
      if (last[num - 1] === xpin) {
        ypin.value = xpin.value
      } else if (last[num - 1] === ypin) {
        xpin.value = ypin.value
      } else {
        xpin.value = 0
        ypin.value = 0
      }
    }
  }

  function setDataX(num) {
    const apin = pins[`A${num}`]
    const xpin = pins[`X${num}`]
    const ypin = pins[`Y${num}`]

    last[num - 1] = xpin
    if (apin.low) {
      ypin.value = xpin.value
    }
  }

  function setDataY(num) {
    const apin = pins[`A${num}`]
    const xpin = pins[`X${num}`]
    const ypin = pins[`Y${num}`]

    last[num - 1] = ypin
    if (apin.low) {
      xpin.value = ypin.value
    }
  }

  pins.A1.addListener(() => setControl(1))
  pins.X1.addListener(() => setDataX(1))
  pins.Y1.addListener(() => setDataY(1))
  pins.A2.addListener(() => setControl(2))
  pins.X2.addListener(() => setDataX(2))
  pins.Y2.addListener(() => setDataY(2))
  pins.A3.addListener(() => setControl(3))
  pins.X3.addListener(() => setDataX(3))
  pins.Y3.addListener(() => setDataY(3))
  pins.A4.addListener(() => setControl(4))
  pins.X4.addListener(() => setDataX(4))
  pins.Y4.addListener(() => setDataY(4))

  const switches = {
    pins,
  }

  for (const name in pins) {
    switches[name] = pins[name]
  }

  return switches
}
