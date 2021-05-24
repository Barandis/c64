// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Pin from 'components/pin'
import Port from 'components/port'

const { INPUT, OUTPUT, BIDIRECTIONAL } = Pin

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

export default class UserPort extends Port {
  constructor() {
    super(
      new Pin(M, 'PA2', BIDIRECTIONAL),

      new Pin(C, 'PB0', BIDIRECTIONAL),
      new Pin(D, 'PB1', BIDIRECTIONAL),
      new Pin(E, 'PB2', BIDIRECTIONAL),
      new Pin(F, 'PB3', BIDIRECTIONAL),
      new Pin(H, 'PB4', BIDIRECTIONAL),
      new Pin(J, 'PB5', BIDIRECTIONAL),
      new Pin(K, 'PB6', BIDIRECTIONAL),
      new Pin(L, 'PB7', BIDIRECTIONAL),

      new Pin(5, 'SP1', BIDIRECTIONAL),
      new Pin(7, 'SP2', BIDIRECTIONAL),

      new Pin(4, 'CNT1', BIDIRECTIONAL),
      new Pin(6, 'CNT2', BIDIRECTIONAL),
      new Pin(9, 'ATN', OUTPUT),
      new Pin(8, '_PC2', INPUT),
      new Pin(B, '_FLAG2', OUTPUT),
      new Pin(3, '_RESET', BIDIRECTIONAL),

      new Pin(2, 'VCC'),
      new Pin(10, 'VAC1'),
      new Pin(11, 'VAC2'),
      new Pin(1, 'GND1'),
      new Pin(12, 'GND2'),
      new Pin(A, 'GND3'),
      new Pin(N, 'GND4'),
    )
  }
}
