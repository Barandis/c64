// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Ic7406 from 'chips/ic-7406'
import { assert, deviceTraces } from 'test/helper'
import { range } from 'utils'

describe('7406 hex inverter', () => {
  let chip
  let traces

  beforeEach(() => {
    chip = Ic7406()
    traces = deviceTraces(chip)
  })

  it('sets output to low when the input is high', () => {
    for (const i of range(1, 6, true)) {
      traces[`A${i}`].set()
      assert.isLow(traces[`Y${i}`], `Y${i} should be low when A${i} is high`)
    }
  })

  it('sets output to high when the input is low', () => {
    for (const i of range(1, 6, true)) {
      traces[`A${i}`].clear()
      assert.isHigh(traces[`Y${i}`], `Y${i} should be high when A${i} is low`)
    }
  })
})
