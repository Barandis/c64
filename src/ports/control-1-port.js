// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import Port from 'components/port'

const { OUTPUT } = Pin

export default function Control1Port() {
  return new Port(
    new Pin(1, 'JOYA0', OUTPUT),
    new Pin(2, 'JOYA1', OUTPUT),
    new Pin(3, 'JOYA2', OUTPUT),
    new Pin(4, 'JOYA3', OUTPUT),
    new Pin(9, 'POTAX', OUTPUT),
    new Pin(5, 'POTAY', OUTPUT),
    new Pin(6, 'BTNA_LP', OUTPUT),

    new Pin(7, 'VCC'),
    new Pin(8, 'GND'),
  )
}
