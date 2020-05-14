/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// A representation of a single pin of an integrated circuit.
//
// A pin is essentially a state, along with some other metadata to describe it. The state can be one
// of three values: HIGH, representing binary 1; LOW, representing binary 0; and TRI, representing a
// high-impedence state that effectively just turns the pin off. This third state is commonly used
// in pins connected to a shared bus; only one device at a time should be writing to such a bus, and
// other devices often set the pins connected to that bus to high-impedence so that they are
// unaffected by and cannot affect changes made by the writing device.
//
// Input pin states can be set only by the trace to which they are connected. Output pin states
// *cannot* be set by the trace state; they can only be set directly, probably by the device that
// they're a part of. Bidirectional pins can be set in either manner. If an input pin changes state
// by its trace changing state, it can optionally invoke one or more listener functions
// automatically.
//
// The state of the pin is available in three ways, all of which are useful in different scenarios.
// The `state` property returns the state as HIGH, LOW, or TRI. The `value` property returns the
// same state, but represented as a binary digit (either 1, 0, or null). Finally, the properties
// `high`, `low`, and `tri` are boolean properties that return true for the appropriate state. These
// boolean properties are read-only, but `state` and `value` can both be used to *set* the pin's
// state as well. (This will not invoke listeners; only setting the state via `setFromTrace` will
// do that.)

import { HIGH, LOW, TRI } from "circuits/state"

// The direction in which data flows through the pin, choosable only at creation time. These values
// are chosen to facilitate bit manipulation; bit 0 is input, bit 1 is output.
export const INPUT = 1
export const OUTPUT = 2
export const BIDIRECTIONAL = 3

export function createPin(num, name, direction = INPUT, init = LOW) {
  const listeners = []
  let trace = null
  const input = (direction & INPUT) > 0
  const output = (direction & OUTPUT) > 0

  let state = init

  // Sets the state of the pin. If the pin is an output pin, then this state change will be
  // propagated to the trace to which it is connected. If it is NOT an output pin, `value` will only
  // be used if the pin is unconnected; otherwise the pin's state will simply be set to the trace's
  // state.
  //
  // This function does nothing if the state hasn't actually changed; i.e., if `value` is the same
  // as the state the pin is already in.
  //
  // This is intended to reflect changes made internally to the chip. For changing state from the
  // outside, through the state change of a trace connected to an input pin, see `setFromTrace`.
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

  // Sets the state of the pin, but by using a binary value instead of a state constant. A 1 or a 0
  // sets the state to HIGH or LOW respectively; any other value puts the pin into tri-state (`null`
  // is the canonical value for tri-state).
  function setValue(value) {
    set(value === 1 ? HIGH : value === 0 ? LOW : TRI)
  }

  // Sets the state of the pin to match its trace's state, if the pin is an input pin. This is also
  // the only way to fire a listener on a state change. It is intended to reflect changes to pin
  // state that happen from the outside.
  //
  // This function is called by trace objects. It's unlikely to be useful as a call from a user.
  function setFromTrace() {
    if (trace !== null) {
      const value = trace.state

      if (input & (state !== value)) {
        state = value
        listeners.forEach(listener => listener(this))
      }
    }
  }

  // Changes the pin's state to the opposite of its current state. If the pin is in tri-state, it
  // does not change.
  function toggle() {
    set(state === TRI ? TRI : state === LOW ? HIGH : LOW)
  }

  // Associates a trace with the pin. Only one trace can be connected to a pin; connecting multiple
  // traces would be the same as connecting a single trace to all pins connected to the multiple
  // traces anyway.
  function setTrace(newTrace) {
    if (trace === null) {
      trace = newTrace
    }
  }

  // Adds a listener. This is a function that accepts one parameter, which is set to the pin itself
  // when the listener is called. Listeners are called on state change if that change came through
  // a state change from a trace, and only if the pin is an input pin (output-only pins do not
  // call listeners ever). An arbitary number of listeners can be added; they will be called in the
  // order in which they were added.
  //
  // The same listener cannot be added twice. Attempting to do so will meet with silent ignoring.
  function addListener(listener) {
    if (input && !listeners.includes(listener)) {
      listeners.push(listener)
    }
  }

  // Removes a listener. Any listeners other than the one supplied to this function will remain.
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
