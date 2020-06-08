// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from "test/helper"
import { Ic74373 } from "chips/ic-74373"

describe("74373 Octal tri-state transparent latch", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic74373()
    traces = deviceTraces(chip)
    traces._OE.clear()
  })

  it("allows data to pass through when LE is true", () => {
    traces.LE.set()

    for (let i = 0; i < 8; i++) {
      traces["D" + i].set()
      assert(traces["O" + i].high)
    }

    for (let i = 0; i < 8; i++) {
      traces["D" + i].clear()
      assert(traces["O" + i].low)
    }
  })

  it("latches the data when LE goes false", () => {
    traces.LE.set()

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].set()
    }

    traces.LE.clear()

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].set()
      assert(!!traces[`O${i}`].level === (i % 2 === 0))
    }
    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].clear()
      assert(!!traces[`O${i}`].level === (i % 2 === 0))
    }
  })

  it("returns to transparent data if false when LE returns to true", () => {
    traces.LE.set()

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].set()
    }

    traces.LE.clear()

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].set()
      assert(!!traces[`O${i}`].level === (i % 2 === 0))
    }

    traces.LE.set()

    for (let i = 0; i < 8; i++) {
      assert(traces[`O${i}`].high)
    }
  })

  it("sets all outputs to null when _OE is true", () => {
    traces.LE.set()

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].set()
    }

    traces._OE.set()

    for (let i = 0; i < 8; i++) {
      assert(traces[`O${i}`].floating)
    }

    traces._OE.clear()

    for (let i = 0; i < 8; i++) {
      assert(traces[`O${i}`].high)
    }
  })

  it("remembers latched levels", () => {
    traces.LE.set()

    for (let i = 0; i < 8; i++) {
      traces[`D${i}`].set()
    }

    traces._OE.set()

    for (let i = 0; i < 8; i += 2) {
      traces[`D${i}`].clear()
    }
    traces.LE.clear()

    traces._OE.clear()

    for (let i = 0; i < 8; i++) {
      assert(!!traces[`O${i}`].level === (i % 2 !== 0))
    }
  })
})
