/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

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

    bytes[p++] = (e1 << 2) | (e2 >> 4)
    bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2)
    bytes[p++] = ((e3 & 3) << 6) | (e4 & 63)
  }

  return buffer
}
