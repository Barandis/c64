/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { LOW, HIGH } from "circuits/state"

export function createTrace(...connectedPins) {
  const pins = []

  let state = LOW

  const trace = {
    get state() {
      return state
    },
    get high() {
      return state === HIGH
    },
    get low() {
      return state === LOW
    },

    set(value) {
      if ((value === HIGH || value === LOW) && state !== value) {
        state = value
        pins.forEach(pin => {
          pin.setFromTrace(this)
        })
      }
    },
  }

  for (const pin of connectedPins) {
    if (!pins.includes(pin)) {
      pins.push(pin)
      pin.addTrace(trace)
    }
  }

  if (pins.some(pin => pin.out && pin.high)) {
    trace.set(HIGH)
  }

  return trace
}
