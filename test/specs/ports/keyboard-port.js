// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  assert, deviceTraces, portCable, portMessage, cableMessage,
} from "test/helper"
import { KeyboardPort } from "ports"
import { range } from "utils"

describe("Keyboard port", () => {
  let port, cable, p, c

  beforeEach(() => {
    port = KeyboardPort()
    cable = portCable(port)

    p = deviceTraces(port)
    c = deviceTraces(cable)

    for (const i of range(1, 20, true)) {
      if (i === 2) {
        continue
      }
      p[i].clear()
      c[i].clear()
    }

    cable.connect(port)
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

    assert(p.ROW0.level === 1, portMessage("ROW0"))
    assert(p.ROW1.level === 2, portMessage("ROW1"))
    assert(p.ROW2.level === 3, portMessage("ROW2"))
    assert(p.ROW3.level === 4, portMessage("ROW3"))
    assert(p.ROW4.level === 5, portMessage("ROW4"))
    assert(p.ROW5.level === 6, portMessage("ROW5"))
    assert(p.ROW6.level === 7, portMessage("ROW6"))
    assert(p.ROW7.level === 8, portMessage("ROW7"))
    assert(p._RESTORE.level === 9, portMessage("_RESTORE"))
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

    assert(p.COL0.level === 1, cableMessage("COL0"))
    assert(p.COL1.level === 2, cableMessage("COL1"))
    assert(p.COL2.level === 3, cableMessage("COL2"))
    assert(p.COL3.level === 4, cableMessage("COL3"))
    assert(p.COL4.level === 5, cableMessage("COL4"))
    assert(p.COL5.level === 6, cableMessage("COL5"))
    assert(p.COL6.level === 7, cableMessage("COL6"))
    assert(p.COL7.level === 8, cableMessage("COL7"))
  })
})
