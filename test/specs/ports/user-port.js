// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, portCable, cableMessage, portMessage } from 'test/helper'
import { UserPort } from 'ports'
import { range } from 'utils'

describe('User port', () => {
  let port
  let cable
  let p
  let c

  beforeEach(() => {
    port = new UserPort()
    cable = portCable(port)

    p = deviceTraces(port)
    c = deviceTraces(cable)

    for (const i of range(1, 24, true)) {
      if (i !== 2) {
        p[i].clear()
        c[i].clear()
      }
    }

    cable.connect(port)
  })

  it('writes to 1 pin', () => {
    p._PC2.level = 1
    assert(c._PC2.level === 1, cableMessage('_PC2'))
  })

  it('reads from 2 pins', () => {
    c.ATN.level = 1
    c._FLAG2.level = 2
    assert(p.ATN.level === 1, portMessage('ATN'))
    assert(p._FLAG2.level === 2, portMessage('_FLAG2'))
  })

  it('both reads and writes to 14 pins', () => {
    p._RESET.level = 1
    assert(c._RESET.level === 1, cableMessage('_RESET'))
    c._RESET.level = 0
    assert(p._RESET.level === 0, portMessage('_RESET'))

    p.CNT1.level = 1
    assert(c.CNT1.level === 1, cableMessage('CNT1'))
    c.CNT1.level = 0
    assert(p.CNT1.level === 0, portMessage('CNT1'))

    p.SP1.level = 1
    assert(c.SP1.level === 1, cableMessage('SP1'))
    c.SP1.level = 0
    assert(p.SP1.level === 0, portMessage('SP1'))

    p.CNT2.level = 1
    assert(c.CNT2.level === 1, cableMessage('CNT2'))
    c.CNT2.level = 0
    assert(p.CNT2.level === 0, portMessage('CNT2'))

    p.SP2.level = 1
    assert(c.SP2.level === 1, cableMessage('SP2'))
    c.SP2.level = 0
    assert(p.SP2.level === 0, portMessage('SP2'))

    p.PB0.level = 1
    assert(c.PB0.level === 1, cableMessage('PB0'))
    c.PB0.level = 0
    assert(p.PB0.level === 0, portMessage('PB0'))

    p.PB1.level = 1
    assert(c.PB1.level === 1, cableMessage('PB1'))
    c.PB1.level = 0
    assert(p.PB1.level === 0, portMessage('PB1'))

    p.PB2.level = 1
    assert(c.PB2.level === 1, cableMessage('PB2'))
    c.PB2.level = 0
    assert(p.PB2.level === 0, portMessage('PB2'))

    p.PB3.level = 1
    assert(c.PB3.level === 1, cableMessage('PB3'))
    c.PB3.level = 0
    assert(p.PB3.level === 0, portMessage('PB3'))

    p.PB4.level = 1
    assert(c.PB4.level === 1, cableMessage('PB4'))
    c.PB4.level = 0
    assert(p.PB4.level === 0, portMessage('PB4'))

    p.PB5.level = 1
    assert(c.PB5.level === 1, cableMessage('PB5'))
    c.PB5.level = 0
    assert(p.PB5.level === 0, portMessage('PB5'))

    p.PB6.level = 1
    assert(c.PB6.level === 1, cableMessage('PB6'))
    c.PB6.level = 0
    assert(p.PB6.level === 0, portMessage('PB6'))

    p.PB7.level = 1
    assert(c.PB7.level === 1, cableMessage('PB7'))
    c.PB7.level = 0
    assert(p.PB7.level === 0, portMessage('PB7'))

    p.PA2.level = 1
    assert(c.PA2.level === 1, cableMessage('PA2'))
    c.PA2.level = 0
    assert(p.PA2.level === 0, portMessage('PA2'))
  })
})
