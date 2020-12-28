// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Port } from 'components'
import Pin from 'components/pin'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT

export function CassettePort() {
  return Port(
    new Pin(4, 'READ', OUTPUT),
    new Pin(5, 'WRITE', INPUT),
    new Pin(6, 'SENSE', OUTPUT),
    new Pin(3, 'MOTOR', INPUT),

    new Pin(2, 'VCC'),
    new Pin(1, 'GND'),
  )
}
