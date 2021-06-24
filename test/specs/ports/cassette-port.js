// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces, portCable, cableMessage, portMessage } from 'test/helper'
import { CassettePort } from 'ports'
import { range } from 'utils'

describe('Cassette port', () => {
  let port
  let cable
  let p
  let c

  beforeEach(() => {
    port = CassettePort()
    cable = portCable(port)

    p = deviceTraces(port)
    c = deviceTraces(cable)

    for (const i of range(1, 6, true)) {
      p[i].clear()
      c[i].clear()
    }

    cable.connect(port)
  })

  it('writes data to MOTOR and WRITE', () => {
    p.MOTOR.set()
    assert.isHigh(c.MOTOR, cableMessage('MOTOR'))

    p.WRITE.set()
    assert.isHigh(c.WRITE, cableMessage('WRITE'))
  })

  it('reads data from READ and SENSE', () => {
    c.READ.set()
    assert.isHigh(p.READ, portMessage('READ'))

    c.SENSE.set()
    assert.isHigh(p.SENSE, portMessage('SENSE'))
  })
})
