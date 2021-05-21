// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import Port from 'components/port'

const { INPUT, OUTPUT, BIDIRECTIONAL } = Pin

export default function SerialPort() {
  return new Port(
    new Pin(5, 'DATA', BIDIRECTIONAL),
    new Pin(4, 'CLK', BIDIRECTIONAL),
    new Pin(3, 'ATN', INPUT),
    new Pin(1, '_SRQ', OUTPUT),
    new Pin(6, '_RESET', BIDIRECTIONAL),

    new Pin(2, 'GND'),
  )
}
