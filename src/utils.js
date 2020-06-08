// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

const lookup = new Uint8Array(256)
for (let i = 0; i < chars.length; i++) {
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
  if (base64[base64.length - 1] === "=") {
    bufferLength--
    if (base64[base64.length - 2] === "=") {
      bufferLength--
    }
  }

  const buffer = new ArrayBuffer(bufferLength)
  const bytes = new Uint8Array(buffer)

  for (let i = 0; i < len; i += 4) {
    e1 = lookup[base64.charCodeAt(i)]
    e2 = lookup[base64.charCodeAt(i + 1)]
    e3 = lookup[base64.charCodeAt(i + 2)]
    e4 = lookup[base64.charCodeAt(i + 3)]

    bytes[p++] = e1 << 2 | e2 >> 4
    bytes[p++] = (e2 & 15) << 4 | e3 >> 2
    bytes[p++] = (e3 & 3) << 6 | e4 & 63
  }

  return buffer
}

export function valueToPins(value, ...pins) {
  for (let i = 0; i < pins.length; i++) {
    pins[i].level = value === null ? null : value >> i & 1
  }
}

export function pinsToValue(...pins) {
  let value = 0
  for (let i = 0; i < pins.length; i++) {
    value |= pins[i].level << i
  }
  return value
}

export function setMode(mode, ...pins) {
  for (const pin of pins) {
    pin.mode = mode
  }
}

export function bitSet(value, bit) {
  return (value & 1 << bit) > 0
}

export function bitClear(value, bit) {
  return (value & 1 << bit) === 0
}

export function setBit(value, bit) {
  return value | 1 << bit
}

export function clearBit(value, bit) {
  return value & ~(1 << bit)
}

export function toggleBit(value, bit) {
  return value ^ 1 << bit
}

export function *range(start, end, step, inclusive) {
  let s, e, t, i

  if (typeof start === "string") {
    [s, e, t = 1] = start.split(":")
    i = !!end
  } else {
    s = typeof step === "number" || typeof end === "number" ? start : 0
    e = typeof step === "number" || typeof end === "number" ? end : start
    t = typeof step === "number" ? step : 1
    i = typeof step === "number"
      ? !!inclusive : typeof end === "number"
        ? !!step : !!end
  }
  t = t === 0 ? 1 : Math.abs(t)

  const forward = s < e
  let current = s

  const finished = () => {
    if (forward) {
      return i ? current > e : current >= e
    }
    return i ? current < e : current <= e

  }

  // `current` is a local variable not readable from outside this
  // function, so there's no need to worry about it being updated
  // during the yield
  /* eslint-disable require-atomic-updates */
  while (!finished()) {
    yield current
    current = forward ? current + t : current - t
  }
  /* eslint-enable require-atomic-updates */
}
