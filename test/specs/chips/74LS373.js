/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces } from "test/helper"

import { create74LS373 } from "chips/74LS373"

import { createTrace, PULL_UP, PULL_DOWN } from "circuits/trace"
import { LOW, HIGH, HI_Z } from "circuits/state"

describe("74LS373 Octal tri-state transparent latch", () => {
  let chip
  const traces = []

  beforeEach(() => {
    chip = create74LS373()
    setupTraces(traces, chip)
    traces.VCC = createTrace(chip.VCC, PULL_UP)
    traces.GND = createTrace(chip.GND, PULL_DOWN)
  })

  it("allows data to pass through when LE is HIGH", () => {
    traces.LE.state = HIGH

    for (let i = 0; i < 8; i++) {
      traces["D" + i].state = HIGH
      expect(traces["O" + i].state).to.equal(HIGH)
    }

    for (let i = 0; i < 8; i++) {
      traces["D" + i].state = LOW
      expect(traces["O" + i].state).to.equal(LOW)
    }
  })

  it("latches the data when LE goes low", () => {
    traces.LE.state = HIGH

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].state = HIGH
    }

    traces.LE.state = LOW

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].state = HIGH
      expect(traces[`O${i}`].state).to.equal(i % 2 === 0 ? HIGH : LOW)
    }
    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].state = LOW
      expect(traces[`O${i}`].state).to.equal(i % 2 === 0 ? HIGH : LOW)
    }
  })

  it("returns to transparent data flow when LE returns to HIGH", () => {
    traces.LE.state = HIGH

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].state = HIGH
    }

    traces.LE.state = LOW

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].state = HIGH
      expect(traces[`O${i}`].state).to.equal(i % 2 === 0 ? HIGH : LOW)
    }

    traces.LE.state = HIGH

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].state).to.equal(HIGH)
    }
  })

  it("sets all outputs to HI_Z when _OE is HIGH", () => {
    traces.LE.state = HIGH

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].state = HIGH
    }

    traces._OE.state = HIGH

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].state).to.equal(HI_Z)
    }

    traces._OE.state = LOW

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].state).to.equal(HIGH)
    }
  })

  it("remembers latched states, returning them to the output pins after _OE goes low", () => {
    traces.LE.state = HIGH

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].state = HIGH
    }

    traces._OE.state = HIGH

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].state = LOW
    }
    traces.LE.state = LOW

    traces._OE.state = LOW

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].state).to.equal(i % 2 === 0 ? LOW : HIGH)
    }
  })
})
