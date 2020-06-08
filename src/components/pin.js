// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// A pin on an IC package or a port.
//
// This is the sole interface between these devices and the outside
// world. Pins have a direction, which indicates whether they're used by
// their chip/port for input, output, both, or neither; and a level,
// which is the signal present on them. In digital circuits, this is
// generally 0 or 1, though there's no reason a pin can't work with
// analog signals (and thus have any level at all).
//
// Pins may also be pulled up or down, which defines what level they
// have if a level isn't given to them. This emulates the internal
// pull-ups and pull-downs that some chips have (such as the port pins
// on a 6526 CIA). If no level is given to them and they have no pull-up
// or pull-down, then their level will be `null`, or no level at all,
// which is different from 0. This can be used to represent, e.g., a
// high-impedance state that cuts the pin off from its circuit.
//
// Pins and traces are intimately linked. A pin can be associated with
// exactly one trace, and unless the pin's level is `null` and it is an
// output pin, the pin and the trace will have the same level. (It
// follows then that all of the other pins connected to that trace will
// also have that level.) If their levels do not match, then one is
// changed to match the other. If the pin is an output pin, it will
// define the mutual level. If it's an input pin, the trace will define
// the level. If the pin is bidirectional, the level will be the level
// of the trace if it is connected to other non-bidirectional, non-null
// output pins; otherwise, whatever was set last will prevail.
//
// A pin may also have one or more listeners registered to it. The
// listener(s) will be invoked if the level of the pin changes *because
// of a change to its trace's level.* No listener will be invoked if the
// level of the pin is merely set programmatically. This means that only
// input and bidirectional pins will invoke listeners, though output
// pins may also register them, since it is possible that the output pin
// will become a different kind of pin later.

// The possible directions that a pin can have. These are chosen so that
// bit 0 of the constant determines whether it's an input and bit 1
// whether it's an output (hence bidrectional pins have both bits set).
export const UNCONNECTED = 0b00
export const INPUT = 0b01
export const OUTPUT = 0b10
export const BIDIRECTIONAL = 0b11

export function Pin(number, name, mode, level = null) {
  const _listeners = []
  let _trace = null
  let _float = null
  let _level = normalize(level)
  let _mode = UNCONNECTED
  setMode(mode)

  function setTrace(trace) {
    _trace = trace
    if (_mode === INPUT || _mode === BIDIRECTIONAL && _level === null) {
      _level = _trace.level
    } else if (_mode & OUTPUT) {
      _trace.updateLevel()
    }
  }

  function normalize(level) {
    return level === null ? _float : Number(level)
  }

  function setLevel(level) {
    if (_trace) {
      if (_mode !== INPUT) {
        _level = normalize(level)
        if (_mode !== UNCONNECTED) {
          _trace.updateLevel(_level)
        }
      }
    } else {
      _level = normalize(level)
    }
  }

  function updateLevel() {
    if (_trace) {
      const newLevel = normalize(_trace.level)
      if (_mode & INPUT && _level !== newLevel) {
        _level = newLevel
        _listeners.forEach(listener => listener(pin))
      }
    }
  }

  function setMode(mode) {
    if ([UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL].includes(mode)) {
      const oldMode = _mode
      const oldLevel = _level
      _mode = mode

      if (_trace) {
        if (_mode & OUTPUT) {
          _trace.updateLevel(_level)
        } else {
          if (_mode === INPUT) {
            _level = normalize(_trace.level)
          }
          if (oldMode & OUTPUT && oldLevel !== null) {
            _trace.updateLevel(null)
          }
        }
      }
    }
  }

  function addListener(listener) {
    if (!_listeners.includes(listener)) {
      _listeners.push(listener)
    }
  }

  function removeListener(listener) {
    const index = _listeners.indexOf(listener)
    if (index !== -1) {
      _listeners.splice(index, 1)
    }
  }

  function pullUp() {
    _float = 1
    _level = normalize(_level)
    return pin
  }

  function pullDown() {
    _float = 0
    _level = normalize(_level)
    return pin
  }

  function noPull() {
    _float = null
    _level = normalize(_level)
    return pin
  }

  const pin = {
    get number() {
      return number
    },
    get name() {
      return name
    },

    get input() {
      return (_mode & INPUT) > 0
    },
    get output() {
      return (_mode & OUTPUT) > 0
    },
    get mode() {
      return _mode
    },
    set mode(mode) {
      setMode(mode)
    },

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

    get connected() {
      return _trace !== null
    },

    set() {
      setLevel(1)
    },
    clear() {
      setLevel(0)
    },
    float() {
      setLevel(null)
    },
    toggle() {
      setLevel(_level === null ? null : 1 - _level)
    },

    pullUp,
    pullDown,
    noPull,
    setTrace,
    updateLevel,
    addListener,
    removeListener,
  }

  return pin
}

export function PinArray(...pins) {
  const array = []

  for (const p of pins) {
    array[p.number] = p
    array[p.name] = p
  }

  return array
}
