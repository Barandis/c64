// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, portCable, portMessage } from 'test/helper'
import { Control1Port } from 'ports'
import { range } from 'utils'

describe('Control port 1', () => {
  let port
  let cable
  let p
  let c

  beforeEach(() => {
    port = Control1Port()
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

    assert(p.JOYA0.level === 0.9, portMessage('JOYA0'))
    assert(p.JOYA1.level === 0.8, portMessage('JOYA1'))
    assert(p.JOYA2.level === 0.7, portMessage('JOYA2'))
    assert(p.JOYA3.level === 0.6, portMessage('JOYA3'))
    assert(p.POTAY.level === 0.5, portMessage('POTAY'))
    assert(p.BTNA_LP.level === 1, portMessage('BTNA_LP'))
    assert(p.POTAX.level === 0.4, portMessage('POTAX'))
  })
})
