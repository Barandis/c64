/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, BIDIRECTIONAL, INPUT, createPinArray } from "components/pin"

export const A = 13
export const B = 14
export const C = 15
export const D = 16
export const E = 17
export const F = 18
export const H = 19
export const J = 20
export const K = 21
export const L = 22
export const M = 23
export const N = 24

export function createUserPort() {
  const pins = createPinArray(
    createPin(M, "PA2", BIDIRECTIONAL),

    createPin(C, "PB0", BIDIRECTIONAL),
    createPin(D, "PB1", BIDIRECTIONAL),
    createPin(E, "PB2", BIDIRECTIONAL),
    createPin(F, "PB3", BIDIRECTIONAL),
    createPin(H, "PB4", BIDIRECTIONAL),
    createPin(J, "PB5", BIDIRECTIONAL),
    createPin(K, "PB6", BIDIRECTIONAL),
    createPin(L, "PB7", BIDIRECTIONAL),

    createPin(5, "SP1", BIDIRECTIONAL),
    createPin(7, "SP2", BIDIRECTIONAL),

    createPin(4, "CNT1", BIDIRECTIONAL),
    createPin(6, "CNT2", BIDIRECTIONAL),
    createPin(9, "ATN", BIDIRECTIONAL),
    createPin(8, "_PC2", BIDIRECTIONAL),
    createPin(B, "_FLAG2", BIDIRECTIONAL),
    createPin(3, "_RESET", BIDIRECTIONAL),

    createPin(2, "VCC", INPUT, null),
    createPin(10, "VAC1", INPUT, null),
    createPin(11, "VAC22", INPUT, null),
    createPin(1, "GND1", INPUT, null),
    createPin(12, "GND2", INPUT, null),
    createPin(A, "GND3", INPUT, null),
    createPin(N, "GND4", INPUT, null),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
