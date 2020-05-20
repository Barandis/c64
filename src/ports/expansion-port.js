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

export const A = 23
export const B = 24
export const C = 25
export const D = 26
export const E = 27
export const F = 28
export const H = 29
export const J = 30
export const K = 31
export const L = 32
export const M = 33
export const N = 34
export const P = 35
export const R = 36
export const S = 37
export const T = 38
export const U = 39
export const V = 40
export const W = 41
export const X = 42
export const Y = 43
export const Z = 44

export function createExpansionPort() {
  const pins = createPinArray(
    createPin(Y, "A0", INPUT),
    createPin(X, "A1", INPUT),
    createPin(W, "A2", INPUT),
    createPin(V, "A3", INPUT),
    createPin(U, "A4", INPUT),
    createPin(T, "A5", INPUT),
    createPin(S, "A6", INPUT),
    createPin(R, "A7", INPUT),
    createPin(P, "A8", INPUT),
    createPin(N, "A9", INPUT),
    createPin(M, "A10", INPUT),
    createPin(L, "A11", INPUT),
    createPin(K, "A12", INPUT),
    createPin(J, "A13", INPUT),
    createPin(H, "A14", INPUT),
    createPin(F, "A15", INPUT),

    createPin(21, "D0", BIDIRECTIONAL, null),
    createPin(20, "D1", BIDIRECTIONAL, null),
    createPin(19, "D2", BIDIRECTIONAL, null),
    createPin(18, "D3", BIDIRECTIONAL, null),
    createPin(17, "D4", BIDIRECTIONAL, null),
    createPin(16, "D5", BIDIRECTIONAL, null),
    createPin(15, "D6", BIDIRECTIONAL, null),
    createPin(14, "D7", BIDIRECTIONAL, null),

    createPin(5, "R__W", INPUT),
    createPin(8, "_GAME", OUTPUT, null),
    createPin(9, "_EXROM", OUTPUT, null),
    createPin(12, "BA", INPUT),
    createPin(13, "_DMA", OUTPUT, null),

    createPin(7, "_IO1", INPUT),
    createPin(10, "_IO2", INPUT),
    createPin(11, "_ROML", INPUT),
    createPin(B, "_ROMH", INPUT),

    createPin(4, "_IRQ", OUTPUT, null),
    createPin(D, "_NMI", OUTPUT, null),

    createPin(6, "DOT", INPUT),
    createPin(E, "O2", INPUT),

    createPin(C, "_RESET", OUTPUT, null),

    createPin(2, "VCC1", UNCONNECTED),
    createPin(3, "VCC2", UNCONNECTED),

    createPin(1, "GND1", UNCONNECTED),
    createPin(22, "GND2", UNCONNECTED),
    createPin(A, "GND3", UNCONNECTED),
    createPin(Z, "GND4", UNCONNECTED),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
