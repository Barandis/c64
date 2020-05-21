/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { newUserPort } from "ports/user-port"
import { newPort } from "components/port"
import { newPin, UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL } from "components/pin"

describe("User port", () => {
  let port
  let connector
  let p
  let c

  beforeEach(() => {
    port = newUserPort()

    connector = newPort(
      newPin(1, "GND1", UNCONNECTED),
      newPin(2, "VCC", UNCONNECTED),
      newPin(3, "_RESET", BIDIRECTIONAL),
      newPin(4, "CNT1", BIDIRECTIONAL),
      newPin(5, "SP1", BIDIRECTIONAL),
      newPin(6, "CNT2", BIDIRECTIONAL),
      newPin(7, "SP2", BIDIRECTIONAL),
      newPin(8, "_PC2", OUTPUT),
      newPin(9, "ATN", INPUT),
      newPin(10, "VAC1", UNCONNECTED),
      newPin(11, "VAC2", UNCONNECTED),
      newPin(12, "GND2", UNCONNECTED),
      newPin(13, "GND3", UNCONNECTED),
      newPin(14, "_FLAG2", INPUT),
      newPin(15, "PB0", BIDIRECTIONAL),
      newPin(16, "PB1", BIDIRECTIONAL),
      newPin(17, "PB2", BIDIRECTIONAL),
      newPin(18, "PB3", BIDIRECTIONAL),
      newPin(19, "PB4", BIDIRECTIONAL),
      newPin(20, "PB5", BIDIRECTIONAL),
      newPin(21, "PB6", BIDIRECTIONAL),
      newPin(22, "PB7", BIDIRECTIONAL),
      newPin(23, "PA2", BIDIRECTIONAL),
      newPin(24, "GND4", UNCONNECTED),
    )

    p = deviceTraces(port)
    c = deviceTraces(connector)

    for (let i = 1; i <= 24; i++) {
      if (i === 2) {
        continue
      }
      p[i].value = 0
      c[i].value = 0
    }

    connector.connect(port)
  })

  it("writes to 1 pin", () => {
    p._PC2.value = 1
    expect(c._PC2.value).to.equal(1)
  })

  it("reads from 2 pins", () => {
    c.ATN.value = 1
    c._FLAG2.value = 2
    expect(p.ATN.value).to.equal(1)
    expect(p._FLAG2.value).to.equal(2)
  })

  it("both reads and writes to 14 pins", () => {
    p._RESET.value = 1
    expect(c._RESET.value).to.equal(1)
    c._RESET.value = 0
    expect(p._RESET.value).to.equal(0)

    p.CNT1.value = 1
    expect(c.CNT1.value).to.equal(1)
    c.CNT1.value = 0
    expect(p.CNT1.value).to.equal(0)

    p.SP1.value = 1
    expect(c.SP1.value).to.equal(1)
    c.SP1.value = 0
    expect(p.SP1.value).to.equal(0)

    p.CNT2.value = 1
    expect(c.CNT2.value).to.equal(1)
    c.CNT2.value = 0
    expect(p.CNT2.value).to.equal(0)

    p.SP2.value = 1
    expect(c.SP2.value).to.equal(1)
    c.SP2.value = 0
    expect(p.SP2.value).to.equal(0)

    p.PB0.value = 1
    expect(c.PB0.value).to.equal(1)
    c.PB0.value = 0
    expect(p.PB0.value).to.equal(0)

    p.PB1.value = 1
    expect(c.PB1.value).to.equal(1)
    c.PB1.value = 0
    expect(p.PB1.value).to.equal(0)

    p.PB2.value = 1
    expect(c.PB2.value).to.equal(1)
    c.PB2.value = 0
    expect(p.PB2.value).to.equal(0)

    p.PB3.value = 1
    expect(c.PB3.value).to.equal(1)
    c.PB3.value = 0
    expect(p.PB3.value).to.equal(0)

    p.PB4.value = 1
    expect(c.PB4.value).to.equal(1)
    c.PB4.value = 0
    expect(p.PB4.value).to.equal(0)

    p.PB5.value = 1
    expect(c.PB5.value).to.equal(1)
    c.PB5.value = 0
    expect(p.PB5.value).to.equal(0)

    p.PB6.value = 1
    expect(c.PB6.value).to.equal(1)
    c.PB6.value = 0
    expect(p.PB6.value).to.equal(0)

    p.PB7.value = 1
    expect(c.PB7.value).to.equal(1)
    c.PB7.value = 0
    expect(p.PB7.value).to.equal(0)

    p.PA2.value = 1
    expect(c.PA2.value).to.equal(1)
    c.PA2.value = 0
    expect(p.PA2.value).to.equal(0)
  })
})
