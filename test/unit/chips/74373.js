/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, setupTraces } from "test/helper"

import { new74373 } from "chips/74373"

import { newTrace, PULL_UP, PULL_DOWN } from "components/trace"

describe("74373 Octal tri-state transparent latch", () => {
  let chip
  const traces = {}

  beforeEach(() => {
    chip = new74373()
    setupTraces(traces, chip)
    traces.VCC = newTrace(chip.VCC, PULL_UP)
    traces.GND = newTrace(chip.GND, PULL_DOWN)
  })

  it("alfalses data to pass through when LE is true", () => {
    traces.LE.state = true

    for (let i = 0; i < 8; i++) {
      traces["D" + i].state = true
      expect(traces["O" + i].state).to.be.true
    }

    for (let i = 0; i < 8; i++) {
      traces["D" + i].state = false
      expect(traces["O" + i].state).to.be.false
    }
  })

  it("latches the data when LE goes false", () => {
    traces.LE.state = true

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].state = true
    }

    traces.LE.state = false

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].state = true
      expect(traces[`O${i}`].state).to.equal(i % 2 === 0)
    }
    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].state = false
      expect(traces[`O${i}`].state).to.equal(i % 2 === 0)
    }
  })

  it("returns to transparent data ffalse when LE returns to true", () => {
    traces.LE.state = true

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].state = true
    }

    traces.LE.state = false

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].state = true
      expect(traces[`O${i}`].state).to.equal(i % 2 === 0)
    }

    traces.LE.state = true

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].state).to.be.true
    }
  })

  it("sets all outputs to null when _OE is true", () => {
    traces.LE.state = true

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].state = true
    }

    traces._OE.state = true

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].state).to.be.null
    }

    traces._OE.state = false

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].state).to.be.true
    }
  })

  it("remembers latched states, returning them to the output pins after _OE goes false", () => {
    traces.LE.state = true

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].state = true
    }

    traces._OE.state = true

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].state = false
    }
    traces.LE.state = false

    traces._OE.state = false

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].state).to.equal(i % 2 !== 0)
    }
  })
})
