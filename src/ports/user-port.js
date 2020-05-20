/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import {
  createPin,
  BIDIRECTIONAL,
  INPUT,
  createPinArray,
  OUTPUT,
  UNCONNECTED,
} from "components/pin"

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
    createPin(M, "PA2", BIDIRECTIONAL, null),

    createPin(C, "PB0", BIDIRECTIONAL, null),
    createPin(D, "PB1", BIDIRECTIONAL, null),
    createPin(E, "PB2", BIDIRECTIONAL, null),
    createPin(F, "PB3", BIDIRECTIONAL, null),
    createPin(H, "PB4", BIDIRECTIONAL, null),
    createPin(J, "PB5", BIDIRECTIONAL, null),
    createPin(K, "PB6", BIDIRECTIONAL, null),
    createPin(L, "PB7", BIDIRECTIONAL, null),

    createPin(5, "SP1", BIDIRECTIONAL, null),
    createPin(7, "SP2", BIDIRECTIONAL, null),

    createPin(4, "CNT1", BIDIRECTIONAL, null),
    createPin(6, "CNT2", BIDIRECTIONAL, null),
    createPin(9, "ATN", OUTPUT, null),
    createPin(8, "_PC2", INPUT),
    createPin(B, "_FLAG2", OUTPUT, null),
    createPin(3, "_RESET", BIDIRECTIONAL, null),

    createPin(2, "VCC", UNCONNECTED),
    createPin(10, "VAC1", UNCONNECTED),
    createPin(11, "VAC22", UNCONNECTED),
    createPin(1, "GND1", UNCONNECTED),
    createPin(12, "GND2", UNCONNECTED),
    createPin(A, "GND3", UNCONNECTED),
    createPin(N, "GND4", UNCONNECTED),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
