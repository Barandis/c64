/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, BIDIRECTIONAL, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { newPort } from "components/port"

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

export function newUserPort() {
  return newPort(
    newPin(M, "PA2", BIDIRECTIONAL, null),

    newPin(C, "PB0", BIDIRECTIONAL, null),
    newPin(D, "PB1", BIDIRECTIONAL, null),
    newPin(E, "PB2", BIDIRECTIONAL, null),
    newPin(F, "PB3", BIDIRECTIONAL, null),
    newPin(H, "PB4", BIDIRECTIONAL, null),
    newPin(J, "PB5", BIDIRECTIONAL, null),
    newPin(K, "PB6", BIDIRECTIONAL, null),
    newPin(L, "PB7", BIDIRECTIONAL, null),

    newPin(5, "SP1", BIDIRECTIONAL, null),
    newPin(7, "SP2", BIDIRECTIONAL, null),

    newPin(4, "CNT1", BIDIRECTIONAL, null),
    newPin(6, "CNT2", BIDIRECTIONAL, null),
    newPin(9, "ATN", OUTPUT, null),
    newPin(8, "_PC2", INPUT),
    newPin(B, "_FLAG2", OUTPUT, null),
    newPin(3, "_RESET", BIDIRECTIONAL, null),

    newPin(2, "VCC", UNCONNECTED),
    newPin(10, "VAC1", UNCONNECTED),
    newPin(11, "VAC22", UNCONNECTED),
    newPin(1, "GND1", UNCONNECTED),
    newPin(12, "GND2", UNCONNECTED),
    newPin(A, "GND3", UNCONNECTED),
    newPin(N, "GND4", UNCONNECTED),
  )
}
