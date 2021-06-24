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
    port = UserPort()
    cable = portCable(port)

    p = deviceTraces(port)
    c = deviceTraces(cable)

    for (const i of range(1, 24, true)) {
      p[i].clear()
      c[i].clear()
    }

    cable.connect(port)
  })

  it('writes to 1 pin', () => {
    p.PC2.level = 1
    assert.level(c.PC2, 1, cableMessage('PC2'))
  })

  it('reads from 2 pins', () => {
    c.ATN.level = 1
    c.FLAG2.level = 2
    assert.level(p.ATN, 1, portMessage('ATN'))
    assert.level(p.FLAG2, 2, portMessage('FLAG2'))
  })

  it('both reads and writes to 14 pins', () => {
    p.RESET.level = 1
    assert.level(c.RESET, 1, cableMessage('RESET'))
    c.RESET.level = 0
    assert.level(p.RESET, 0, portMessage('RESET'))

    p.CNT1.level = 1
    assert.level(c.CNT1, 1, cableMessage('CNT1'))
    c.CNT1.level = 0
    assert.level(p.CNT1, 0, portMessage('CNT1'))

    p.SP1.level = 1
    assert.level(c.SP1, 1, cableMessage('SP1'))
    c.SP1.level = 0
    assert.level(p.SP1, 0, portMessage('SP1'))

    p.CNT2.level = 1
    assert.level(c.CNT2, 1, cableMessage('CNT2'))
    c.CNT2.level = 0
    assert.level(p.CNT2, 0, portMessage('CNT2'))

    p.SP2.level = 1
    assert.level(c.SP2, 1, cableMessage('SP2'))
    c.SP2.level = 0
    assert.level(p.SP2, 0, portMessage('SP2'))

    p.PB0.level = 1
    assert.level(c.PB0, 1, cableMessage('PB0'))
    c.PB0.level = 0
    assert.level(p.PB0, 0, portMessage('PB0'))

    p.PB1.level = 1
    assert.level(c.PB1, 1, cableMessage('PB1'))
    c.PB1.level = 0
    assert.level(p.PB1, 0, portMessage('PB1'))

    p.PB2.level = 1
    assert.level(c.PB2, 1, cableMessage('PB2'))
    c.PB2.level = 0
    assert.level(p.PB2, 0, portMessage('PB2'))

    p.PB3.level = 1
    assert.level(c.PB3, 1, cableMessage('PB3'))
    c.PB3.level = 0
    assert.level(p.PB3, 0, portMessage('PB3'))

    p.PB4.level = 1
    assert.level(c.PB4, 1, cableMessage('PB4'))
    c.PB4.level = 0
    assert.level(p.PB4, 0, portMessage('PB4'))

    p.PB5.level = 1
    assert.level(c.PB5, 1, cableMessage('PB5'))
    c.PB5.level = 0
    assert.level(p.PB5, 0, portMessage('PB5'))

    p.PB6.level = 1
    assert.level(c.PB6, 1, cableMessage('PB6'))
    c.PB6.level = 0
    assert.level(p.PB6, 0, portMessage('PB6'))

    p.PB7.level = 1
    assert.level(c.PB7, 1, cableMessage('PB7'))
    c.PB7.level = 0
    assert.level(p.PB7, 0, portMessage('PB7'))

    p.PA2.level = 1
    assert.level(c.PA2, 1, cableMessage('PA2'))
    c.PA2.level = 0
    assert.level(p.PA2, 0, portMessage('PA2'))
  })
})
