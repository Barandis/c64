// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'

const { OUTPUT } = Pin

// When a trace's level is set directly, its actual value is chosen according to the
// following rules:
//
// 1. If the trace has an output pin connected to it that is high, the trace takes on that
//    pin's value.
// 2. If the trace has an output pin connected to it that is low, the trace takes on that
//    pin's value.
// 3. If the value being set is `null`: a. If the trace has been pulled up, its value is 1.
//    b. If the trace has been pulled down, its value is 0. c. Its value is `null`.
// 4. The trace takes on the set value.
//
// If a trace is set by a pin (either by an output pin changing values or by an unconnected
// pin mode-changing into an output pin), then the value is simply set *unless* the value
// it's being set to is `null`. In that case the same rules as direct setting apply.

/** @param {number|null} level */
function normalize(level) {
  return level === null ? null : Number(level)
}

export default function Trace(...pins) {
  const pns = []

  let float = null
  let level = null

  function calculate(lvl) {
    const hi = pns.find(p => p.mode === OUTPUT && p.high)
    if (hi) return hi.level

    const lo = pns.find(p => p.mode === OUTPUT && p.low)
    if (lo) return lo.level

    if (lvl === null) return float

    return lvl
  }

  function setLevel(value) {
    level = calculate(normalize(value))
    pns.forEach(p => p.updateLevel())
  }

  const trace = {
    get level() {
      return level
    },

    set level(value) {
      setLevel(value)
    },

    get high() {
      return level >= 0.5
    },

    get low() {
      return level < 0.5 && level !== null
    },

    get floating() {
      return level === null
    },

    updateLevel(lvl) {
      level = normalize(lvl) ?? calculate(null)
      pns.forEach(p => p.updateLevel())
    },

    // eslint-disable-next-line no-shadow
    addPins(...pins) {
      for (const p of pins) {
        if (!p.connected) {
          pns.push(p)
          p.trace = this
        }
      }
      return trace
    },

    set() {
      setLevel(1)
      return trace
    },

    clear() {
      setLevel(0)
      return trace
    },

    float() {
      setLevel(null)
      return trace
    },

    pullUp() {
      float = 1
      setLevel(level)
      return trace
    },

    pullDown() {
      float = 0
      setLevel(level)
      return trace
    },

    noPull() {
      float = null
      setLevel(level)
      return trace
    },
  }

  trace.addPins(...pins)
  trace.updateLevel(null)

  return trace
}
