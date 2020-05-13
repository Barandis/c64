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
  const traces = []
  const in_ = (direction & IN) > 0
  const out = (direction & OUT) > 0

  let state = init

  function set(value) {
    if ((value === HIGH || value === LOW || value === HIGH_Z) && state !== value) {
      state = value
      if (state !== HIGH_Z) {
        if (out) {
          traces.forEach(trace => trace.set(state))
        }
      }
    }
  }

  function setFromTrace(trace) {
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

  function toggle() {
    set(state === HIGH_Z ? HIGH_Z : state === LOW ? HIGH : LOW)
  }

  function addTrace(trace) {
    if (!traces.includes(trace)) {
      traces.push(trace)
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
    setFromTrace,
    toggle,
    addTrace,
    addListener,
    removeListener,
  }
}
