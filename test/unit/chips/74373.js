/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { new74373 } from "chips/74373"

describe("74373 Octal tri-state transparent latch", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = new74373()
    traces = deviceTraces(chip)
    traces._OE.lower()
  })

  it("allows data to pass through when LE is true", () => {
    traces.LE.raise()

    for (let i = 0; i < 8; i++) {
      traces["D" + i].raise()
      expect(traces["O" + i].high).to.be.true
    }

    for (let i = 0; i < 8; i++) {
      traces["D" + i].lower()
      expect(traces["O" + i].low).to.be.true
    }
  })

  it("latches the data when LE goes false", () => {
    traces.LE.raise()

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].raise()
    }

    traces.LE.lower()

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].raise()
      expect(!!traces[`O${i}`].level).to.equal(i % 2 === 0)
    }
    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].lower()
      expect(!!traces[`O${i}`].level).to.equal(i % 2 === 0)
    }
  })

  it("returns to transparent data if false when LE returns to true", () => {
    traces.LE.raise()

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].raise()
    }

    traces.LE.lower()

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].raise()
      expect(!!traces[`O${i}`].level).to.equal(i % 2 === 0)
    }

    traces.LE.raise()

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].high).to.be.true
    }
  })

  it("sets all outputs to null when _OE is true", () => {
    traces.LE.raise()

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].raise()
    }

    traces._OE.raise()

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].level).to.be.null
    }

    traces._OE.lower()

    for (let i = 0; i < 8; i++) {
      expect(traces[`O${i}`].level).to.equal(1)
    }
  })

  it("remembers latched levels, returning them to the output pins after _OE goes false", () => {
    traces.LE.raise()

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].raise()
    }

    traces._OE.raise()

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].lower()
    }
    traces.LE.lower()

    traces._OE.lower()

    for (let i = 0; i < 8; i++) {
      expect(!!traces[`O${i}`].level).to.equal(i % 2 !== 0)
    }
  })
})
