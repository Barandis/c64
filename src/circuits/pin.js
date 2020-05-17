/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// A representation of a single pin of an integrated circuit.
//
// A pin is essentially a state, along with some other metadata to describe it. The state can be one
// of three values: HIGH, representing binary 1; LOW, representing binary 0; and HI_Z, representing
// a high-impedence state that effectively just turns the pin off. This third state is commonly used
// in pins connected to a shared bus; only one device at a time should be writing to such a bus, and
// other devices often set the pins connected to that bus to high-impedence so that they are
// unaffected by and cannot affect changes made by the writing device.
//
// Input pin states can be set only by the trace to which they are connected. Output pin states
// *cannot* be set by the trace state; they can only be set directly, probably by the device that
// they're a part of.
//
// Input/output pins can act either way. Their direction is controlled by the `mode` property, which
// has a value of either INPUT or OUTPUT (the same constants as used for direction on creation,
// though there is no INPUT_OUTPUT mode) and will be set to INPUT on creation. It will act in every
// way like an input pin while in INPUT mode and like an output pin in OUTPUT mode with the sole
// difference that a listener can be added to it even in OUTPUT mode (though it will not fire while
// in this mode). Setting the `mode` parameter has no effect on a non-INPUT_OUTPUT pin.
//
// The state of the pin is available in three ways, all of which are useful in different scenarios.
// The `state` property returns the state as HIGH, LOW, or HI_Z. The `value` property returns the
// same state, but represented as a binary digit (either 1, 0, or null). Finally, the properties
// `high`, `low`, and `hiZ` are boolean properties that return true for the appropriate state. Among
// these, only the `state` property can be set, but it can take all three forms of values (constant,
// number, or boolean).

import { HIGH, LOW, HI_Z } from "circuits/state"

// The direction in which data flows through the pin. An INPUT_OUTPUT pin can be changed from input
// to output and back after creation; the others are fixed.
export const INPUT = Symbol("INPUT")
export const OUTPUT = Symbol("OUTPUT")
export const INPUT_OUTPUT = Symbol("INPUT_OUTPUT")

export function createPin(num, name, direction, init = LOW) {
  const listeners = []
  let trace = null
  let mode = direction === INPUT_OUTPUT ? INPUT : direction

  let state = init

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
    const tValue = translate(value)
    if ((tValue === HIGH || tValue === LOW || tValue === HI_Z) && state !== tValue) {
      if (mode === INPUT && trace !== null) {
        state = trace.state
      } else {
        state = tValue
        if (mode === OUTPUT && trace !== null) {
          trace.state = state
        }
      }
    }
  }

  // Sets the state of the pin to match its trace's state, if the pin is an input pin. This is also
  // the only way to fire a listener on a state change. It is intended to reflect changes to pin
  // state that happen from the outside.
  //
  // This function is called by trace objects. It's unlikely to be useful as a call from a user.
  function setFromTrace() {
    if (trace !== null) {
      const value = trace.state

      if (mode === INPUT && state !== value) {
        state = value
        listeners.forEach(listener => listener(this))
      }
    }
  }

  // Changes the pin's state to the opposite of its current state. If the pin is hi-z, it
  // does not change.
  function toggle() {
    set(state === HI_Z ? HI_Z : state === LOW ? HIGH : LOW)
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
    if (direction !== OUTPUT && !listeners.includes(listener)) {
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
      return mode === INPUT
    },
    get output() {
      return mode === OUTPUT
    },

    get mode() {
      return mode
    },
    set mode(value) {
      if (direction !== INPUT_OUTPUT) {
        return
      }
      if (value !== INPUT && value !== OUTPUT) {
        return
      }
      mode = value
    },

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

    setFromTrace,
    toggle,
    setTrace,
    addListener,
    removeListener,
  }
}
