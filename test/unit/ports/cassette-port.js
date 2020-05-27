/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, deviceTraces } from "test/helper"
import { newCassettePort } from "ports/cassette-port"
import { newPort } from "components/port"
import { newPin, UNCONNECTED, INPUT, OUTPUT } from "components/pin"

describe("Cassette port", () => {
  let port
  let connector
  let p
  let c

  beforeEach(() => {
    port = newCassettePort()

    connector = newPort(
      newPin(1, "GND", UNCONNECTED),
      newPin(2, "VCC", UNCONNECTED),
      newPin(3, "MOTOR", OUTPUT),
      newPin(4, "READ", INPUT),
      newPin(5, "WRITE", OUTPUT),
      newPin(6, "SENSE", INPUT),
    )

    p = deviceTraces(port)
    c = deviceTraces(connector)

    for (let i = 1; i <= 6; i++) {
      p[i].clear()
      c[i].clear()
    }

    connector.connect(port)
  })

  it("writes data to MOTOR and WRITE", () => {
    p.MOTOR.set()
    expect(c.MOTOR.level).to.equal(1)

    p.WRITE.set()
    expect(c.WRITE.level).to.equal(1)
  })

  it("reads data from READ and SENSE", () => {
    c.READ.set()
    expect(p.READ.level).to.equal(1)

    c.SENSE.set()
    expect(p.SENSE.level).to.equal(1)
  })
})
