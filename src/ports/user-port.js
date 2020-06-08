// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  Pin, BIDIRECTIONAL, INPUT, OUTPUT, UNCONNECTED,
} from "components/pin"
import { Port } from "components/port"

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

export function UserPort() {
  return Port(
    Pin(M, "PA2", BIDIRECTIONAL),

    Pin(C, "PB0", BIDIRECTIONAL),
    Pin(D, "PB1", BIDIRECTIONAL),
    Pin(E, "PB2", BIDIRECTIONAL),
    Pin(F, "PB3", BIDIRECTIONAL),
    Pin(H, "PB4", BIDIRECTIONAL),
    Pin(J, "PB5", BIDIRECTIONAL),
    Pin(K, "PB6", BIDIRECTIONAL),
    Pin(L, "PB7", BIDIRECTIONAL),

    Pin(5, "SP1", BIDIRECTIONAL),
    Pin(7, "SP2", BIDIRECTIONAL),

    Pin(4, "CNT1", BIDIRECTIONAL),
    Pin(6, "CNT2", BIDIRECTIONAL),
    Pin(9, "ATN", OUTPUT),
    Pin(8, "_PC2", INPUT),
    Pin(B, "_FLAG2", OUTPUT),
    Pin(3, "_RESET", BIDIRECTIONAL),

    Pin(2, "VCC", UNCONNECTED),
    Pin(10, "VAC1", UNCONNECTED),
    Pin(11, "VAC22", UNCONNECTED),
    Pin(1, "GND1", UNCONNECTED),
    Pin(12, "GND2", UNCONNECTED),
    Pin(A, "GND3", UNCONNECTED),
    Pin(N, "GND4", UNCONNECTED),
  )
}
