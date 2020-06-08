// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// These tests are more numerous (per pin) than others because this one
// is also testing the functionality of a port in general.

import { assert, deviceTraces } from "test/helper"
import { SerialPort } from "ports/serial-port"
import { Port } from "components/port"
import {
  Pin, UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL,
} from "components/pin"

describe("Serial port", () => {
  let port
  let connector
  let p
  let c

  beforeEach(() => {
    port = SerialPort()

    connector = Port(
      Pin(1, "_SRQ", INPUT),
      Pin(2, "GND", UNCONNECTED),
      Pin(3, "ATN", OUTPUT),
      Pin(4, "CLK", BIDIRECTIONAL),
      Pin(5, "DATA", BIDIRECTIONAL),
      Pin(6, "_RESET", BIDIRECTIONAL),
    )

    p = deviceTraces(port)
    c = deviceTraces(connector)

    for (let i = 1; i <= 6; i++) {
      p[i].clear()
      c[i].clear()
    }
  })

  it("does not pass data through unconnected pins", () => {
    connector.connect(port)

    p.GND.level = 1
    assert(c.GND.level === 0)

    p.GND.level = 0
    c.GND.level = 1
    assert(p.GND.level === 0)
  })

  it("allows data to pass through ports in the correct direction", () => {
    connector.connect(port)

    c._SRQ.level = 1
    assert(p._SRQ.level === 1)
    p._SRQ.level = 0
    assert(c._SRQ.level === 1)

    p.ATN.level = 1
    assert(c.ATN.level === 1)
    c.ATN.level = 0
    assert(p.ATN.level === 1)
  })

  it("allows data to pass both ways through a bidirectional port", () => {
    connector.connect(port)

    c.CLK.level = 1
    assert(p.CLK.level === 1)
    p.CLK.level = 0
    assert(c.CLK.level === 0)

    c.DATA.level = 1
    assert(p.DATA.level === 1)
    p.DATA.level = 0
    assert(c.DATA.level === 0)

    c._RESET.level = 1
    assert(p._RESET.level === 1)
    p._RESET.level = 0
    assert(c._RESET.level === 0)
  })

  it("stops passing data when the port is disconnected", () => {
    connector.connect(port)
    connector.disconnect()

    p.GND.level = 1
    assert(c.GND.low)

    c._SRQ.level = 1
    assert(p._SRQ.floating)

    p.ATN.level = 1
    assert(c.ATN.floating)

    c.CLK.level = 1
    assert(p.CLK.floating)

    c.DATA.level = 1
    assert(p.DATA.floating)

    c._RESET.level = 1
    assert(p._RESET.floating)
  })
})
