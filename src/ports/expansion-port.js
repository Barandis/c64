/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, BIDIRECTIONAL, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { newPort } from "components/port"

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

export function newExpansionPort() {
  return newPort(
    newPin(Y, "A0", INPUT),
    newPin(X, "A1", INPUT),
    newPin(W, "A2", INPUT),
    newPin(V, "A3", INPUT),
    newPin(U, "A4", INPUT),
    newPin(T, "A5", INPUT),
    newPin(S, "A6", INPUT),
    newPin(R, "A7", INPUT),
    newPin(P, "A8", INPUT),
    newPin(N, "A9", INPUT),
    newPin(M, "A10", INPUT),
    newPin(L, "A11", INPUT),
    newPin(K, "A12", INPUT),
    newPin(J, "A13", INPUT),
    newPin(H, "A14", INPUT),
    newPin(F, "A15", INPUT),

    newPin(21, "D0", BIDIRECTIONAL),
    newPin(20, "D1", BIDIRECTIONAL),
    newPin(19, "D2", BIDIRECTIONAL),
    newPin(18, "D3", BIDIRECTIONAL),
    newPin(17, "D4", BIDIRECTIONAL),
    newPin(16, "D5", BIDIRECTIONAL),
    newPin(15, "D6", BIDIRECTIONAL),
    newPin(14, "D7", BIDIRECTIONAL),

    newPin(5, "R__W", INPUT),
    newPin(8, "_GAME", OUTPUT),
    newPin(9, "_EXROM", OUTPUT),
    newPin(12, "BA", INPUT),
    newPin(13, "_DMA", OUTPUT),

    newPin(7, "_IO1", INPUT),
    newPin(10, "_IO2", INPUT),
    newPin(11, "_ROML", INPUT),
    newPin(B, "_ROMH", INPUT),

    newPin(4, "_IRQ", OUTPUT),
    newPin(D, "_NMI", OUTPUT),

    newPin(6, "DOT", INPUT),
    newPin(E, "O2", INPUT),

    newPin(C, "_RESET", OUTPUT),

    newPin(2, "VCC1", UNCONNECTED),
    newPin(3, "VCC2", UNCONNECTED),

    newPin(1, "GND1", UNCONNECTED),
    newPin(22, "GND2", UNCONNECTED),
    newPin(A, "GND3", UNCONNECTED),
    newPin(Z, "GND4", UNCONNECTED),
  )
}
