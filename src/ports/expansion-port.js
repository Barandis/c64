// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Port } from 'components'
import Pin from 'components/pin'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT
const BIDIRECTIONAL = Pin.BIDIRECTIONAL

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
    new Pin(Y, 'A0', INPUT),
    new Pin(X, 'A1', INPUT),
    new Pin(W, 'A2', INPUT),
    new Pin(V, 'A3', INPUT),
    new Pin(U, 'A4', INPUT),
    new Pin(T, 'A5', INPUT),
    new Pin(S, 'A6', INPUT),
    new Pin(R, 'A7', INPUT),
    new Pin(P, 'A8', INPUT),
    new Pin(N, 'A9', INPUT),
    new Pin(M, 'A10', INPUT),
    new Pin(L, 'A11', INPUT),
    new Pin(K, 'A12', INPUT),
    new Pin(J, 'A13', INPUT),
    new Pin(H, 'A14', INPUT),
    new Pin(F, 'A15', INPUT),

    new Pin(21, 'D0', BIDIRECTIONAL),
    new Pin(20, 'D1', BIDIRECTIONAL),
    new Pin(19, 'D2', BIDIRECTIONAL),
    new Pin(18, 'D3', BIDIRECTIONAL),
    new Pin(17, 'D4', BIDIRECTIONAL),
    new Pin(16, 'D5', BIDIRECTIONAL),
    new Pin(15, 'D6', BIDIRECTIONAL),
    new Pin(14, 'D7', BIDIRECTIONAL),

    new Pin(5, 'R__W', INPUT),
    new Pin(8, '_GAME', OUTPUT),
    new Pin(9, '_EXROM', OUTPUT),
    new Pin(12, 'BA', INPUT),
    new Pin(13, '_DMA', OUTPUT),

    new Pin(7, '_IO1', INPUT),
    new Pin(10, '_IO2', INPUT),
    new Pin(11, '_ROML', INPUT),
    new Pin(B, '_ROMH', INPUT),

    new Pin(4, '_IRQ', OUTPUT),
    new Pin(D, '_NMI', OUTPUT),

    new Pin(6, 'φDOT', INPUT),
    new Pin(E, 'φ2', INPUT),

    new Pin(C, '_RESET', OUTPUT),

    new Pin(2, 'VCC1'),
    new Pin(3, 'VCC2'),

    new Pin(1, 'GND1'),
    new Pin(22, 'GND2'),
    new Pin(A, 'GND3'),
    new Pin(Z, 'GND4'),
  )
}
