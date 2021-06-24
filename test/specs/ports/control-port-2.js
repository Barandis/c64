// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, portCable, portMessage } from 'test/helper'
import { ControlPort2 } from 'ports'
import { range } from 'utils'

describe('Control port 1', () => {
  let port
  let cable
  let p
  let c

  beforeEach(() => {
    port = ControlPort2()
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
    c.JOYB0.level = 0.9
    c.JOYB1.level = 0.8
    c.JOYB2.level = 0.7
    c.JOYB3.level = 0.6
    c.POTBY.level = 0.5
    c.BTNB.level = 1
    c.POTBX.level = 0.4

    assert.level(p.JOYB0, 0.9, portMessage('JOYB0'))
    assert.level(p.JOYB1, 0.8, portMessage('JOYB1'))
    assert.level(p.JOYB2, 0.7, portMessage('JOYB2'))
    assert.level(p.JOYB3, 0.6, portMessage('JOYB3'))
    assert.level(p.POTBY, 0.5, portMessage('POTBY'))
    assert.level(p.BTNB, 1, portMessage('BTNB'))
    assert.level(p.POTBX, 0.4, portMessage('POTBX'))
  })
})
