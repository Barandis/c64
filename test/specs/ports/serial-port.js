// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// These tests are more numerous (per pin) than others because this one
// is also testing the functionality of a port in general.

import { expect, deviceTraces } from "test/helper"
import { newSerialPort } from "ports/serial-port"
import { newPort } from "components/port"
import {
  newPin, UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL,
} from "components/pin"

describe("Serial port", () => {
  let port
  let connector
  let p
  let c

  beforeEach(() => {
    port = newSerialPort()

    connector = newPort(
      newPin(1, "_SRQ", INPUT),
      newPin(2, "GND", UNCONNECTED),
      newPin(3, "ATN", OUTPUT),
      newPin(4, "CLK", BIDIRECTIONAL),
      newPin(5, "DATA", BIDIRECTIONAL),
      newPin(6, "_RESET", BIDIRECTIONAL),
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
    expect(c.GND.level).to.equal(0)

    p.GND.level = 0
    c.GND.level = 1
    expect(p.GND.level).to.equal(0)
  })

  it("allows data to pass through ports in the correct direction", () => {
    connector.connect(port)

    c._SRQ.level = 1
    expect(p._SRQ.level).to.equal(1)
    p._SRQ.level = 0
    expect(c._SRQ.level).to.equal(1)

    p.ATN.level = 1
    expect(c.ATN.level).to.equal(1)
    c.ATN.level = 0
    expect(p.ATN.level).to.equal(1)
  })

  it("allows data to pass both ways through a bidirectional port", () => {
    connector.connect(port)

    c.CLK.level = 1
    expect(p.CLK.level).to.equal(1)
    p.CLK.level = 0
    expect(c.CLK.level).to.equal(0)

    c.DATA.level = 1
    expect(p.DATA.level).to.equal(1)
    p.DATA.level = 0
    expect(c.DATA.level).to.equal(0)

    c._RESET.level = 1
    expect(p._RESET.level).to.equal(1)
    p._RESET.level = 0
    expect(c._RESET.level).to.equal(0)
  })

  it("stops passing data when the port is disconnected", () => {
    connector.connect(port)
    connector.disconnect()

    p.GND.level = 1
    expect(c.GND.level).to.equal(0)

    c._SRQ.level = 1
    expect(p._SRQ.level).to.be.null

    p.ATN.level = 1
    expect(c.ATN.level).to.be.null

    c.CLK.level = 1
    expect(p.CLK.level).to.be.null

    c.DATA.level = 1
    expect(p.DATA.level).to.be.null

    c._RESET.level = 1
    expect(p._RESET.level).to.be.null
  })
})
