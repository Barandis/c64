/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { newKeyboardPort } from "ports/keyboard-port"
import { newPort } from "components/port"
import { newPin, UNCONNECTED, INPUT, OUTPUT } from "components/pin"

describe("Keyboard port", () => {
  let port
  let connector
  let p
  let c

  beforeEach(() => {
    port = newKeyboardPort()

    connector = newPort(
      newPin(1, "GND", UNCONNECTED),
      newPin(3, "_RESTORE", INPUT),
      newPin(4, "VCC", UNCONNECTED),
      newPin(5, "ROW3", INPUT),
      newPin(6, "ROW6", INPUT),
      newPin(7, "ROW5", INPUT),
      newPin(8, "ROW4", INPUT),
      newPin(9, "ROW7", INPUT),
      newPin(10, "ROW2", INPUT),
      newPin(11, "ROW1", INPUT),
      newPin(12, "ROW0", INPUT),
      newPin(13, "COL0", OUTPUT),
      newPin(14, "COL6", OUTPUT),
      newPin(15, "COL5", OUTPUT),
      newPin(16, "COL4", OUTPUT),
      newPin(17, "COL3", OUTPUT),
      newPin(18, "COL2", OUTPUT),
      newPin(19, "COL1", OUTPUT),
      newPin(20, "COL7", OUTPUT),
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

  it("reads data from 9 pins", () => {
    c.ROW0.value = 1
    c.ROW1.value = 2
    c.ROW2.value = 3
    c.ROW3.value = 4
    c.ROW4.value = 5
    c.ROW5.value = 6
    c.ROW6.value = 7
    c.ROW7.value = 8
    c._RESTORE.value = 9

    expect(p.ROW0.value).to.equal(1)
    expect(p.ROW1.value).to.equal(2)
    expect(p.ROW2.value).to.equal(3)
    expect(p.ROW3.value).to.equal(4)
    expect(p.ROW4.value).to.equal(5)
    expect(p.ROW5.value).to.equal(6)
    expect(p.ROW6.value).to.equal(7)
    expect(p.ROW7.value).to.equal(8)
    expect(p._RESTORE.value).to.equal(9)
  })

  it("writes data to 8 pins", () => {
    p.COL0.value = 1
    p.COL1.value = 2
    p.COL2.value = 3
    p.COL3.value = 4
    p.COL4.value = 5
    p.COL5.value = 6
    p.COL6.value = 7
    p.COL7.value = 8

    expect(c.COL0.value).to.equal(1)
    expect(c.COL1.value).to.equal(2)
    expect(c.COL2.value).to.equal(3)
    expect(c.COL3.value).to.equal(4)
    expect(c.COL4.value).to.equal(5)
    expect(c.COL5.value).to.equal(6)
    expect(c.COL6.value).to.equal(7)
    expect(c.COL7.value).to.equal(8)
  })
})
