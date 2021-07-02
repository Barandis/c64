// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

const lookup = new Uint8Array(256)
for (const i of range(chars.length)) {
  lookup[chars.charCodeAt(i)] = i
}

export function decode(base64) {
  const len = base64.length
  let p = 0
  let e1
  let e2
  let e3
  let e4

  let bufferLength = len * 0.75
  // There are three base-64 files that make up ROM code for the C64. All three end with at
  // least one `=`, so the else here will never execute.
  /* istanbul ignore else */
  if (base64[base64.length - 1] === '=') {
    bufferLength -= 1
    if (base64[base64.length - 2] === '=') {
      bufferLength -= 1
    }
  }

  const buffer = new ArrayBuffer(bufferLength)
  const bytes = new Uint8Array(buffer)

  for (const i of range(0, len, 4)) {
    e1 = lookup[base64.charCodeAt(i)]
    e2 = lookup[base64.charCodeAt(i + 1)]
    e3 = lookup[base64.charCodeAt(i + 2)]
    e4 = lookup[base64.charCodeAt(i + 3)]

    bytes[p] = (e1 << 2) | (e2 >> 4)
    bytes[p + 1] = ((e2 & 0x0f) << 4) | (e3 >> 2)
    bytes[p + 2] = ((e3 & 0x03) << 6) | (e4 & 0x3f)
    p += 3
  }

  return buffer
}

export function valueToPins(value, ...pins) {
  for (const [i, pin] of enumerate(pins)) {
    pin.level = value === null ? null : (value >> i) & 1
  }
}

export function pinsToValue(...pins) {
  let value = 0
  for (const [i, pin] of enumerate(pins)) {
    value |= pin.level << i
  }
  return value
}

export function modeToPins(mode, ...pins) {
  for (const pin of pins) {
    pin.mode = mode
  }
}

export function bitSet(value, bit) {
  return (value & (1 << bit)) > 0
}

export function bitClear(value, bit) {
  return (value & (1 << bit)) === 0
}

export function bitValue(value, bit) {
  return (value & (1 << bit)) >> bit
}

export function setBit(value, bit) {
  return value | (1 << bit)
}

export function clearBit(value, bit) {
  return value & ~(1 << bit)
}

export function toggleBit(value, bit) {
  return value ^ (1 << bit)
}

export function setBitValue(value, bit, newValue) {
  return (newValue & 1) === 1 ? setBit(value, bit) : clearBit(value, bit)
}

export function bin(value, digits = 8) {
  if (value === null) {
    return 'null'
  }
  return `0000000000000000${value.toString(2)}`.substr(-digits)
}

export function hex(value, digits = 2) {
  if (value === null) {
    return 'null'
  }
  return `0000000000000000${value.toString(16).toLowerCase()}`.substr(-digits)
}

export function word(lobyte, hibyte) {
  return lobyte + 256 * hibyte
}

export function hi4(byte) {
  return (byte & 0xf0) >> 4
}

export function lo4(byte) {
  return byte & 0x0f
}

export function dumpPins(chip, title = 'Pins') {
  let output = `${title}:`
  for (const pin of chip.pins) {
    if (pin) {
      const mode = ['U', 'I', 'O', 'B'][pin.mode]
      output += `\n  ${`${pin.name} (${mode}) ${'.'.repeat(12)}`.substring(0, 12)} ${pin.level}`
    }
  }
  output += '\n'
  return output
}

export function dumpRegisters(registers, title = 'Registers') {
  let output = `${title}:`
  for (const [index, name] of registers.names.entries()) {
    if (name) {
      output += `\n  ${`${name} ${'.'.repeat(12)}`.substring(0, 12)} ${hex(registers[index])}`
    }
  }
  output += '\n'
  return output
}

export function* range(start, end, step, inclusive) {
  const s = typeof end === 'number' ? start : 0
  const e = typeof end === 'number' ? end : start
  const p = typeof step === 'number' ? (step === 0 ? 1 : Math.abs(step)) : 1
  const i = typeof step === 'number' ? !!inclusive : typeof end === 'number' ? !!step : !!end

  const forward = s < e
  let current = s

  const finished = () => {
    if (forward) {
      return i ? current > e : current >= e
    }
    return i ? current < e : current <= e
  }

  // `current` is a local variable not readable from outside this function, so there's no
  // need to worry about it being updated during the yield
  /* eslint-disable require-atomic-updates */
  while (!finished()) {
    yield current
    current = forward ? current + p : current - p
  }
  /* eslint-enable require-atomic-updates */
}

export function* enumerate(iterable) {
  const iterator = iterable[Symbol.iterator]()
  let result = iterator.next()
  let index = 0

  while (!result.done) {
    yield [index, result.value]
    index += 1
    result = iterator.next()
  }
}
