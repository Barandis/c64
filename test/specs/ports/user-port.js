// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect, deviceTraces } from "test/helper"
import { UserPort } from "ports/user-port"
import { Port } from "components/port"
import {
  Pin, UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL,
} from "components/pin"

describe("User port", () => {
  let port
  let connector
  let p
  let c

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

    for (let i = 1; i <= 24; i++) {
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
    expect(c._PC2.level).to.equal(1)
  })

  it("reads from 2 pins", () => {
    c.ATN.level = 1
    c._FLAG2.level = 2
    expect(p.ATN.level).to.equal(1)
    expect(p._FLAG2.level).to.equal(2)
  })

  it("both reads and writes to 14 pins", () => {
    p._RESET.level = 1
    expect(c._RESET.level).to.equal(1)
    c._RESET.level = 0
    expect(p._RESET.level).to.equal(0)

    p.CNT1.level = 1
    expect(c.CNT1.level).to.equal(1)
    c.CNT1.level = 0
    expect(p.CNT1.level).to.equal(0)

    p.SP1.level = 1
    expect(c.SP1.level).to.equal(1)
    c.SP1.level = 0
    expect(p.SP1.level).to.equal(0)

    p.CNT2.level = 1
    expect(c.CNT2.level).to.equal(1)
    c.CNT2.level = 0
    expect(p.CNT2.level).to.equal(0)

    p.SP2.level = 1
    expect(c.SP2.level).to.equal(1)
    c.SP2.level = 0
    expect(p.SP2.level).to.equal(0)

    p.PB0.level = 1
    expect(c.PB0.level).to.equal(1)
    c.PB0.level = 0
    expect(p.PB0.level).to.equal(0)

    p.PB1.level = 1
    expect(c.PB1.level).to.equal(1)
    c.PB1.level = 0
    expect(p.PB1.level).to.equal(0)

    p.PB2.level = 1
    expect(c.PB2.level).to.equal(1)
    c.PB2.level = 0
    expect(p.PB2.level).to.equal(0)

    p.PB3.level = 1
    expect(c.PB3.level).to.equal(1)
    c.PB3.level = 0
    expect(p.PB3.level).to.equal(0)

    p.PB4.level = 1
    expect(c.PB4.level).to.equal(1)
    c.PB4.level = 0
    expect(p.PB4.level).to.equal(0)

    p.PB5.level = 1
    expect(c.PB5.level).to.equal(1)
    c.PB5.level = 0
    expect(p.PB5.level).to.equal(0)

    p.PB6.level = 1
    expect(c.PB6.level).to.equal(1)
    c.PB6.level = 0
    expect(p.PB6.level).to.equal(0)

    p.PB7.level = 1
    expect(c.PB7.level).to.equal(1)
    c.PB7.level = 0
    expect(p.PB7.level).to.equal(0)

    p.PA2.level = 1
    expect(c.PA2.level).to.equal(1)
    c.PA2.level = 0
    expect(p.PA2.level).to.equal(0)
  })
})
