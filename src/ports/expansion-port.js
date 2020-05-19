/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, BIDIRECTIONAL, INPUT } from "components/pin"

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
  const pins = {
    A0: createPin(Y, "A0", BIDIRECTIONAL),
    A1: createPin(X, "A1", BIDIRECTIONAL),
    A2: createPin(W, "A2", BIDIRECTIONAL),
    A3: createPin(V, "A3", BIDIRECTIONAL),
    A4: createPin(U, "A4", BIDIRECTIONAL),
    A5: createPin(T, "A5", BIDIRECTIONAL),
    A6: createPin(S, "A6", BIDIRECTIONAL),
    A7: createPin(R, "A7", BIDIRECTIONAL),
    A8: createPin(P, "A8", BIDIRECTIONAL),
    A9: createPin(N, "A9", BIDIRECTIONAL),
    A10: createPin(M, "A10", BIDIRECTIONAL),
    A11: createPin(L, "A11", BIDIRECTIONAL),
    A12: createPin(K, "A12", BIDIRECTIONAL),
    A13: createPin(J, "A13", BIDIRECTIONAL),
    A14: createPin(H, "A14", BIDIRECTIONAL),
    A15: createPin(F, "A15", BIDIRECTIONAL),

    D0: createPin(21, "D0", BIDIRECTIONAL),
    D1: createPin(20, "D1", BIDIRECTIONAL),
    D2: createPin(19, "D2", BIDIRECTIONAL),
    D3: createPin(18, "D3", BIDIRECTIONAL),
    D4: createPin(17, "D4", BIDIRECTIONAL),
    D5: createPin(16, "D5", BIDIRECTIONAL),
    D6: createPin(15, "D6", BIDIRECTIONAL),
    D7: createPin(14, "D7", BIDIRECTIONAL),

    R__W: createPin(5, "R__W", BIDIRECTIONAL),
    _GAME: createPin(8, "_GAME", BIDIRECTIONAL),
    _EXROM: createPin(9, "_EXROM", BIDIRECTIONAL),
    BA: createPin(12, "BA", BIDIRECTIONAL),
    _DMA: createPin(13, "_DMA", BIDIRECTIONAL),

    _IO1: createPin(7, "_IO1", BIDIRECTIONAL),
    _IO2: createPin(10, "_IO2", BIDIRECTIONAL),
    _ROML: createPin(11, "_ROML", BIDIRECTIONAL),
    _ROMH: createPin(B, "_ROMH", BIDIRECTIONAL),

    _IRQ: createPin(4, "_IRQ", BIDIRECTIONAL),
    _NMI: createPin(D, "_NMI", BIDIRECTIONAL),

    DOT: createPin(6, "DOT", BIDIRECTIONAL),
    PHI2: createPin(E, "PHI2", BIDIRECTIONAL),

    _RESET: createPin(C, "_RESET", BIDIRECTIONAL),

    VCC1: createPin(2, "VCC", INPUT, null),
    VCC2: createPin(3, "VCC", INPUT, null),

    GND1: createPin(1, "GND", INPUT, null),
    GND2: createPin(22, "GND", INPUT, null),
    GND3: createPin(A, "GND", INPUT, null),
    GND4: createPin(Z, "GND", INPUT, null),
  }

  const port = []
  port.pins = pins

  for (const name in pins) {
    const pin = pins[name]
    port[name] = pin
    port[pin.num] = pin
  }

  return port
}
