// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Chip } from 'components'
import Pin from 'components/pin'
import { assert } from 'test/helper'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT

describe('Chip', () => {
  const pins = {
    A1: new Pin(1, 'A1', INPUT),
    A2: new Pin(3, 'A2', INPUT),
    A3: new Pin(5, 'A3', INPUT),
    A4: new Pin(9, 'A4', INPUT),
    A5: new Pin(11, 'A5', INPUT),
    A6: new Pin(13, 'A6', INPUT),
    Y1: new Pin(2, 'Y1', OUTPUT).set(),
    Y2: new Pin(4, 'Y2', OUTPUT).set(),
    Y3: new Pin(6, 'Y3', OUTPUT).set(),
    Y4: new Pin(8, 'Y4', OUTPUT).set(),
    Y5: new Pin(10, 'Y5', OUTPUT).set(),
    Y6: new Pin(12, 'Y6', OUTPUT).set(),
    Vcc: new Pin(14, 'Vcc'),
    GND: new Pin(7, 'GND'),
  }
  const pinArray = []
  for (const pin of Object.values(pins)) {
    pinArray[pin.number] = pin
  }
  const chip = Chip(...pinArray)

  it('has properties named after each of its pins', () => {
    for (const [name, pin] of Object.entries(pins)) {
      assert(chip[name] === pin, `Pin ${name} is the wrong pin`)
    }
  })

  it('has indices for each pin based on its pin number', () => {
    for (const pin of Object.values(pins)) {
      assert(chip[pin.number] === pin, `Pin ${pin.number} is the wrong pin`)
    }
  })
})
