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
      p[i].lower()
      c[i].lower()
    }

    connector.connect(port)
  })

  it("writes to 24 pins", () => {
    p.R__W.level = 1
    p.DOT.level = 2
    p._IO1.level = 3
    p._IO2.level = 4
    p._ROML.level = 5
    p.BA.level = 6
    p._ROMH.level = 7
    p.O2.level = 8
    p.A15.level = 9
    p.A14.level = 10
    p.A13.level = 11
    p.A12.level = 12
    p.A11.level = 13
    p.A10.level = 14
    p.A9.level = 15
    p.A8.level = 16
    p.A7.level = 17
    p.A6.level = 18
    p.A5.level = 19
    p.A4.level = 20
    p.A3.level = 21
    p.A2.level = 22
    p.A1.level = 23
    p.A0.level = 24

    expect(c.R__W.level).to.equal(1)
    expect(c.DOT.level).to.equal(2)
    expect(c._IO1.level).to.equal(3)
    expect(c._IO2.level).to.equal(4)
    expect(c._ROML.level).to.equal(5)
    expect(c.BA.level).to.equal(6)
    expect(c._ROMH.level).to.equal(7)
    expect(c.O2.level).to.equal(8)
    expect(c.A15.level).to.equal(9)
    expect(c.A14.level).to.equal(10)
    expect(c.A13.level).to.equal(11)
    expect(c.A12.level).to.equal(12)
    expect(c.A11.level).to.equal(13)
    expect(c.A10.level).to.equal(14)
    expect(c.A9.level).to.equal(15)
    expect(c.A8.level).to.equal(16)
    expect(c.A7.level).to.equal(17)
    expect(c.A6.level).to.equal(18)
    expect(c.A5.level).to.equal(19)
    expect(c.A4.level).to.equal(20)
    expect(c.A3.level).to.equal(21)
    expect(c.A2.level).to.equal(22)
    expect(c.A1.level).to.equal(23)
    expect(c.A0.level).to.equal(24)
  })

  it("reads from 6 pins", () => {
    c._IRQ.level = 1
    c._EXROM.level = 2
    c._GAME.level = 3
    c._DMA.level = 4
    c._RESET.level = 5
    c._NMI.level = 6

    expect(p._IRQ.level).to.equal(1)
    expect(p._EXROM.level).to.equal(2)
    expect(p._GAME.level).to.equal(3)
    expect(p._DMA.level).to.equal(4)
    expect(p._RESET.level).to.equal(5)
    expect(p._NMI.level).to.equal(6)
  })

  it("both reads and writes to 8 pins", () => {
    p.D7.level = 1
    expect(c.D7.level).to.equal(1)
    c.D7.level = 0
    expect(p.D7.level).to.equal(0)

    p.D6.level = 1
    expect(c.D6.level).to.equal(1)
    c.D6.level = 0
    expect(p.D6.level).to.equal(0)

    p.D5.level = 1
    expect(c.D5.level).to.equal(1)
    c.D5.level = 0
    expect(p.D5.level).to.equal(0)

    p.D4.level = 1
    expect(c.D4.level).to.equal(1)
    c.D4.level = 0
    expect(p.D4.level).to.equal(0)

    p.D3.level = 1
    expect(c.D3.level).to.equal(1)
    c.D3.level = 0
    expect(p.D3.level).to.equal(0)

    p.D2.level = 1
    expect(c.D2.level).to.equal(1)
    c.D2.level = 0
    expect(p.D2.level).to.equal(0)

    p.D1.level = 1
    expect(c.D1.level).to.equal(1)
    c.D1.level = 0
    expect(p.D1.level).to.equal(0)

    p.D0.level = 1
    expect(c.D0.level).to.equal(1)
    c.D0.level = 0
    expect(p.D0.level).to.equal(0)
  })
})
