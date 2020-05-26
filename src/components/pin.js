/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// A representation of a single pin of an integrated circuit.
//
// A pin is essentially a value, along with some other metadata to describe it. The value can be
// either a numeric value or `null`, which represents a high-impedance state. This third state is
// commonly used in pins connected to a shared bus; only one device at a time should be writing to
// such a bus, and other devices often set the pins connected to that bus to high-impedence so that
// they are unaffected by and cannot affect changes made by the writing device.
//
// Any number is suitable for the value of a pin, allowing it to handle analog signals. Values of 1
// and 0 represent high and low pins for digital circuits. For the `high`, `low`, and `truth`
// properties, any value of 0.5 or greater translates to high and anything lower to low. Generally
// speaking, in this project "state" refers to a digital value (true or false, also represented as 1
// or 0) while "value" refers to that or any analog value.
//
// An input can be in one of three modes which define how it reacts to the outside world (i.e., to
// its trace). In INPUT mode, the pin's value can only be changed by changing the value of its trace
// (if it has no trace, it can be set normally). In OUTPUT mode, changing the value of the pin will
// also change the value of its trace. BIDIRECTIONAL mode is a combination of the two; changing the
// value of its trace will set the value of the pin, but setting the value of the pin will also
// change the value of its trace.
//
// Setting the value of a pin can be done in two ways. The `value` property deals with the pin's
// value as a number; reading it returns a number (or null) and writing to it can be done with a
// number (in fact, this is the only way to set a pin to an analog - i.e., non-1-or-0 - value). The
// `state` property returns the value as a boolean when read, and when written sets the value with a
// boolean. There are also `high`, `low`, and `hiZ` properties that are read-only and indicate
// whether the pin is in one of those states.

// The direction in which data flows through the pin. A BIDIRECTIONAL pin acts as both an input and
// output pin at the same time; an UNCONNECTED pin acts as neither.
export const UNCONNECTED = 0b00
export const INPUT = 0b01
export const OUTPUT = 0b10
export const BIDIRECTIONAL = 0b11

export function newPin(num, name, direction, init = 0) {
  const listeners = []
  let trace = null
  let mode = UNCONNECTED
  setMode(direction)
  let pinValue = translate(init)

  // Normalizes a value so that it's either `null` or a number. This translates `true` to `1` and
  // `false` to `0`.
  function translate(value) {
    if (value === null) {
      return null
    }
    return Number(value)
  }

  // Sets the value of the pin. If the pin is an output or bidirectional pin, then this value change
  // will be propagated to the trace to which it is connected. If it is an input pin, `value` will
  // only be used if the pin is unconnected; otherwise the pin's value will simply be set to the
  // trace's value.
  //
  // This function does nothing if the value hasn't actually changed; i.e., if `value` is the same
  // as the value the pin already had.
  //
  // This is intended to reflect changes made internally to the chip. For changing value from the
  // outside, through the value change of a trace connected to an input pin, see `setFromTrace`.
  function set(value) {
    const tValue = translate(value)
    if (pinValue !== tValue) {
      if (mode === INPUT && trace !== null) {
        pinValue = trace.value
      } else {
        pinValue = tValue
        if (mode & OUTPUT && trace !== null) {
          trace.value = tValue
        }
      }
    }
  }

  // Sets the value of the pin to match its trace's value, if the pin is an input or bidirectional
  // pin. This is also the only way to fire a listener on a value change. It is intended to reflect
  // changes to pin value that happen from the outside.
  //
  // This function is called by trace objects. It's unlikely to be useful as a call from a user.
  function setFromTrace() {
    if (trace !== null) {
      const value = trace.value

      if (mode & INPUT && pinValue !== value) {
        pinValue = value
        listeners.forEach(listener => listener(this))
      }
    }
  }

  function setMode(value) {
    if ([UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL].includes(value)) {
      mode = value

      if (mode & INPUT && trace !== null) {
        pinValue = trace.value
      }
    }
  }

  // Changes the pin's value to the "opposite" of its current value. If the pin is hi-z, it does not
  // change. If the pin is analog, its old value is subtracted from 1, so this only makes any real
  // sense if the range for the pin is 0...1 and in particular if it is being used for digital
  // values.
  function toggle() {
    set(pinValue === null ? null : 1 - pinValue)
  }

  // Associates a trace with the pin. Only one trace can be connected to a pin; connecting multiple
  // traces would be the same as connecting a single trace to all pins connected to the multiple
  // traces anyway.
  function setTrace(newTrace) {
    if (trace === null) {
      trace = newTrace
    }
  }

  // Updates the value of the pin's trace. If this is a bidirectional or output pin, it just sets
  // the trace to the same value as the pin. If it's an input pin, it forces the trace to check the
  // value of all of its output pins to choose an appropriate level.
  //
  // This is primarily useful for when pins switch modes and the new mode would leave the trace in
  // an inconsistent state.
  function update() {
    if (mode & OUTPUT) {
      trace.value = pinValue
    } else {
      trace.update()
    }
  }

  // Adds a listener. This is a function that accepts one parameter, which is set to the pin itself
  // when the listener is called. Listeners are called on value change if that change came through a
  // value change from a trace, and only if the pin is an input or bidirectional pin. An arbitary
  // number of listeners can be added; they will be called in the order in which they were added.
  //
  // This function will set a listener to an output pin, but that listener will never be called
  // unless the pin later changes its mode.
  //
  // The same listener cannot be added twice. Attempting to do so will meet with silent ignoring.
  function addListener(listener) {
    if (!listeners.includes(listener)) {
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
    get connected() {
      return trace !== null
    },
    get input() {
      return (mode & INPUT) > 0
    },
    get output() {
      return (mode & OUTPUT) > 0
    },

    get mode() {
      return mode
    },
    set mode(value) {
      setMode(value)
    },

    get high() {
      return pinValue >= 0.5
    },
    get low() {
      return pinValue < 0.5 && pinValue !== null
    },
    get hiZ() {
      return pinValue === null
    },

    get value() {
      return pinValue
    },
    set value(value) {
      set(value)
    },

    get state() {
      return pinValue === null ? null : pinValue >= 0.5
    },
    set state(value) {
      set(value === null ? null : !!value)
    },

    set() {
      set(1)
    },
    clear() {
      set(0)
    },
    reset() {
      set(null)
    },

    setFromTrace,
    toggle,
    setTrace,
    update,
    addListener,
    removeListener,
  }
}

export function newPinArray(...pins) {
  const array = []

  for (const pin of pins) {
    array[pin.num] = pin
    array[pin.name] = pin
  }

  return array
}
