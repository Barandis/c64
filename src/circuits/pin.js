/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { HIGH, LOW, HIGH_Z } from "circuits/state"

export const IN = 1
export const OUT = 2
export const IN_OUT = 3

export function createPin(num, name, direction = IN, init = LOW) {
  const listeners = []
  let trace = null
  const in_ = (direction & IN) > 0
  const out = (direction & OUT) > 0

  let state = init

  function set(value) {
    if ((value === HIGH || value === LOW || value === HIGH_Z) && state !== value) {
      if (!out && state === HIGH_Z && trace !== null) {
        state = trace.state
      } else {
        state = value
        if (state !== HIGH_Z) {
          if (out && trace !== null) {
            trace.set(state)
          }
        }
      }
    }
  }

  function setValue(value) {
    set(value === 1 ? HIGH : value === 0 ? LOW : HIGH_Z)
  }

  function setFromTrace() {
    if (trace !== null) {
      const value = trace.state

      if (state === HIGH_Z) {
        return
      }
      if (state !== value) {
        state = value
        if (in_) {
          listeners.forEach(listener => listener(this))
        }
      }
    }
  }

  function toggle() {
    set(state === HIGH_Z ? HIGH_Z : state === LOW ? HIGH : LOW)
  }

  function setTrace(newTrace) {
    if (trace === null) {
      trace = newTrace
    }
  }

  function addListener(listener) {
    if (in_ && !listeners.includes(listener)) {
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
    get in() {
      return in_
    },
    get out() {
      return out
    },
    get state() {
      return state
    },
    get value() {
      return state === HIGH ? 1 : state === LOW ? 0 : null
    },

    get high() {
      return state === HIGH
    },
    get low() {
      return state === LOW
    },
    get highZ() {
      return state === HIGH_Z
    },

    set,
    setValue,
    setFromTrace,
    toggle,
    setTrace,
    addListener,
    removeListener,
  }
}
