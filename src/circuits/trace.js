/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { LOW, HIGH, TRI } from "circuits/state"

export const FLOAT = Symbol("FLOAT")
export const PULLUP = Symbol("PULLUP")
export const PULLDOWN = Symbol("PULLDOWN")

export function createTrace(...args) {
  let connectedPins
  let floating

  const last = args.slice(-1)[0]
  if (last === FLOAT || last === PULLUP || last === PULLDOWN) {
    connectedPins = args.slice(0, -1)
    floating = last
  } else {
    connectedPins = args
    floating = FLOAT
  }

  const pins = []

  let state

  function triState() {
    if (pins.filter(pin => pin.output).length === 0) {
      return LOW
    }
    if (pins.some(pin => pin.output && pin.high)) {
      return HIGH
    }
    if (pins.some(pin => pin.output && pin.low)) {
      return LOW
    }
    return floating === PULLUP ? HIGH : floating === PULLDOWN ? LOW : TRI
  }

  function set(value) {
    if (state !== value) {
      if (value === HIGH || value === LOW) {
        state = value
        pins.forEach(pin => pin.setFromTrace())
      } else if (value === TRI) {
        state = triState()
        pins.forEach(pin => pin.setFromTrace())
      }
    }
  }

  function setValue(value) {
    set(value === 1 ? HIGH : value === 0 ? LOW : null)
  }

  const trace = {
    get high() {
      return state === HIGH
    },
    get low() {
      return state === LOW
    },
    get tri() {
      return state === TRI
    },

    get state() {
      return state
    },
    set state(value) {
      set(value)
    },

    get value() {
      return state === HIGH ? 1 : state === LOW ? 0 : null
    },
    set value(value) {
      setValue(value)
    },
  }

  for (const pin of connectedPins) {
    if (!pins.includes(pin)) {
      pins.push(pin)
      pin.setTrace(trace)
    }
  }

  trace.state = triState()

  return trace
}
