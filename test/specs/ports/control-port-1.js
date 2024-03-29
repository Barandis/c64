// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, portCable, portMessage } from 'test/helper'
import { ControlPort1 } from 'ports'
import { range } from 'utils'

describe('Control port 1', () => {
  let port
  let cable
  let p
  let c

  beforeEach(() => {
    port = ControlPort1()
    cable = portCable(port)

    p = deviceTraces(port)
    c = deviceTraces(cable)

    for (const i of range(1, 9, true)) {
      p[i].clear()
      c[i].clear()
    }

    cable.connect(port)
  })

  it('reads data from 7 pins', () => {
    c.JOYA0.level = 0.9
    c.JOYA1.level = 0.8
    c.JOYA2.level = 0.7
    c.JOYA3.level = 0.6
    c.POTAY.level = 0.5
    c.BTNA_LP.level = 1
    c.POTAX.level = 0.4

    assert.level(p.JOYA0, 0.9, portMessage('JOYA0'))
    assert.level(p.JOYA1, 0.8, portMessage('JOYA1'))
    assert.level(p.JOYA2, 0.7, portMessage('JOYA2'))
    assert.level(p.JOYA3, 0.6, portMessage('JOYA3'))
    assert.level(p.POTAY, 0.5, portMessage('POTAY'))
    assert.level(p.BTNA_LP, 1, portMessage('BTNA_LP'))
    assert.level(p.POTAX, 0.4, portMessage('POTAX'))
  })
})
