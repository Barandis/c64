// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import Port from 'components/port'

const { INPUT, OUTPUT } = Pin

export default function KeyboardPort() {
  // There is no pin 2; it is used for alignment.
  return new Port(
    new Pin(12, 'ROW0', OUTPUT),
    new Pin(11, 'ROW1', OUTPUT),
    new Pin(10, 'ROW2', OUTPUT),
    new Pin(5, 'ROW3', OUTPUT),
    new Pin(8, 'ROW4', OUTPUT),
    new Pin(7, 'ROW5', OUTPUT),
    new Pin(6, 'ROW6', OUTPUT),
    new Pin(9, 'ROW7', OUTPUT),

    new Pin(13, 'COL0', INPUT),
    new Pin(19, 'COL1', INPUT),
    new Pin(18, 'COL2', INPUT),
    new Pin(17, 'COL3', INPUT),
    new Pin(16, 'COL4', INPUT),
    new Pin(15, 'COL5', INPUT),
    new Pin(14, 'COL6', INPUT),
    new Pin(20, 'COL7', INPUT),

    new Pin(3, '_RESTORE', OUTPUT),

    new Pin(4, 'VCC'),
    new Pin(1, 'GND'),
  )
}
