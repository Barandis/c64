// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect, deviceTraces } from "test/helper"
import { KeyboardPort } from "ports/keyboard-port"
import { Port } from "components/port"
import { Pin, UNCONNECTED, INPUT, OUTPUT } from "components/pin"

describe("Keyboard port", () => {
  let port
  let connector
  let p
  let c

  beforeEach(() => {
    port = KeyboardPort()

    connector = Port(
      Pin(1, "GND", UNCONNECTED),
      Pin(3, "_RESTORE", INPUT),
      Pin(4, "VCC", UNCONNECTED),
      Pin(5, "ROW3", INPUT),
      Pin(6, "ROW6", INPUT),
      Pin(7, "ROW5", INPUT),
      Pin(8, "ROW4", INPUT),
      Pin(9, "ROW7", INPUT),
      Pin(10, "ROW2", INPUT),
      Pin(11, "ROW1", INPUT),
      Pin(12, "ROW0", INPUT),
      Pin(13, "COL0", OUTPUT),
      Pin(14, "COL6", OUTPUT),
      Pin(15, "COL5", OUTPUT),
      Pin(16, "COL4", OUTPUT),
      Pin(17, "COL3", OUTPUT),
      Pin(18, "COL2", OUTPUT),
      Pin(19, "COL1", OUTPUT),
      Pin(20, "COL7", OUTPUT),
    )

    p = deviceTraces(port)
    c = deviceTraces(connector)

    for (let i = 1; i <= 20; i++) {
      if (i === 2) {
        continue
      }
      p[i].clear()
      c[i].clear()
    }

    connector.connect(port)
  })

  it("reads data from 9 pins", () => {
    c.ROW0.level = 1
    c.ROW1.level = 2
    c.ROW2.level = 3
    c.ROW3.level = 4
    c.ROW4.level = 5
    c.ROW5.level = 6
    c.ROW6.level = 7
    c.ROW7.level = 8
    c._RESTORE.level = 9

    expect(p.ROW0.level).to.equal(1)
    expect(p.ROW1.level).to.equal(2)
    expect(p.ROW2.level).to.equal(3)
    expect(p.ROW3.level).to.equal(4)
    expect(p.ROW4.level).to.equal(5)
    expect(p.ROW5.level).to.equal(6)
    expect(p.ROW6.level).to.equal(7)
    expect(p.ROW7.level).to.equal(8)
    expect(p._RESTORE.level).to.equal(9)
  })

  it("writes data to 8 pins", () => {
    p.COL0.level = 1
    p.COL1.level = 2
    p.COL2.level = 3
    p.COL3.level = 4
    p.COL4.level = 5
    p.COL5.level = 6
    p.COL6.level = 7
    p.COL7.level = 8

    expect(c.COL0.level).to.equal(1)
    expect(c.COL1.level).to.equal(2)
    expect(c.COL2.level).to.equal(3)
    expect(c.COL3.level).to.equal(4)
    expect(c.COL4.level).to.equal(5)
    expect(c.COL5.level).to.equal(6)
    expect(c.COL6.level).to.equal(7)
    expect(c.COL7.level).to.equal(8)
  })
})
