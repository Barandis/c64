// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from "test/helper"
import { Control1Port } from "ports"
import { Port, Pin, UNCONNECTED, INPUT } from "components"
import { range } from "utils"

describe("Control port 1", () => {
  let port, connector, p, c

  beforeEach(() => {
    port = Control1Port()

    connector = Port(
      Pin(1, "JOYA0", INPUT),
      Pin(2, "JOYA1", INPUT),
      Pin(3, "JOYA2", INPUT),
      Pin(4, "JOYA3", INPUT),
      Pin(5, "POTAY", INPUT),
      Pin(6, "BTNA_LP", INPUT),
      Pin(7, "VCC", UNCONNECTED),
      Pin(8, "GND", UNCONNECTED),
      Pin(9, "POTAX", INPUT),
    )

    p = deviceTraces(port)
    c = deviceTraces(connector)

    for (const i of range(1, 9, true)) {
      p[i].clear()
      c[i].clear()
    }

    connector.connect(port)
  })

  it("reads data from 7 pins", () => {
    c.JOYA0.level = 0.9
    c.JOYA1.level = 0.8
    c.JOYA2.level = 0.7
    c.JOYA3.level = 0.6
    c.POTAY.level = 0.5
    c.BTNA_LP.level = 1
    c.POTAX.level = 0.4

    assert(p.JOYA0.level === 0.9)
    assert(p.JOYA1.level === 0.8)
    assert(p.JOYA2.level === 0.7)
    assert(p.JOYA3.level === 0.6)
    assert(p.POTAY.level === 0.5)
    assert(p.BTNA_LP.level === 1)
    assert(p.POTAX.level === 0.4)
  })
})
