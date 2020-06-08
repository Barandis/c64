// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect, deviceTraces } from "test/helper"
import { Control2Port } from "ports/control-2-port"
import { Port } from "components/port"
import { Pin, UNCONNECTED, INPUT } from "components/pin"

describe("Control port 1", () => {
  let port
  let connector
  let p
  let c

  beforeEach(() => {
    port = Control2Port()

    connector = Port(
      Pin(1, "JOYB0", INPUT),
      Pin(2, "JOYB1", INPUT),
      Pin(3, "JOYB2", INPUT),
      Pin(4, "JOYB3", INPUT),
      Pin(5, "POTBY", INPUT),
      Pin(6, "BTNB", INPUT),
      Pin(7, "VCC", UNCONNECTED),
      Pin(8, "GND", UNCONNECTED),
      Pin(9, "POTBX", INPUT),
    )

    p = deviceTraces(port)
    c = deviceTraces(connector)

    for (let i = 1; i <= 9; i++) {
      p[i].clear()
      c[i].clear()
    }

    connector.connect(port)
  })

  it("reads data from 7 pins", () => {
    c.JOYB0.level = 0.9
    c.JOYB1.level = 0.8
    c.JOYB2.level = 0.7
    c.JOYB3.level = 0.6
    c.POTBY.level = 0.5
    c.BTNB.level = 1
    c.POTBX.level = 0.4

    expect(p.JOYB0.level).to.equal(0.9)
    expect(p.JOYB1.level).to.equal(0.8)
    expect(p.JOYB2.level).to.equal(0.7)
    expect(p.JOYB3.level).to.equal(0.6)
    expect(p.POTBY.level).to.equal(0.5)
    expect(p.BTNB.level).to.equal(1)
    expect(p.POTBX.level).to.equal(0.4)
  })
})