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
    newPin(M, "PA2", BIDIRECTIONAL),

    newPin(C, "PB0", BIDIRECTIONAL),
    newPin(D, "PB1", BIDIRECTIONAL),
    newPin(E, "PB2", BIDIRECTIONAL),
    newPin(F, "PB3", BIDIRECTIONAL),
    newPin(H, "PB4", BIDIRECTIONAL),
    newPin(J, "PB5", BIDIRECTIONAL),
    newPin(K, "PB6", BIDIRECTIONAL),
    newPin(L, "PB7", BIDIRECTIONAL),

    newPin(5, "SP1", BIDIRECTIONAL),
    newPin(7, "SP2", BIDIRECTIONAL),

    newPin(4, "CNT1", BIDIRECTIONAL),
    newPin(6, "CNT2", BIDIRECTIONAL),
    newPin(9, "ATN", OUTPUT),
    newPin(8, "_PC2", INPUT),
    newPin(B, "_FLAG2", OUTPUT),
    newPin(3, "_RESET", BIDIRECTIONAL),

    newPin(2, "VCC", UNCONNECTED),
    newPin(10, "VAC1", UNCONNECTED),
    newPin(11, "VAC22", UNCONNECTED),
    newPin(1, "GND1", UNCONNECTED),
    newPin(12, "GND2", UNCONNECTED),
    newPin(A, "GND3", UNCONNECTED),
    newPin(N, "GND4", UNCONNECTED),
  )
}
