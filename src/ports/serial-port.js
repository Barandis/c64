// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Port } from 'components'
import Pin from 'components/pin'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT
const BIDIRECTIONAL = Pin.BIDIRECTIONAL

export function SerialPort() {
  return Port(
    new Pin(5, 'DATA', BIDIRECTIONAL),
    new Pin(4, 'CLK', BIDIRECTIONAL),
    new Pin(3, 'ATN', INPUT),
    new Pin(1, '_SRQ', OUTPUT),
    new Pin(6, '_RESET', BIDIRECTIONAL),

    new Pin(2, 'GND'),
  )
}
