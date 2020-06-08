// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, deviceTraces } from "test/helper"
import { CassettePort } from "ports"
import { Port, Pin, UNCONNECTED, INPUT, OUTPUT } from "components"
import { range } from "utils"

describe("Cassette port", () => {
  let port, connector, p, c

  beforeEach(() => {
    port = CassettePort()

    connector = Port(
      Pin(1, "GND", UNCONNECTED),
      Pin(2, "VCC", UNCONNECTED),
      Pin(3, "MOTOR", OUTPUT),
      Pin(4, "READ", INPUT),
      Pin(5, "WRITE", OUTPUT),
      Pin(6, "SENSE", INPUT),
    )

    p = deviceTraces(port)
    c = deviceTraces(connector)

    for (const i of range(1, 6, true)) {
      p[i].clear()
      c[i].clear()
    }

    connector.connect(port)
  })

  it("writes data to MOTOR and WRITE", () => {
    p.MOTOR.set()
    assert(c.MOTOR.high)

    p.WRITE.set()
    assert(c.WRITE.high)
  })

  it("reads data from READ and SENSE", () => {
    c.READ.set()
    assert(p.READ.high)

    c.SENSE.set()
    assert(p.SENSE.high)
  })
})
