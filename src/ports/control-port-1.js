// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import Pins from 'components/pins'
import Port from 'components/port'

const { OUTPUT } = Pin

export default function ControlPort1() {
  return Port(
    Pins(
      Pin(1, 'JOYA0', OUTPUT),
      Pin(2, 'JOYA1', OUTPUT),
      Pin(3, 'JOYA2', OUTPUT),
      Pin(4, 'JOYA3', OUTPUT),
      Pin(9, 'POTAX', OUTPUT),
      Pin(5, 'POTAY', OUTPUT),
      Pin(6, 'BTNA_LP', OUTPUT),

      Pin(7, 'VCC'),
      Pin(8, 'GND'),
    ),
  )
}
