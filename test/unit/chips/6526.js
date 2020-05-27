// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { deviceTraces } from "test/helper"
import { valueToPins, pinsToValue } from "utils"
import { new6526 } from "chips/6526"
import {
  ddrInput,
  ddrOutput,
  ddrCombo,
  ddrTimerOut,
  pdrReceive,
  pdrSend,
  pdrCombo,
  pdrTimerOut,
} from "./6526/ports"
import {
  taDefault,
  taClockDec,
  taRegRollover,
  taStop,
  taContinue,
  taOneShot,
  taPbPulse,
  taPbToggle,
  taCntDec,
  taIrqDefault,
  taIrqFlagSet,
} from "./6526/timer-a"
import {
  tbDefault,
  tbClockDec,
  tbRegRollover,
  tbStop,
  tbContinue,
  tbOneShot,
  tbPbPulse,
  tbPbToggle,
  tbCntDec,
  tbUnderDec,
  tbCntUnderDec,
  tbIrqDefault,
  tbIrqFlagSet,
} from "./6526/timer-b"

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

    tr.R__W.set()
    tr._CS.set()
    tr._RES.set()
    tr._FLAG.set()
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
    it("can send and receive on different pins", test(pdrCombo))
    it("cannot affect pins being used as timer outputs", test(pdrTimerOut))
  })

  describe("interval timers", () => {
    describe("timer A", () => {
      it("defaults to max value", test(taDefault))
      it("counts down by 1 every clock cycle", test(taClockDec))
      it("counts down by 1 for every CNT pulse", test(taCntDec))
      it("rolls over lo register into hi", test(taRegRollover))
      it("stops counting down when CR bit 1 cleared", test(taStop))
      it("restarts the countdown after reaching 0", test(taContinue))
      it("does not restart the timer in one-shot mode", test(taOneShot))
      it("pulses output to PB6 when PBON enabled", test(taPbPulse))
      it("can toggle PB6 output", test(taPbToggle))

      describe("interrupts", () => {
        it("does not fire an IRQ by default", test(taIrqDefault))
        it("fires an IRQ if the appropriate flag is set", test(taIrqFlagSet))
      })
    })

    describe("timer B", () => {
      it("defaults to max value", test(tbDefault))
      it("counts down by 1 every clock cycle", test(tbClockDec))
      it("counts down by 1 for every CNT pulse", test(tbCntDec))
      it("counts down by 1 for every Timer A underflow", test(tbUnderDec))
      it("counts down by 1 for every Timer A underflow while CNT is high", test(tbCntUnderDec))
      it("rolls over lo register into hi", test(tbRegRollover))
      it("stops counting down when CR bit 1 cleared", test(tbStop))
      it("restarts the countdown after reaching 0", test(tbContinue))
      it("does not restart the timer in one-shot mode", test(tbOneShot))
      it("pulses output to PB7 when PBON enabled", test(tbPbPulse))
      it("can toggle PB7 output", test(tbPbToggle))

      describe("interrupts", () => {
        it("does not fire an IRQ by default", test(tbIrqDefault))
        it("fires an IRQ if the appropriate flag is set", test(tbIrqFlagSet))
      })
    })
  })
})
