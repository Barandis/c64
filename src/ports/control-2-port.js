// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import Port from 'components/port'

const { OUTPUT } = Pin

export default class Control2Port extends Port {
  constructor() {
    super(
      new Pin(1, 'JOYB0', OUTPUT),
      new Pin(2, 'JOYB1', OUTPUT),
      new Pin(3, 'JOYB2', OUTPUT),
      new Pin(4, 'JOYB3', OUTPUT),
      new Pin(9, 'POTBX', OUTPUT),
      new Pin(5, 'POTBY', OUTPUT),
      new Pin(6, 'BTNB', OUTPUT),

      new Pin(7, 'VCC'),
      new Pin(8, 'GND'),
    )
  }
}
