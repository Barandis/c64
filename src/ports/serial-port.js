// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import Port from 'components/port'

const { INPUT, OUTPUT, BIDIRECTIONAL } = Pin

export default function SerialPort() {
  return Port(
    Pin(5, 'DATA', BIDIRECTIONAL),
    Pin(4, 'CLK', BIDIRECTIONAL),
    Pin(3, 'ATN', INPUT),
    Pin(1, 'SRQ', OUTPUT),
    Pin(6, 'RESET', BIDIRECTIONAL),

    Pin(2, 'GND'),
  )
}
