// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from "test/helper"
import { KeyboardPort } from "ports/keyboard-port"
import { Port } from "components/port"
import { Pin, UNCONNECTED, INPUT, OUTPUT } from "components/pin"
import { range } from "utils"

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

    for (const i of range(1, 20, true)) {
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

    assert(p.ROW0.level === 1)
    assert(p.ROW1.level === 2)
    assert(p.ROW2.level === 3)
    assert(p.ROW3.level === 4)
    assert(p.ROW4.level === 5)
    assert(p.ROW5.level === 6)
    assert(p.ROW6.level === 7)
    assert(p.ROW7.level === 8)
    assert(p._RESTORE.level === 9)
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

    assert(c.COL0.level === 1)
    assert(c.COL1.level === 2)
    assert(c.COL2.level === 3)
    assert(c.COL3.level === 4)
    assert(c.COL4.level === 5)
    assert(c.COL5.level === 6)
    assert(c.COL6.level === 7)
    assert(c.COL7.level === 8)
  })
})
