/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// A representation of a connection between one or more pins. The name 'trace' is used for the
// copper paths connecting components on a printed circuit board and so is used here. 'Wire' would
// have also been a decent choice, but since wires typically only connect two pins, 'trace' is more
// accurate.
//
// The state of a trace affects and is affected by the pins connected to it. Specifically, output
// pins (created with OUTPUT or with INPUT_OUTPUT and in OUTPUT mode) change the state of the trace
// when their own state changes, while input pins (created with INPUT or with INPUT_OUTPUT and in
// INPUT mode) will have their state set to the trace's state when it changes. The state of a trace
// can also be set manually through the `state` or `value` properties; this can be used to represent
// external connections to whatever circuit is being modeled.
//
// Trace states are typically either LOW or HIGH. If an output pin's state changes to HI_Z, the
// trace will go through a series of possibilities before settling on HI_Z for itself. If there is
// another output pin that is not HI_Z, then it will set the state of the trace (even if its state
// hasn't changed). If all output pins are HI_Z at the same time, then the state of the trace will
// be determined by the `floating` value passed optionally as the last parameter to the creation
// function. This parameter can represent a pull-up (PULL_UP) or pull-down (PULL_DOWN) resistor in a
// circuit, setting the value of a trace to HIGH or LOW respectively in the same way that real
// circuits connect a trace to the supply voltage or the ground to force the trace to a particular
// state when no output pin is driving it. Only if all connected output pins are HI_Z, and either no
// `floating` value was passed or it was passed as FLOAT, will a trace be set to HI_Z.
//
// Note that this trace object handles competing output pins by choosing whichever state was set on
// one of those pins most recently. This is not how it works in real life, but in real life such a
// situation is typcially met with short circuits or indeterminate states, so it's typically a
// sitation to be avoided entirely anyway.

import { LOW, HIGH, HI_Z } from "circuits/state"

export const FLOAT = Symbol("FLOAT")
export const PULL_UP = Symbol("PULL_UP")
export const PULL_DOWN = Symbol("PULL_DOWN")

// Creates a trace. The values passed to it are pins, optionally with a value of FLOAT (the
// default), PULLUP, or PULLDOWN at the end.
export function createTrace(...args) {
  let connectedPins
  let floating

  const last = args.slice(-1)[0]
  if (last === FLOAT || last === PULL_UP || last === PULL_DOWN) {
    connectedPins = args.slice(0, -1)
    floating = last
  } else {
    connectedPins = args
    floating = FLOAT
  }

  const pins = []

  let state

  // Sets the state of the trace based on the states of output pins connected to it. This function
  // is called at creation time and also at any time when an attempt is made to set the trace state
  // to HI_Z.
  //
  // If any connected output pin is HIGH, then the trace's value will be set to HIGH as well. If no
  // connected output pins are HIGH but at least one is LOW, or if there are no connected output
  // pins at all, then the state will be set to LOW. If all connected output pins are HI_Z, then the
  // trace's state will be set to HI_Z, but only if no floating parameter was specified at creation
  // (or if FLOAT was selected). Otherwise the trace's state will be HIGH if PULL_UP was selected or
  // LOW if PULL_DOWN was selected.
  function hiZState() {
    if (pins.filter(pin => pin.output).length === 0) {
      return LOW
    }
    if (pins.some(pin => pin.output && pin.high)) {
      return HIGH
    }
    if (pins.some(pin => pin.output && pin.low)) {
      return LOW
    }
    return floating === PULL_UP ? HIGH : floating === PULL_DOWN ? LOW : HI_Z
  }

  // Turns a constant (HIGH, LOW, HI_Z), number (1, 0, null), or boolean (true, false, null) state
  // value into a constant value.
  function translate(value) {
    if (value === HIGH || value === 1 || value === true) {
      return HIGH
    }
    if (value === LOW || value === 0 || value === false) {
      return LOW
    }
    if (value === HI_Z || value === null) {
      return HI_Z
    }
    return value
  }

  // Sets the trace's state to the supplied value. If that value is HI_Z, the process laid out in
  // `hiZState` will be followed. Changing the trace state will also set the state of any input pins
  // connected to it, and it will invoke any listeners added to those pins.
  function set(value) {
    const tValue = translate(value)
    if (state !== tValue) {
      if (tValue === HIGH || tValue === LOW) {
        state = tValue
        pins.forEach(pin => pin.setFromTrace())
      } else if (tValue === HI_Z) {
        state = hiZState()
        pins.forEach(pin => pin.setFromTrace())
      }
    }
  }

  const trace = {
    get high() {
      return state === HIGH
    },
    get low() {
      return state === LOW
    },
    get hiZ() {
      return state === HI_Z
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

    get truth() {
      return state === HIGH ? true : state === LOW ? false : null
    },
  }

  for (const pin of connectedPins) {
    if (!pins.includes(pin)) {
      pins.push(pin)
      pin.setTrace(trace)
    }
  }

  trace.state = hiZState()

  return trace
}
