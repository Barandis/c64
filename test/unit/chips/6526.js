// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { deviceTraces } from "test/helper"
import { valueToPins, pinsToValue } from "utils"
import { new6526 } from "chips/6526"
import { ddrInput, ddrOutput, ddrCombo, ddrTimerOut, pdrReceive, pdrSend } from "./6526/ports"

describe("6526 CIA", () => {
  let chip
  let tr
  let addrTraces
  let dataTraces
  let paTraces
  let pbTraces

  beforeEach(() => {
    chip = new6526()
    tr = deviceTraces(chip)

    addrTraces = [tr.RS0, tr.RS1, tr.RS2, tr.RS3]
    dataTraces = [tr.D0, tr.D1, tr.D2, tr.D3, tr.D4, tr.D5, tr.D6, tr.D7]
    paTraces = [tr.PA0, tr.PA1, tr.PA2, tr.PA3, tr.PA4, tr.PA5, tr.PA6, tr.PA7]
    pbTraces = [tr.PB0, tr.PB1, tr.PB2, tr.PB3, tr.PB4, tr.PB5, tr.PB6, tr.PB7]

    tr._CS.set()
    tr.R__W.set()
    tr._FLAG.set()
    chip._IRQ.float()
  })

  function writeRegister(register, value) {
    valueToPins(value, ...dataTraces)
    valueToPins(register, ...addrTraces)
    tr.R__W.clear()
    tr._CS.clear()
    tr._CS.set()
    tr.R__W.set()
  }

  function readRegister(register) {
    valueToPins(register, ...addrTraces)
    tr._CS.clear()
    const value = pinsToValue(...dataTraces)
    tr._CS.set()
    return value
  }

  const test = fn => () => fn({ chip, tr, paTraces, pbTraces, writeRegister, readRegister })

  describe("data direction registers", () => {
    it("can set all port pins to input", test(ddrInput))
    it("can set all port pins to output", test(ddrOutput))
    it("can set port pins to a combination of input and output", test(ddrCombo))
    it("will not override PB6 and PB7 if set as timer outputs", test(ddrTimerOut))
  })
  describe("peripheral data registers", () => {
    it("can receive data on all 8 pins", test(pdrReceive))
    it("can send data on all 8 pins", test(pdrSend))
  })
})
