/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// These tests are more numerous (per pin) than others because this one is also testing the
// functionality of a port in general.

import { expect, deviceTraces } from "test/helper"
import { newSerialPort } from "ports/serial-port"
import { newPort } from "components/port"
import { newPin, UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL } from "components/pin"

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
      p[i].value = 0
      c[i].value = 0
    }
  })

  it("does not pass data through unconnected pins", () => {
    connector.connect(port)

    p.GND.value = 1
    expect(c.GND.value).to.equal(0)

    p.GND.value = 0
    c.GND.value = 1
    expect(p.GND.value).to.equal(0)
  })

  it("allows data to pass through unidirectional ports in the correct direction", () => {
    connector.connect(port)

    c._SRQ.value = 1
    expect(p._SRQ.value).to.equal(1)
    p._SRQ.value = 0
    expect(c._SRQ.value).to.equal(1)

    p.ATN.value = 1
    expect(c.ATN.value).to.equal(1)
    c.ATN.value = 0
    expect(p.ATN.value).to.equal(1)
  })

  it("allows data to pass both ways through a bidirectional port", () => {
    connector.connect(port)

    c.CLK.value = 1
    expect(p.CLK.value).to.equal(1)
    p.CLK.value = 0
    expect(c.CLK.value).to.equal(0)

    c.DATA.value = 1
    expect(p.DATA.value).to.equal(1)
    p.DATA.value = 0
    expect(c.DATA.value).to.equal(0)

    c._RESET.value = 1
    expect(p._RESET.value).to.equal(1)
    p._RESET.value = 0
    expect(c._RESET.value).to.equal(0)
  })

  it("stops passing data when the port is disconnected", () => {
    connector.connect(port)
    connector.disconnect()

    p.GND.value = 1
    expect(c.GND.value).to.equal(0)

    c._SRQ.value = 1
    expect(p._SRQ.value).to.be.null

    p.ATN.value = 1
    expect(c.ATN.value).to.be.null

    c.CLK.value = 1
    expect(p.CLK.value).to.be.null

    c.DATA.value = 1
    expect(p.DATA.value).to.be.null

    c._RESET.value = 1
    expect(p._RESET.value).to.be.null
  })
})
