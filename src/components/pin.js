// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// A pin on an IC package or a port.
//
// This is the sole interface between these devices and the outside world. Pins have a
// direction, which indicates whether they're used by their chip/port for input, output,
// both, or neither; and a level, which is the signal present on them. In digital circuits,
// this is generally 0 or 1, though there's no reason a pin can't work with analog signals
// (and thus have any level at all).
//
// Pins may also be pulled up or down, which defines what level they have if a level isn't
// given to them. This emulates the internal pull-ups and pull-downs that some chips have
// (such as the port pins on a 6526 CIA). If no level is given to them and they have no
// pull-up or pull-down, then their level will be `null`, or no level at all, which is
// different from 0. This can be used to represent, e.g., a high-impedance state that cuts
// the pin off from its circuit.
//
// Pins and traces are intimately linked. A pin can be associated with exactly one trace,
// and unless the pin's level is `null` and it is an output pin, the pin and the trace will
// have the same level. (It follows then that all of the other pins connected to that trace
// will also have that level.) If their levels do not match, then one is changed to match
// the other. If the pin is an output pin, it will define the mutual level. If it's an input
// pin, the trace will define the level. If the pin is bidirectional, the level will be the
// level of the trace if it is connected to other non-bidirectional, non-null output pins;
// otherwise, whatever was set last will prevail.
//
// A pin may also have one or more listeners registered to it. The listener(s) will be
// invoked if the level of the pin changes *because of a change to its trace's level.* No
// listener will be invoked if the level of the pin is merely set programmatically. This
// means that only input and bidirectional pins will invoke listeners, though output pins
// may also register them, since it is possible that the output pin will become a different
// kind of pin later.

// The possible directions that a pin can have. These are chosen so that
// bit 0 of the constant determines whether it's an input and bit 1
// whether it's an output (hence bidrectional pins have both bits set).
const UNCONNECTED = 0b00
const INPUT = 0b01
const OUTPUT = 0b10
const BIDIRECTIONAL = 0b11

export default function Pin(number, name, mode = UNCONNECTED) {
  const listeners = []

  let trace = null
  let float = null
  let level = null
  let md = mode

  const normalize = lvl => (lvl === null ? float : Number(lvl))

  const setLevel = value => {
    if (trace) {
      if (md !== INPUT) {
        level = normalize(value)
        if (md !== UNCONNECTED) {
          trace.updateLevel(level)
        }
      }
    } else {
      level = normalize(value)
    }
  }

  const pin = {
    get name() {
      return name
    },

    get number() {
      return number
    },

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

    get mode() {
      return md
    },

    set mode(value) {
      if ([UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL].includes(value)) {
        const oldMode = md
        const oldLevel = level
        md = value

        if (trace) {
          if (md & OUTPUT) {
            trace.updateLevel(level)
          } else {
            if (md === INPUT) {
              level = normalize(trace.level)
            }
            if (oldMode & OUTPUT && oldLevel !== null) {
              trace.updateLevel(null)
            }
          }
        }
      }
    },

    get input() {
      return (md & INPUT) !== 0
    },

    get output() {
      return (md & OUTPUT) !== 0
    },

    set trace(value) {
      trace = value
      if (md === INPUT || (md === BIDIRECTIONAL && level === null)) {
        level = value.level
      } else if (md & OUTPUT) {
        value.updateLevel()
      }
    },

    get connected() {
      return trace !== null
    },

    updateLevel() {
      if (trace) {
        const newLevel = normalize(trace.level)
        if (md & INPUT && level !== newLevel) {
          level = newLevel
          listeners.forEach(listener => listener(pin))
        }
      }
    },

    set() {
      setLevel(1)
      return pin
    },

    clear() {
      setLevel(0)
      return pin
    },

    float() {
      setLevel(null)
      return pin
    },

    toggle() {
      setLevel(level === null ? null : 1 - level)
      return pin
    },

    addListener(listener) {
      if (!listeners.includes(listener)) {
        listeners.push(listener)
      }
      return pin
    },

    removeListener(listener) {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
      return pin
    },

    pullUp() {
      float = 1
      level = normalize(level)
      return pin
    },

    pullDown() {
      float = 0
      level = normalize(level)
      return pin
    },

    noPull() {
      float = null
      level = normalize(level)
      return pin
    },
  }

  return pin
}

Pin.UNCONNECTED = UNCONNECTED
Pin.INPUT = INPUT
Pin.OUTPUT = OUTPUT
Pin.BIDIRECTIONAL = BIDIRECTIONAL
