// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import Port from 'components/port'

const { INPUT, OUTPUT } = Pin

export default function CassettePort() {
  return Port(
    Pin(4, 'READ', OUTPUT),
    Pin(5, 'WRITE', INPUT),
    Pin(6, 'SENSE', OUTPUT),
    Pin(3, 'MOTOR', INPUT),

    Pin(2, 'VCC'),
    Pin(1, 'GND'),
  )
}
