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
// pins (created with OUTPUT or BIDIRECTIONAL) change the state of the trace when their own state
// changes, while input pins (created with INPUT or BIDIRECTIONAL) will have their state set to the
// trace's state when it changes. The state of a trace can also be set manually through the `state`
// or `value` properties; this can be used to represent external connections to whatever circuit is
// being modeled.
//
// Trace states are typically either LOW or HIGH. If an output pin's state changes to TRI, the trace
// will go through a series of possibilities before settling on TRI for itself. If there is another
// output pin that is not TRI, then it will set the state of the trace (even if its state hasn't
// changed). If all output pins are TRI at the same time, then the state of the trace will be
// determined by the `floating` value passed optionally as the last parameter to the creation
// function. This parameter can represent a pull-up (PULLUP) or pull-down (PULLDOWN) resistor in a
// circuit, setting the value of a trace to HIGH or LOW respectively in the same way that real
// circuits connect a trace to the supply voltage or the ground to force the trace to a particular
// state when no output pin is driving it. Only if all connected output pins are TRI, and either no
// `floating` value was passed or it was passed as FLOAT, will a trace be set to TRI.
//
// Note that this trace object handles competing output pins by choosing whichever state was set on
// one of those pins most recently. This is not how it works in real life, but in real life such a
// situation is typcially met with short circuits or indeterminate states, so it's typically a
// sitation to be avoided entirely anyway.

import { LOW, HIGH, TRI } from "circuits/state"

export const FLOAT = Symbol("FLOAT")
export const PULLUP = Symbol("PULLUP")
export const PULLDOWN = Symbol("PULLDOWN")

// Creates a trace. The values passed to it are pins, optionally with a value of FLOAT (the
// default), PULLUP, or PULLDOWN at the end.
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

  // Sets the state of the trace based on the states of output pins connected to it. This function
  // is called at creation time and also at any time when an attempt is made to set the trace state
  // to TRI.
  //
  // If any connected output pin is HIGH, then the trace's value will be set to HIGH as well. If no
  // connected output pins are HIGH but at least one is LOW, or if there are no connected output
  // pins at all, then the state will be set to LOW. If all connected output pins are TRI, then the
  // trace's state will be set to TRI, but only if no floating parameter was specified at creation
  // (or if FLOAT was selected). Otherwise the trace's state will be HIGH if PULLUP was selected or
  // LOW if PULLDOWN was selected.
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

  // Sets the trace's state to the supplied value. If that value is TRI, the porocess laid out in
  // `triState` will be followed. Changing the trace state will also set the state of any input pins
  // connected to it, and it will invoke any listeners added to those pins.
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

  // Sets the trace's state exactly as `set`, except that it accepts a binary digit rather than a
  // state constant.
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
