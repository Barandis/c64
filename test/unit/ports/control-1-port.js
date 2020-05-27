/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { newControl1Port } from "ports/control-1-port"
import { newPort } from "components/port"
import { newPin, UNCONNECTED, INPUT } from "components/pin"

describe("Control port 1", () => {
  let port
  let connector
  let p
  let c

  beforeEach(() => {
    port = newControl1Port()

    connector = newPort(
      newPin(1, "JOYA0", INPUT),
      newPin(2, "JOYA1", INPUT),
      newPin(3, "JOYA2", INPUT),
      newPin(4, "JOYA3", INPUT),
      newPin(5, "POTAY", INPUT),
      newPin(6, "BTNA_LP", INPUT),
      newPin(7, "VCC", UNCONNECTED),
      newPin(8, "GND", UNCONNECTED),
      newPin(9, "POTAX", INPUT),
    )

    p = deviceTraces(port)
    c = deviceTraces(connector)

    for (let i = 1; i <= 9; i++) {
      p[i].lower()
      c[i].lower()
    }

    connector.connect(port)
  })

  it("reads data from 7 pins", () => {
    c.JOYA0.level = 0.9
    c.JOYA1.level = 0.8
    c.JOYA2.level = 0.7
    c.JOYA3.level = 0.6
    c.POTAY.level = 0.5
    c.BTNA_LP.level = 1
    c.POTAX.level = 0.4

    expect(p.JOYA0.level).to.equal(0.9)
    expect(p.JOYA1.level).to.equal(0.8)
    expect(p.JOYA2.level).to.equal(0.7)
    expect(p.JOYA3.level).to.equal(0.6)
    expect(p.POTAY.level).to.equal(0.5)
    expect(p.BTNA_LP.level).to.equal(1)
    expect(p.POTAX.level).to.equal(0.4)
  })
})
