// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, portCable, portMessage, cableMessage } from 'test/helper'
import { ExpansionPort } from 'ports'
import { range } from 'utils'

describe('Expansion port', () => {
  let port
  let cable
  let p
  let c

  beforeEach(() => {
    port = ExpansionPort()
    cable = portCable(port)

    p = deviceTraces(port)
    c = deviceTraces(cable)

    for (const i of range(1, 20, true)) {
      if (i !== 2) {
        p[i].clear()
        c[i].clear()
      }
    }

    cable.connect(port)
  })

  it('writes to 24 pins', () => {
    p.R__W.level = 1
    p.φDOT.level = 2
    p._IO1.level = 3
    p._IO2.level = 4
    p._ROML.level = 5
    p.BA.level = 6
    p._ROMH.level = 7
    p.φ2.level = 8
    p.A15.level = 9
    p.A14.level = 10
    p.A13.level = 11
    p.A12.level = 12
    p.A11.level = 13
    p.A10.level = 14
    p.A9.level = 15
    p.A8.level = 16
    p.A7.level = 17
    p.A6.level = 18
    p.A5.level = 19
    p.A4.level = 20
    p.A3.level = 21
    p.A2.level = 22
    p.A1.level = 23
    p.A0.level = 24

    assert(p.R__W.level === 1, cableMessage('R__W'))
    assert(p.φDOT.level === 2, cableMessage('φDOT'))
    assert(p._IO1.level === 3, cableMessage('_IO1'))
    assert(p._IO2.level === 4, cableMessage('_IO2'))
    assert(p._ROML.level === 5, cableMessage('_ROML'))
    assert(p.BA.level === 6, cableMessage('BA'))
    assert(p._ROMH.level === 7, cableMessage('_ROMH'))
    assert(p.φ2.level === 8, cableMessage('φ2'))
    assert(p.A15.level === 9, cableMessage('A15'))
    assert(p.A14.level === 10, cableMessage('A14'))
    assert(p.A13.level === 11, cableMessage('A13'))
    assert(p.A12.level === 12, cableMessage('A12'))
    assert(p.A11.level === 13, cableMessage('A11'))
    assert(p.A10.level === 14, cableMessage('A10'))
    assert(p.A9.level === 15, cableMessage('A9'))
    assert(p.A8.level === 16, cableMessage('A8'))
    assert(p.A7.level === 17, cableMessage('A7'))
    assert(p.A6.level === 18, cableMessage('A6'))
    assert(p.A5.level === 19, cableMessage('A5'))
    assert(p.A4.level === 20, cableMessage('A4'))
    assert(p.A3.level === 21, cableMessage('A3'))
    assert(p.A2.level === 22, cableMessage('A2'))
    assert(p.A1.level === 23, cableMessage('A1'))
    assert(p.A0.level === 24, cableMessage('A0'))
  })

  it('reads from 6 pins', () => {
    c._IRQ.level = 1
    c._EXROM.level = 2
    c._GAME.level = 3
    c._DMA.level = 4
    c._RESET.level = 5
    c._NMI.level = 6

    assert(p._IRQ.level === 1, portMessage('_IRQ'))
    assert(p._EXROM.level === 2, portMessage('_EXROM'))
    assert(p._GAME.level === 3, portMessage('_GAME'))
    assert(p._DMA.level === 4, portMessage('_DMA'))
    assert(p._RESET.level === 5, portMessage('_RESET'))
    assert(p._NMI.level === 6, portMessage('_NMI'))
  })

  it('both reads and writes to 8 pins', () => {
    p.D7.level = 1
    assert(p.D7.level === 1, cableMessage('D7'))
    c.D7.level = 0
    assert(p.D7.level === 0, portMessage('D7'))

    p.D6.level = 1
    assert(p.D6.level === 1, cableMessage('D6'))
    c.D6.level = 0
    assert(p.D6.level === 0, portMessage('D6'))

    p.D5.level = 1
    assert(p.D5.level === 1, cableMessage('D5'))
    c.D5.level = 0
    assert(p.D5.level === 0, portMessage('D5'))

    p.D4.level = 1
    assert(p.D4.level === 1, cableMessage('D4'))
    c.D4.level = 0
    assert(p.D4.level === 0, portMessage('D4'))

    p.D3.level = 1
    assert(p.D3.level === 1, cableMessage('D3'))
    c.D3.level = 0
    assert(p.D3.level === 0, portMessage('D3'))

    p.D2.level = 1
    assert(p.D2.level === 1, cableMessage('D2'))
    c.D2.level = 0
    assert(p.D2.level === 0, portMessage('D2'))

    p.D1.level = 1
    assert(p.D1.level === 1, cableMessage('D1'))
    c.D1.level = 0
    assert(p.D1.level === 0, portMessage('D1'))

    p.D0.level = 1
    assert(p.D0.level === 1, cableMessage('D0'))
    c.D0.level = 0
    assert(p.D0.level === 0, portMessage('D0'))
  })
})
