// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Port, Pin, BIDIRECTIONAL, INPUT, OUTPUT } from "components"

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

export function ExpansionPort() {
  return Port(
    Pin(Y, "A0", INPUT),
    Pin(X, "A1", INPUT),
    Pin(W, "A2", INPUT),
    Pin(V, "A3", INPUT),
    Pin(U, "A4", INPUT),
    Pin(T, "A5", INPUT),
    Pin(S, "A6", INPUT),
    Pin(R, "A7", INPUT),
    Pin(P, "A8", INPUT),
    Pin(N, "A9", INPUT),
    Pin(M, "A10", INPUT),
    Pin(L, "A11", INPUT),
    Pin(K, "A12", INPUT),
    Pin(J, "A13", INPUT),
    Pin(H, "A14", INPUT),
    Pin(F, "A15", INPUT),

    Pin(21, "D0", BIDIRECTIONAL),
    Pin(20, "D1", BIDIRECTIONAL),
    Pin(19, "D2", BIDIRECTIONAL),
    Pin(18, "D3", BIDIRECTIONAL),
    Pin(17, "D4", BIDIRECTIONAL),
    Pin(16, "D5", BIDIRECTIONAL),
    Pin(15, "D6", BIDIRECTIONAL),
    Pin(14, "D7", BIDIRECTIONAL),

    Pin(5, "R__W", INPUT),
    Pin(8, "_GAME", OUTPUT),
    Pin(9, "_EXROM", OUTPUT),
    Pin(12, "BA", INPUT),
    Pin(13, "_DMA", OUTPUT),

    Pin(7, "_IO1", INPUT),
    Pin(10, "_IO2", INPUT),
    Pin(11, "_ROML", INPUT),
    Pin(B, "_ROMH", INPUT),

    Pin(4, "_IRQ", OUTPUT),
    Pin(D, "_NMI", OUTPUT),

    Pin(6, "φDOT", INPUT),
    Pin(E, "φ2", INPUT),

    Pin(C, "_RESET", OUTPUT),

    Pin(2, "VCC1"),
    Pin(3, "VCC2"),

    Pin(1, "GND1"),
    Pin(22, "GND2"),
    Pin(A, "GND3"),
    Pin(Z, "GND4"),
  )
}
