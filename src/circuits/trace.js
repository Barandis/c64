/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { LOW, HIGH } from "circuits/state"

export function createTrace(...connectedPins) {
  const pins = []

  let state

  function set(value) {
    if ((value === HIGH || value === LOW) && state !== value) {
      state = value
      pins.forEach(pin => {
        pin.setFromTrace()
      })
    }
  }

  function setValue(value) {
    set(value === 1 ? HIGH : value === 0 ? LOW : null)
  }

  const trace = {
    get state() {
      return state
    },
    get value() {
      return state === HIGH ? 1 : 0
    },
    get high() {
      return state === HIGH
    },
    get low() {
      return state === LOW
    },

    set,
    setValue,
  }

  for (const pin of connectedPins) {
    if (!pins.includes(pin)) {
      pins.push(pin)
      pin.setTrace(trace)
    }
  }

  if (pins.some(pin => pin.out && pin.high)) {
    trace.set(HIGH)
  } else {
    trace.set(LOW)
  }

  return trace
}
