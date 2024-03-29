// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import Pins from 'components/pins'
import Port from 'components/port'

const { OUTPUT } = Pin

export default function ControlPort2() {
  return Port(
    Pins(
      Pin(1, 'JOYB0', OUTPUT),
      Pin(2, 'JOYB1', OUTPUT),
      Pin(3, 'JOYB2', OUTPUT),
      Pin(4, 'JOYB3', OUTPUT),
      Pin(9, 'POTBX', OUTPUT),
      Pin(5, 'POTBY', OUTPUT),
      Pin(6, 'BTNB', OUTPUT),

      Pin(7, 'VCC'),
      Pin(8, 'GND'),
    ),
  )
}
