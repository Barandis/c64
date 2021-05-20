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
  let port, cable, p, c

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
    assert(c.GND.level === 0, 'Cable GND should not change when port one does')

    p.GND.level = 0
    c.GND.level = 1
    assert(p.GND.level === 0, 'Port GND should not change when cable one does')
  })

  it('allows data to pass through ports in the correct direction', () => {
    cable.connect(port)

    c._SRQ.level = 1
    assert(p._SRQ.level === 1, portMessage('_SRQ'))
    p._SRQ.level = 0
    assert(c._SRQ.level === 1, 'Cable _SRQ should not change when port _SRQ does')

    p.ATN.level = 1
    assert(c.ATN.level === 1, cableMessage('ATN'))
    c.ATN.level = 0
    assert(p.ATN.level === 1, 'Port ATN should not change when port ATN does')
  })

  it('allows data to pass both ways through a bidirectional port', () => {
    cable.connect(port)

    c.CLK.level = 1
    assert(p.CLK.level === 1, portMessage('CLK'))
    p.CLK.level = 0
    assert(c.CLK.level === 0, cableMessage('CLK'))

    c.DATA.level = 1
    assert(p.DATA.level === 1, portMessage('DATA'))
    p.DATA.level = 0
    assert(c.DATA.level === 0, cableMessage('DATA'))

    c._RESET.level = 1
    assert(p._RESET.level === 1, portMessage('_RESET'))
    p._RESET.level = 0
    assert(c._RESET.level === 0, cableMessage('_RESET'))
  })

  it('stops passing data when the port is disconnected', () => {
    cable.connect(port)
    cable.disconnect()

    p.GND.level = 1
    assert(c.GND.low, disconnectMessage('GND'))

    c._SRQ.level = 1
    assert(p._SRQ.floating, disconnectMessage('_SRQ'))

    p.ATN.level = 1
    assert(c.ATN.floating, disconnectMessage('ATN'))

    c.CLK.level = 1
    assert(p.CLK.floating, disconnectMessage('CLK'))

    c.DATA.level = 1
    assert(p.DATA.floating, disconnectMessage('DATA'))

    c._RESET.level = 1
    assert(p._RESET.floating, disconnectMessage('_RESET'))
  })
})
