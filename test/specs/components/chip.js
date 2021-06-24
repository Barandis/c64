// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Chip from 'components/chip'
import Pin from 'components/pin'
import { assert } from 'test/helper'

const { INPUT, OUTPUT } = Pin

describe('Chip', () => {
  const pins = {
    A1: Pin(1, 'A1', INPUT),
    A2: Pin(3, 'A2', INPUT),
    A3: Pin(5, 'A3', INPUT),
    A4: Pin(9, 'A4', INPUT),
    A5: Pin(11, 'A5', INPUT),
    A6: Pin(13, 'A6', INPUT),
    Y1: Pin(2, 'Y1', OUTPUT).set(),
    Y2: Pin(4, 'Y2', OUTPUT).set(),
    Y3: Pin(6, 'Y3', OUTPUT).set(),
    Y4: Pin(8, 'Y4', OUTPUT).set(),
    Y5: Pin(10, 'Y5', OUTPUT).set(),
    Y6: Pin(12, 'Y6', OUTPUT).set(),
    Vcc: Pin(14, 'Vcc'),
    GND: Pin(7, 'GND'),
  }
  const chip = new Chip(...Object.values(pins))

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
