// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from "test/helper"
import { UserPort } from "ports"
import {
  Port, Pin, UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL,
} from "components"
import { range } from "utils"

describe("User port", () => {
  let port, connector, p, c

  beforeEach(() => {
    port = UserPort()

    connector = Port(
      Pin(1, "GND1", UNCONNECTED),
      Pin(2, "VCC", UNCONNECTED),
      Pin(3, "_RESET", BIDIRECTIONAL),
      Pin(4, "CNT1", BIDIRECTIONAL),
      Pin(5, "SP1", BIDIRECTIONAL),
      Pin(6, "CNT2", BIDIRECTIONAL),
      Pin(7, "SP2", BIDIRECTIONAL),
      Pin(8, "_PC2", OUTPUT),
      Pin(9, "ATN", INPUT),
      Pin(10, "VAC1", UNCONNECTED),
      Pin(11, "VAC2", UNCONNECTED),
      Pin(12, "GND2", UNCONNECTED),
      Pin(13, "GND3", UNCONNECTED),
      Pin(14, "_FLAG2", INPUT),
      Pin(15, "PB0", BIDIRECTIONAL),
      Pin(16, "PB1", BIDIRECTIONAL),
      Pin(17, "PB2", BIDIRECTIONAL),
      Pin(18, "PB3", BIDIRECTIONAL),
      Pin(19, "PB4", BIDIRECTIONAL),
      Pin(20, "PB5", BIDIRECTIONAL),
      Pin(21, "PB6", BIDIRECTIONAL),
      Pin(22, "PB7", BIDIRECTIONAL),
      Pin(23, "PA2", BIDIRECTIONAL),
      Pin(24, "GND4", UNCONNECTED),
    )

    p = deviceTraces(port)
    c = deviceTraces(connector)

    for (const i of range(1, 24, true)) {
      if (i === 2) {
        continue
      }
      p[i].clear()
      c[i].clear()
    }

    connector.connect(port)
  })

  it("writes to 1 pin", () => {
    p._PC2.level = 1
    assert(c._PC2.level === 1)
  })

  it("reads from 2 pins", () => {
    c.ATN.level = 1
    c._FLAG2.level = 2
    assert(p.ATN.level === 1)
    assert(p._FLAG2.level === 2)
  })

  it("both reads and writes to 14 pins", () => {
    p._RESET.level = 1
    assert(c._RESET.level === 1)
    c._RESET.level = 0
    assert(p._RESET.level === 0)

    p.CNT1.level = 1
    assert(c.CNT1.level === 1)
    c.CNT1.level = 0
    assert(p.CNT1.level === 0)

    p.SP1.level = 1
    assert(c.SP1.level === 1)
    c.SP1.level = 0
    assert(p.SP1.level === 0)

    p.CNT2.level = 1
    assert(c.CNT2.level === 1)
    c.CNT2.level = 0
    assert(p.CNT2.level === 0)

    p.SP2.level = 1
    assert(c.SP2.level === 1)
    c.SP2.level = 0
    assert(p.SP2.level === 0)

    p.PB0.level = 1
    assert(c.PB0.level === 1)
    c.PB0.level = 0
    assert(p.PB0.level === 0)

    p.PB1.level = 1
    assert(c.PB1.level === 1)
    c.PB1.level = 0
    assert(p.PB1.level === 0)

    p.PB2.level = 1
    assert(c.PB2.level === 1)
    c.PB2.level = 0
    assert(p.PB2.level === 0)

    p.PB3.level = 1
    assert(c.PB3.level === 1)
    c.PB3.level = 0
    assert(p.PB3.level === 0)

    p.PB4.level = 1
    assert(c.PB4.level === 1)
    c.PB4.level = 0
    assert(p.PB4.level === 0)

    p.PB5.level = 1
    assert(c.PB5.level === 1)
    c.PB5.level = 0
    assert(p.PB5.level === 0)

    p.PB6.level = 1
    assert(c.PB6.level === 1)
    c.PB6.level = 0
    assert(p.PB6.level === 0)

    p.PB7.level = 1
    assert(c.PB7.level === 1)
    c.PB7.level = 0
    assert(p.PB7.level === 0)

    p.PA2.level = 1
    assert(c.PA2.level === 1)
    c.PA2.level = 0
    assert(p.PA2.level === 0)
  })
})
