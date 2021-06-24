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
    p.R_W.level = 1
    p.PHIDOT.level = 2
    p.IO1.level = 3
    p.IO2.level = 4
    p.ROML.level = 5
    p.BA.level = 6
    p.ROMH.level = 7
    p.PHI2.level = 8
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

    assert.level(p.R_W, 1, cableMessage('R_W'))
    assert.level(p.PHIDOT, 2, cableMessage('PHIDOT'))
    assert.level(p.IO1, 3, cableMessage('IO1'))
    assert.level(p.IO2, 4, cableMessage('IO2'))
    assert.level(p.ROML, 5, cableMessage('ROML'))
    assert.level(p.BA, 6, cableMessage('BA'))
    assert.level(p.ROMH, 7, cableMessage('ROMH'))
    assert.level(p.PHI2, 8, cableMessage('PHI2'))
    assert.level(p.A15, 9, cableMessage('A15'))
    assert.level(p.A14, 10, cableMessage('A14'))
    assert.level(p.A13, 11, cableMessage('A13'))
    assert.level(p.A12, 12, cableMessage('A12'))
    assert.level(p.A11, 13, cableMessage('A11'))
    assert.level(p.A10, 14, cableMessage('A10'))
    assert.level(p.A9, 15, cableMessage('A9'))
    assert.level(p.A8, 16, cableMessage('A8'))
    assert.level(p.A7, 17, cableMessage('A7'))
    assert.level(p.A6, 18, cableMessage('A6'))
    assert.level(p.A5, 19, cableMessage('A5'))
    assert.level(p.A4, 20, cableMessage('A4'))
    assert.level(p.A3, 21, cableMessage('A3'))
    assert.level(p.A2, 22, cableMessage('A2'))
    assert.level(p.A1, 23, cableMessage('A1'))
    assert.level(p.A0, 24, cableMessage('A0'))
  })

  it('reads from 6 pins', () => {
    c.IRQ.level = 1
    c.EXROM.level = 2
    c.GAME.level = 3
    c.DMA.level = 4
    c.RESET.level = 5
    c.NMI.level = 6

    assert(p.IRQ, 1, portMessage('IRQ'))
    assert(p.EXROM, 2, portMessage('EXROM'))
    assert(p.GAME, 3, portMessage('GAME'))
    assert(p.DMA, 4, portMessage('DMA'))
    assert(p.RESET, 5, portMessage('RESET'))
    assert(p.NMI, 6, portMessage('NMI'))
  })

  it('both reads and writes to 8 pins', () => {
    p.D7.level = 1
    assert.level(p.D7, 1, cableMessage('D7'))
    c.D7.level = 0
    assert.level(p.D7, 0, portMessage('D7'))

    p.D6.level = 1
    assert.level(p.D6, 1, cableMessage('D6'))
    c.D6.level = 0
    assert.level(p.D6, 0, portMessage('D6'))

    p.D5.level = 1
    assert.level(p.D5, 1, cableMessage('D5'))
    c.D5.level = 0
    assert.level(p.D5, 0, portMessage('D5'))

    p.D4.level = 1
    assert.level(p.D4, 1, cableMessage('D4'))
    c.D4.level = 0
    assert.level(p.D4, 0, portMessage('D4'))

    p.D3.level = 1
    assert.level(p.D3, 1, cableMessage('D3'))
    c.D3.level = 0
    assert.level(p.D3, 0, portMessage('D3'))

    p.D2.level = 1
    assert.level(p.D2, 1, cableMessage('D2'))
    c.D2.level = 0
    assert.level(p.D2, 0, portMessage('D2'))

    p.D1.level = 1
    assert.level(p.D1, 1, cableMessage('D1'))
    c.D1.level = 0
    assert.level(p.D1, 0, portMessage('D1'))

    p.D0.level = 1
    assert.level(p.D0, 1, cableMessage('D0'))
    c.D0.level = 0
    assert.level(p.D0, 0, portMessage('D0'))
  })
})
