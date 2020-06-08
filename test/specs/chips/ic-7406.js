// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from "test/helper"
import { Ic7406 } from "chips/ic-7406"
import { range } from "utils"

describe("7406 hex inverter", () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic7406()
    traces = deviceTraces(chip)
  })

  it("sets output to false when the input is true", () => {
    for (const i of range(1, 6, true)) {
      traces[`A${i}`].set()
      assert(traces[`Y${i}`].low)
    }
  })

  it("sets output to true when the input is false", () => {
    for (const i of range(1, 6, true)) {
      traces[`A${i}`].clear()
      assert(traces[`Y${i}`].high)
    }
  })
})
