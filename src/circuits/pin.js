/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { HIGH, LOW, TRI } from "circuits/state"

export const INPUT = 1
export const OUTPUT = 2
export const BIDIRECTIONAL = 3

export function createPin(num, name, direction = INPUT, init = LOW) {
  const listeners = []
  let trace = null
  const input = (direction & INPUT) > 0
  const output = (direction & OUTPUT) > 0

  let state = init

  function set(value) {
    if ((value === HIGH || value === LOW || value === TRI) && state !== value) {
      if (!output && trace !== null) {
        state = trace.state
      } else {
        state = value
        if (output && trace !== null) {
          trace.state = state
        }
      }
    }
  }

  function setValue(value) {
    set(value === 1 ? HIGH : value === 0 ? LOW : TRI)
  }

  function setFromTrace() {
    if (trace !== null) {
      const value = trace.state

      if (input & (state !== value)) {
        state = value
        listeners.forEach(listener => listener(this))
      }
    }
  }

  function toggle() {
    set(state === TRI ? TRI : state === LOW ? HIGH : LOW)
  }

  function setTrace(newTrace) {
    if (trace === null) {
      trace = newTrace
    }
  }

  function addListener(listener) {
    if (input && !listeners.includes(listener)) {
      listeners.push(listener)
    }
  }

  function removeListener(listener) {
    const index = listeners.indexOf(listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }

  return {
    get num() {
      return num
    },
    get name() {
      return name
    },
    get input() {
      return input
    },
    get output() {
      return output
    },

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

    setFromTrace,
    toggle,
    setTrace,
    addListener,
    removeListener,
  }
}
