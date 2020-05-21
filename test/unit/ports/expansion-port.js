/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { newExpansionPort } from "ports/expansion-port"
import { newPort } from "components/port"
import { newPin, UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL } from "components/pin"

describe("Expansion port", () => {
  let port
  let connector
  let p
  let c

  beforeEach(() => {
    port = newExpansionPort()

    connector = newPort(
      newPin(1, "GND1", UNCONNECTED),
      newPin(2, "VCC1", UNCONNECTED),
      newPin(3, "VCC2", UNCONNECTED),
      newPin(4, "_IRQ", INPUT),
      newPin(5, "R__W", OUTPUT),
      newPin(6, "DOT", OUTPUT),
      newPin(7, "_IO1", OUTPUT),
      newPin(8, "_GAME", INPUT),
      newPin(9, "_EXROM", INPUT),
      newPin(10, "_IO2", OUTPUT),
      newPin(11, "_ROML", OUTPUT),
      newPin(12, "BA", OUTPUT),
      newPin(13, "_DMA", INPUT),
      newPin(14, "D7", BIDIRECTIONAL),
      newPin(15, "D6", BIDIRECTIONAL),
      newPin(16, "D5", BIDIRECTIONAL),
      newPin(17, "D4", BIDIRECTIONAL),
      newPin(18, "D3", BIDIRECTIONAL),
      newPin(19, "D2", BIDIRECTIONAL),
      newPin(20, "D1", BIDIRECTIONAL),
      newPin(21, "D0", BIDIRECTIONAL),
      newPin(22, "GND2", UNCONNECTED),
      newPin(23, "GND3", UNCONNECTED),
      newPin(24, "_ROMH", OUTPUT),
      newPin(25, "_RESET", INPUT),
      newPin(26, "_NMI", INPUT),
      newPin(27, "O2", OUTPUT),
      newPin(28, "A15", OUTPUT),
      newPin(29, "A14", OUTPUT),
      newPin(30, "A13", OUTPUT),
      newPin(31, "A12", OUTPUT),
      newPin(32, "A11", OUTPUT),
      newPin(33, "A10", OUTPUT),
      newPin(34, "A9", OUTPUT),
      newPin(35, "A8", OUTPUT),
      newPin(36, "A7", OUTPUT),
      newPin(37, "A6", OUTPUT),
      newPin(38, "A5", OUTPUT),
      newPin(39, "A4", OUTPUT),
      newPin(40, "A3", OUTPUT),
      newPin(41, "A2", OUTPUT),
      newPin(42, "A1", OUTPUT),
      newPin(43, "A0", OUTPUT),
      newPin(44, "GND4", UNCONNECTED),
    )

    p = deviceTraces(port)
    c = deviceTraces(connector)

    for (let i = 1; i <= 20; i++) {
      if (i === 2) {
        continue
      }
      p[i].value = 0
      c[i].value = 0
    }

    connector.connect(port)
  })

  it("writes to 24 pins", () => {
    p.R__W.value = 1
    p.DOT.value = 2
    p._IO1.value = 3
    p._IO2.value = 4
    p._ROML.value = 5
    p.BA.value = 6
    p._ROMH.value = 7
    p.O2.value = 8
    p.A15.value = 9
    p.A14.value = 10
    p.A13.value = 11
    p.A12.value = 12
    p.A11.value = 13
    p.A10.value = 14
    p.A9.value = 15
    p.A8.value = 16
    p.A7.value = 17
    p.A6.value = 18
    p.A5.value = 19
    p.A4.value = 20
    p.A3.value = 21
    p.A2.value = 22
    p.A1.value = 23
    p.A0.value = 24

    expect(c.R__W.value).to.equal(1)
    expect(c.DOT.value).to.equal(2)
    expect(c._IO1.value).to.equal(3)
    expect(c._IO2.value).to.equal(4)
    expect(c._ROML.value).to.equal(5)
    expect(c.BA.value).to.equal(6)
    expect(c._ROMH.value).to.equal(7)
    expect(c.O2.value).to.equal(8)
    expect(c.A15.value).to.equal(9)
    expect(c.A14.value).to.equal(10)
    expect(c.A13.value).to.equal(11)
    expect(c.A12.value).to.equal(12)
    expect(c.A11.value).to.equal(13)
    expect(c.A10.value).to.equal(14)
    expect(c.A9.value).to.equal(15)
    expect(c.A8.value).to.equal(16)
    expect(c.A7.value).to.equal(17)
    expect(c.A6.value).to.equal(18)
    expect(c.A5.value).to.equal(19)
    expect(c.A4.value).to.equal(20)
    expect(c.A3.value).to.equal(21)
    expect(c.A2.value).to.equal(22)
    expect(c.A1.value).to.equal(23)
    expect(c.A0.value).to.equal(24)
  })

  it("reads from 6 pins", () => {
    c._IRQ.value = 1
    c._EXROM.value = 2
    c._GAME.value = 3
    c._DMA.value = 4
    c._RESET.value = 5
    c._NMI.value = 6

    expect(p._IRQ.value).to.equal(1)
    expect(p._EXROM.value).to.equal(2)
    expect(p._GAME.value).to.equal(3)
    expect(p._DMA.value).to.equal(4)
    expect(p._RESET.value).to.equal(5)
    expect(p._NMI.value).to.equal(6)
  })

  it("both reads and writes to 8 pins", () => {
    p.D7.value = 1
    expect(c.D7.value).to.equal(1)
    c.D7.value = 0
    expect(p.D7.value).to.equal(0)

    p.D6.value = 1
    expect(c.D6.value).to.equal(1)
    c.D6.value = 0
    expect(p.D6.value).to.equal(0)

    p.D5.value = 1
    expect(c.D5.value).to.equal(1)
    c.D5.value = 0
    expect(p.D5.value).to.equal(0)

    p.D4.value = 1
    expect(c.D4.value).to.equal(1)
    c.D4.value = 0
    expect(p.D4.value).to.equal(0)

    p.D3.value = 1
    expect(c.D3.value).to.equal(1)
    c.D3.value = 0
    expect(p.D3.value).to.equal(0)

    p.D2.value = 1
    expect(c.D2.value).to.equal(1)
    c.D2.value = 0
    expect(p.D2.value).to.equal(0)

    p.D1.value = 1
    expect(c.D1.value).to.equal(1)
    c.D1.value = 0
    expect(p.D1.value).to.equal(0)

    p.D0.value = 1
    expect(c.D0.value).to.equal(1)
    c.D0.value = 0
    expect(p.D0.value).to.equal(0)
  })
})
