// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// These tests are more numerous (per pin) than others because this one
// is also testing the functionality of a port in general.

import { assert, deviceTraces, portCable, portMessage, cableMessage } from 'test/helper'
import { SerialPort } from 'ports'
import { range } from 'utils'

function disconnectMessage(name) {
  return `${name} of disconnected cable should not change when port ${name} does`
}

describe('Serial port', () => {
  let port
  let cable
  let p
  let c

  beforeEach(() => {
    port = SerialPort()
    cable = portCable(port)

    p = deviceTraces(port)
    c = deviceTraces(cable)

    for (const i of range(1, 6, true)) {
      p[i].clear()
      c[i].clear()
    }
  })

  it('does not pass data through unconnected pins', () => {
    cable.connect(port)

    p.GND.level = 1
    assert.level(c.GND, 0, 'Cable GND should not change when port one does')

    p.GND.level = 0
    c.GND.level = 1
    assert.level(p.GND, 0, 'Port GND should not change when cable one does')
  })

  it('allows data to pass through ports in the correct direction', () => {
    cable.connect(port)

    c.SRQ.level = 1
    assert.level(p.SRQ, 1, portMessage('_SRQ'))
    p.SRQ.level = 0
    assert.level(c.SRQ, 1, 'Cable SRQ should not change when port SRQ does')

    p.ATN.level = 1
    assert.level(c.ATN, 1, cableMessage('ATN'))
    c.ATN.level = 0
    assert.level(p.ATN, 1, 'Port ATN should not change when port ATN does')
  })

  it('allows data to pass both ways through a bidirectional port', () => {
    cable.connect(port)

    c.CLK.level = 1
    assert.level(p.CLK, 1, portMessage('CLK'))
    p.CLK.level = 0
    assert.level(c.CLK, 0, cableMessage('CLK'))

    c.DATA.level = 1
    assert.level(p.DATA, 1, portMessage('DATA'))
    p.DATA.level = 0
    assert.level(c.DATA, 0, cableMessage('DATA'))

    c.RESET.level = 1
    assert.level(p.RESET, 1, portMessage('RESET'))
    p.RESET.level = 0
    assert.level(c.RESET, 0, cableMessage('RESET'))
  })

  it('stops passing data when the port is disconnected', () => {
    cable.connect(port)
    cable.disconnect()

    p.GND.level = 1
    assert.isLow(c.GND, disconnectMessage('GND'))

    c.SRQ.level = 1
    assert.isFloating(p.SRQ, disconnectMessage('SRQ'))

    p.ATN.level = 1
    assert.isFloating(c.ATN, disconnectMessage('ATN'))

    c.CLK.level = 1
    assert.isFloating(p.CLK, disconnectMessage('CLK'))

    c.DATA.level = 1
    assert.isFloating(p.DATA, disconnectMessage('DATA'))

    c.RESET.level = 1
    assert.isFloating(p.RESET, disconnectMessage('RESET'))
  })
})
