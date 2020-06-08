// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { OUTPUT } from "components/pin"

// When a trace's level is set directly, its actual value is chosen
// according to the following rules:
//
// 1. If the trace has an output pin connected to it that is high, the
//    trace takes on that pin's value.
// 2. If the trace has an output pin connected to it that is low, the
//    trace takes on that pin's value.
// 3. If the value being set is `null`: a. If the trace has been pulled
//    up, its value is 1. b. If the trace has been pulled down, its
//    value is 0. c. Its value is `null`.
// 4. The trace takes on the set value.
//
// If a trace is set by a pin (either by an output pin changing values
// or by an unconnected pin mode-changing into an output pin), then the
// value is simply set *unless* the value it's being set to is `null`.
// In that case the same rules as direct setting apply.

export function Trace(...pins) {
  const _pins = []
  let _float = null
  let _level = null

  function addPin(pin) {
    if (!pin.connected) {
      _pins.push(pin)
      pin.setTrace(trace)
    }
  }

  function addPins(...pins) {
    for (const p of pins) {
      addPin(p)
    }
    return trace
  }

  function normalize(level) {
    return level === null ? null : Number(level)
  }

  function calculateLevel(level) {
    const hi = _pins.find(p => p.mode === OUTPUT && p.high)
    if (hi) {
      return hi.level
    }

    const lo = _pins.find(p => p.mode === OUTPUT && p.low)
    if (lo) {
      return lo.level
    }

    if (level === null) {
      return _float
    }

    return level
  }

  // This is called by the trace's output pins changing values or by
  // unconnected pins becoming output or bidirectional pins.
  function updateLevel(level) {
    const normalized = normalize(level)
    if (normalized !== null) {
      _level = normalized
    } else {
      _level = calculateLevel(null)
    }
    _pins.forEach(p => p.updateLevel())
  }

  // This is called from outside the trace and its pins.
  function setLevel(level) {
    _level = calculateLevel(normalize(level))
    _pins.forEach(p => p.updateLevel())
  }

  function set() {
    setLevel(1)
    return trace
  }

  function clear() {
    setLevel(0)
    return trace
  }

  function float() {
    setLevel(null)
    return trace
  }

  function pullUp() {
    _float = 1
    setLevel(_level)
    return trace
  }

  function pullDown() {
    _float = 0
    setLevel(_level)
    return trace
  }

  function noPull() {
    _float = null
    setLevel(_level)
    return trace
  }

  const trace = {
    get high() {
      return _level >= 0.5
    },
    get low() {
      return _level < 0.5 && _level !== null
    },
    get floating() {
      return _level === null
    },
    get level() {
      return _level
    },
    set level(level) {
      setLevel(level)
    },

    set,
    clear,
    float,
    pullUp,
    pullDown,
    noPull,
    updateLevel,
    addPins,
  }

  trace.addPins(...pins)
  trace.updateLevel(null)
  return trace
}
