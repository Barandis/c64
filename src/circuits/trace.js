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
// The value of a trace affects and is affected by the pins connected to it. Specifically, output
// pins (created with OUTPUT or with INPUT_OUTPUT and in OUTPUT mode) change the value of the trace
// when their own value changes, while input pins (created with INPUT or with INPUT_OUTPUT and in
// INPUT mode) will have their value set to the trace's value when it changes. The value of a trace
// can also be set manually through the `value` property; this can be used to represent external
// connections to whatever circuit is being modeled.
//
// Trace values are typically a number (1 or 0 for digital circuits, or any number for analong
// circuits). If an output pin's value changes to `null` (hi-Z state), the trace will go through a
// series of possibilities before settling on `null` for itself. If there is another output pin that
// is not `null`, then it will set the value of the trace (even if its value hasn't changed). If all
// output pins are `null` at the same time, then the value of the trace will be determined by the
// `floating` value passed optionally as the last parameter to the creation function. This parameter
// can represent a pull-up (PULL_UP) or pull-down (PULL_DOWN) resistor in a circuit, setting the
// value of a trace to 1 or 0 respectively in the same way that real circuits connect a trace to the
// supply voltage or the ground to force the trace to a particular state when no output pin is
// driving it. Only if all connected output pins are `null`, and either no `floating` value was
// passed or it was passed as FLOAT, will a trace be set to `null`.
//
// Note that this trace object handles competing output pins by choosing whichever value was set on
// one of those pins most recently. This is not how it works in real life, but in real life such a
// situation is typcially met with short circuits or indeterminate states, so it's typically a
// sitation to be avoided entirely anyway.

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

  let traceValue

  // Sets the value of the trace based on the values of output pins connected to it. This function
  // is called at creation time and also at any time when an attempt is made to set the trace value
  // to `null` (hi-Z).
  //
  // If any connected output pin is high, then the trace's value will be set to that value. If no
  // connected output pins are high but at least one is low, the trace will be set to that avlue. If
  // there are no connected output pins at all, then the value will be set to 0. If all connected
  // output pins are `null`, then the trace's value will be set to `null`, but only if no floating
  // parameter was specified at creation (or if FLOAT was selected). Otherwise the trace's value
  // will be 1 if PULL_UP was selected or 0 if PULL_DOWN was selected.
  function recalculate() {
    if (pins.filter(pin => pin.output).length === 0) {
      return 0
    }
    const hi = pins.find(pin => pin.output && pin.high)
    if (hi) {
      return hi.value
    }
    const lo = pins.find(pin => pin.output && pin.low)
    if (lo) {
      return lo.value
    }
    return floating === PULL_UP ? 1 : floating === PULL_DOWN ? 0 : null
  }

  // Normalizes a value so that it's either `null` or a number. This translates `true` to `1` and
  // `false` to `0`.
  function translate(value) {
    if (value === null) {
      return null
    }
    return Number(value)
  }

  // Sets the trace's value to the supplied value. If that value is `null`, the process laid out in
  // `hiZValue` will be followed. Changing the trace value will also set the value of any input pins
  // connected to it, and it will invoke any listeners added to those pins.
  function set(value) {
    const tValue = translate(value)
    if (traceValue !== tValue) {
      if (tValue === null) {
        traceValue = recalculate()
      } else {
        traceValue = tValue
      }
      pins.forEach(pin => pin.setFromTrace())
    }
  }

  const trace = {
    get high() {
      return traceValue >= 0.5
    },
    get low() {
      return traceValue < 0.5
    },
    get hiZ() {
      return traceValue === null
    },

    get value() {
      return traceValue
    },
    set value(value) {
      set(value)
    },

    get state() {
      return traceValue === null ? null : traceValue >= 0.5
    },
    set state(value) {
      set(value === null ? null : !!value)
    },

    reset() {
      traceValue = recalculate()
    },
  }

  for (const pin of connectedPins) {
    if (!pins.includes(pin)) {
      pins.push(pin)
      pin.setTrace(trace)
    }
  }

  trace.value = recalculate()

  return trace
}
