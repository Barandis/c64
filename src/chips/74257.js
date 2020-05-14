/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, OUTPUT } from "circuits/pin"
import { LOW, HIGH, TRI } from "circuits/state"

export const SEL = 0
export const A1 = 1
export const B1 = 2
export const Y1 = 3
export const A2 = 4
export const B2 = 5
export const Y2 = 6
export const GND = 7
export const Y3 = 8
export const B3 = 9
export const A3 = 10
export const Y4 = 11
export const B4 = 12
export const A4 = 13
export const _OE = 14
export const VCC = 15

export function create74257() {
  const pins = [
    createPin(1, "SEL"),
    createPin(2, "A1"),
    createPin(3, "B1"),
    createPin(4, "Y1", OUTPUT),
    createPin(5, "A2"),
    createPin(6, "B2"),
    createPin(7, "Y2", OUTPUT),
    createPin(8, "GND", INPUT, TRI),
    createPin(9, "Y3", OUTPUT),
    createPin(10, "B3"),
    createPin(11, "A3"),
    createPin(12, "Y4", OUTPUT),
    createPin(13, "B4"),
    createPin(14, "A4"),
    createPin(15, "_OE"),
    createPin(16, "VCC", INPUT, TRI),
  ]

  function setOutput(apin, bpin, ypin) {
    if (pins[_OE].state === HIGH) {
      ypin.state = TRI
    } else if (pins[SEL].state === LOW) {
      ypin.state = apin.state
    } else {
      ypin.state = bpin.state
    }
  }

  function setGroup1() {
    setOutput(pins[A1], pins[B1], pins[Y1])
  }

  function setGroup2() {
    setOutput(pins[A2], pins[B2], pins[Y2])
  }

  function setGroup3() {
    setOutput(pins[A3], pins[B3], pins[Y3])
  }

  function setGroup4() {
    setOutput(pins[A4], pins[B4], pins[Y4])
  }

  pins[SEL].addListener(() => {
    setGroup1()
    setGroup2()
    setGroup3()
    setGroup4()
  })
  pins[_OE].addListener(() => {
    setGroup1()
    setGroup2()
    setGroup3()
    setGroup4()
  })
  pins[A1].addListener(() => setGroup1())
  pins[B1].addListener(() => setGroup1())
  pins[A2].addListener(() => setGroup2())
  pins[B2].addListener(() => setGroup2())
  pins[A3].addListener(() => setGroup3())
  pins[B3].addListener(() => setGroup3())
  pins[A4].addListener(() => setGroup4())
  pins[B4].addListener(() => setGroup4())

  return {
    pins,
  }
}
