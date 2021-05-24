// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import Port from 'components/port'

const { INPUT, OUTPUT } = Pin

export default class CassettePort extends Port {
  constructor() {
    super(
      new Pin(4, 'READ', OUTPUT),
      new Pin(5, 'WRITE', INPUT),
      new Pin(6, 'SENSE', OUTPUT),
      new Pin(3, 'MOTOR', INPUT),

      new Pin(2, 'VCC'),
      new Pin(1, 'GND'),
    )
  }
}
