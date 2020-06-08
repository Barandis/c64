// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  ddrInput, ddrOutput, ddrCombo, ddrTimerOut, pdrReceive, pdrSend, pdrCombo,
  pdrTimerOut, pdrTriggerPc,
} from "./ic-6526/ports"
import {
  taDefault, taClockDec, taRegRollover, taStop, taContinue, taOneShot,
  taPbPulse, taPbToggle, taCntDec, taIrqDefault, taIrqFlagSet, taPbRemove,
} from "./ic-6526/timer-a"
import {
  tbDefault, tbClockDec, tbRegRollover, tbStop, tbContinue, tbOneShot,
  tbPbPulse, tbPbToggle, tbCntDec, tbUnderDec, tbCntUnderDec, tbIrqDefault,
  tbIrqFlagSet, tbPbRemove,
} from "./ic-6526/timer-b"
import {
  todAdvance, todAdvance50Hz, todSecond, todMinute, todHour, todAmPm, todPmAm,
  todBcdSec, todBcdMin, todBcdHour, todNoUpdate, todHalt, todIrqDefault,
  todIrqFlagSet,
} from "./ic-6526/tod"
import {
  spInput, spOutput, spReady, spIrqRxDefault, spIrqTxDefault, spIrqRxFlagSet,
  spIrqTxFlagSet, spInputWrite,
} from "./ic-6526/serial"
import { reset, flagFlagReset, flagDefault, flagFlagSet } from "./ic-6526/misc"

import { Ic6526 } from "chips/ic-6526"
import { valueToPins, pinsToValue } from "utils"
import { deviceTraces } from "test/helper"

describe("6526 CIA", () => {
  let chip
  let tr
  let addrTraces
  let dataTraces
  let paTraces
  let pbTraces

  beforeEach(() => {
    chip = Ic6526()
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

  const test = fn => () => fn({
    chip, tr, paTraces, pbTraces, writeRegister, readRegister,
  })

  describe("data direction registers", () => {
    it("can set all port pins to input", test(ddrInput))
    it("can set all port pins to output", test(ddrOutput))
    it(
      "can set port pins to a combination of input and output",
      test(ddrCombo)
    )
    it(
      "will not override PB6 and PB7 if set as timer outputs",
      test(ddrTimerOut)
    )
  })

  describe("peripheral data registers", () => {
    it("can receive data on all 8 pins", test(pdrReceive))
    it("can send data on all 8 pins", test(pdrSend))
    it("can send and receive on different pins", test(pdrCombo))
    it("cannot affect pins being used as timer outputs", test(pdrTimerOut))
    it("triggers _PC on port B register reads and writes", test(pdrTriggerPc))
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
      it("can revert PB6 back to port control", test(taPbRemove))

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
      it(
        "counts down by 1 for every Timer A underflow while CNT is high",
        test(tbCntUnderDec)
      )
      it("rolls over lo register into hi", test(tbRegRollover))
      it("stops counting down when CR bit 1 cleared", test(tbStop))
      it("restarts the countdown after reaching 0", test(tbContinue))
      it("does not restart the timer in one-shot mode", test(tbOneShot))
      it("pulses output to PB7 when PBON enabled", test(tbPbPulse))
      it("can toggle PB7 output", test(tbPbToggle))
      it("can revert PB7 back to port control", test(tbPbRemove))

      describe("interrupts", () => {
        it("does not fire an IRQ by default", test(tbIrqDefault))
        it("fires an IRQ if the appropriate flag is set", test(tbIrqFlagSet))
      })
    })
  })

  describe("time-of-day clock", () => {
    it("advances 1/10 sec every 6 TOD ticks", test(todAdvance))
    it("advances 1/10 sec every 5 TOD ticks at 50Hz", test(todAdvance50Hz))
    it("advances seconds every 10 tenths", test(todSecond))
    it("counts seconds in BCD", test(todBcdSec))
    it("advances minutes ever 60 seconds", test(todMinute))
    it("counts minutes in BCD", test(todBcdMin))
    it("advances hours ever 60 minutes", test(todHour))
    it("counts hours in BCD", test(todBcdHour))
    it("goes to PM after 11:59:59.9 AM", test(todAmPm))
    it("goes to AM after 11:59:59.9 PM", test(todPmAm))
    it(
      "doesn't update registers after reading hour until tenths read",
      test(todNoUpdate)
    )
    it("doesn't run after writing hour until tenths written", test(todHalt))

    describe("alarm", () => {
      it("does not fire an IRQ by default", test(todIrqDefault))
      it("fires an IRQ if the appropriate flag is set", test(todIrqFlagSet))
    })
  })

  describe("serial port", () => {
    it("can read in a byte strobed with CNT", test(spInput))
    it("ignores values put into SDR during receive", test(spInputWrite))
    it("can send out a byte strobed by timer A", test(spOutput))
    it("continues sending if a value is available in time", test(spReady))

    describe("interrupts", () => {
      it("does not fire an IRQ on receive by default", test(spIrqRxDefault))
      it("does not fire an IRQ on transmit by default", test(spIrqTxDefault))
      it(
        "fires an IRQ on receive if the appropriate flag is set",
        test(spIrqRxFlagSet)
      )
      it(
        "fires an IRQ on transmit if the appropriate flag is set",
        test(spIrqTxFlagSet)
      )
    })
  })

  describe("miscellaneous pin functions", () => {
    describe("reset", () => {
      it("resets all registers, data pins, CNT and _IRQ", test(reset))
    })

    describe("flag", () => {
      it("does not fire an IRQ by default when cleared", test(flagDefault))
      it("does fire an IRQ when cleared when ICR flag set", test(flagFlagSet))
      it(
        "does not fire an IRQ when cleared when ICR flag reset",
        test(flagFlagReset)
      )
    })
  })
})
