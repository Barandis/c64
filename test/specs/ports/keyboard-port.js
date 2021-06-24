// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, portCable, portMessage, cableMessage } from 'test/helper'
import { KeyboardPort } from 'ports'
import { range } from 'utils'

describe('Keyboard port', () => {
  let port
  let cable
  let p
  let c

  beforeEach(() => {
    port = KeyboardPort()
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

  it('reads data from 9 pins', () => {
    c.ROW0.level = 1
    c.ROW1.level = 2
    c.ROW2.level = 3
    c.ROW3.level = 4
    c.ROW4.level = 5
    c.ROW5.level = 6
    c.ROW6.level = 7
    c.ROW7.level = 8
    c._RESTORE.level = 9

    assert.level(p.ROW0, 1, portMessage('ROW0'))
    assert.level(p.ROW1, 2, portMessage('ROW1'))
    assert.level(p.ROW2, 3, portMessage('ROW2'))
    assert.level(p.ROW3, 4, portMessage('ROW3'))
    assert.level(p.ROW4, 5, portMessage('ROW4'))
    assert.level(p.ROW5, 6, portMessage('ROW5'))
    assert.level(p.ROW6, 7, portMessage('ROW6'))
    assert.level(p.ROW7, 8, portMessage('ROW7'))
    assert.level(p._RESTORE, 9, portMessage('_RESTORE'))
  })

  it('writes data to 8 pins', () => {
    p.COL0.level = 1
    p.COL1.level = 2
    p.COL2.level = 3
    p.COL3.level = 4
    p.COL4.level = 5
    p.COL5.level = 6
    p.COL6.level = 7
    p.COL7.level = 8

    assert.level(p.COL0, 1, cableMessage('COL0'))
    assert.level(p.COL1, 2, cableMessage('COL1'))
    assert.level(p.COL2, 3, cableMessage('COL2'))
    assert.level(p.COL3, 4, cableMessage('COL3'))
    assert.level(p.COL4, 5, cableMessage('COL4'))
    assert.level(p.COL5, 6, cableMessage('COL5'))
    assert.level(p.COL6, 7, cableMessage('COL6'))
    assert.level(p.COL7, 8, cableMessage('COL7'))
  })
})
