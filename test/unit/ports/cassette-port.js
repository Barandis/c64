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
      p[i].value = 0
      c[i].value = 0
    }

    connector.connect(port)
  })

  it("writes data to MOTOR and WRITE", () => {
    p.MOTOR.value = 1
    expect(c.MOTOR.value).to.equal(1)

    p.WRITE.value = 1
    expect(c.WRITE.value).to.equal(1)
  })

  it("reads data from READ and SENSE", () => {
    c.READ.value = 1
    expect(p.READ.value).to.equal(1)

    c.SENSE.value = 1
    expect(p.SENSE.value).to.equal(1)
  })
})