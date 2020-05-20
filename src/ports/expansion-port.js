/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, BIDIRECTIONAL, INPUT, createPinArray } from "components/pin"

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
    createPin(Y, "A0", BIDIRECTIONAL),
    createPin(X, "A1", BIDIRECTIONAL),
    createPin(W, "A2", BIDIRECTIONAL),
    createPin(V, "A3", BIDIRECTIONAL),
    createPin(U, "A4", BIDIRECTIONAL),
    createPin(T, "A5", BIDIRECTIONAL),
    createPin(S, "A6", BIDIRECTIONAL),
    createPin(R, "A7", BIDIRECTIONAL),
    createPin(P, "A8", BIDIRECTIONAL),
    createPin(N, "A9", BIDIRECTIONAL),
    createPin(M, "A10", BIDIRECTIONAL),
    createPin(L, "A11", BIDIRECTIONAL),
    createPin(K, "A12", BIDIRECTIONAL),
    createPin(J, "A13", BIDIRECTIONAL),
    createPin(H, "A14", BIDIRECTIONAL),
    createPin(F, "A15", BIDIRECTIONAL),

    createPin(21, "D0", BIDIRECTIONAL),
    createPin(20, "D1", BIDIRECTIONAL),
    createPin(19, "D2", BIDIRECTIONAL),
    createPin(18, "D3", BIDIRECTIONAL),
    createPin(17, "D4", BIDIRECTIONAL),
    createPin(16, "D5", BIDIRECTIONAL),
    createPin(15, "D6", BIDIRECTIONAL),
    createPin(14, "D7", BIDIRECTIONAL),

    createPin(5, "R__W", BIDIRECTIONAL),
    createPin(8, "_GAME", BIDIRECTIONAL),
    createPin(9, "_EXROM", BIDIRECTIONAL),
    createPin(12, "BA", BIDIRECTIONAL),
    createPin(13, "_DMA", BIDIRECTIONAL),

    createPin(7, "_IO1", BIDIRECTIONAL),
    createPin(10, "_IO2", BIDIRECTIONAL),
    createPin(11, "_ROML", BIDIRECTIONAL),
    createPin(B, "_ROMH", BIDIRECTIONAL),

    createPin(4, "_IRQ", BIDIRECTIONAL),
    createPin(D, "_NMI", BIDIRECTIONAL),

    createPin(6, "DOT", BIDIRECTIONAL),
    createPin(E, "PHI2", BIDIRECTIONAL),

    createPin(C, "_RESET", BIDIRECTIONAL),

    createPin(2, "VCC1", INPUT, null),
    createPin(3, "VCC2", INPUT, null),

    createPin(1, "GND1", INPUT, null),
    createPin(22, "GND2", INPUT, null),
    createPin(A, "GND3", INPUT, null),
    createPin(Z, "GND4", INPUT, null),
  )

  const port = {
    pins,
  }

  for (const name in pins) {
    port[name] = pins[name]
  }

  return port
}
