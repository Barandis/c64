/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, BIDIRECTIONAL, INPUT } from "components/pin"

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

export function createUserPort() {
  const pins = {
    PA2: createPin(M, "PA2", BIDIRECTIONAL),

    PB0: createPin(C, "PB0", BIDIRECTIONAL),
    PB1: createPin(D, "PB1", BIDIRECTIONAL),
    PB2: createPin(E, "PB2", BIDIRECTIONAL),
    PB3: createPin(F, "PB3", BIDIRECTIONAL),
    PB4: createPin(H, "PB4", BIDIRECTIONAL),
    PB5: createPin(J, "PB5", BIDIRECTIONAL),
    PB6: createPin(K, "PB6", BIDIRECTIONAL),
    PB7: createPin(L, "PB7", BIDIRECTIONAL),

    SP1: createPin(5, "SP1", BIDIRECTIONAL),
    SP2: createPin(7, "SP2", BIDIRECTIONAL),

    CNT1: createPin(4, "CNT1", BIDIRECTIONAL),
    CNT2: createPin(6, "CNT2", BIDIRECTIONAL),
    ATN: createPin(9, "ATN", BIDIRECTIONAL),
    _PC2: createPin(8, "_PC2", BIDIRECTIONAL),
    _FLAG2: createPin(B, "_FLAG2", BIDIRECTIONAL),
    _RESET: createPin(3, "_RESET", BIDIRECTIONAL),

    VCC: createPin(2, "VCC", INPUT, null),
    VAC1: createPin(10, "VAC", INPUT, null),
    VAC2: createPin(11, "VAC", INPUT, null),
    GND1: createPin(1, "GND", INPUT, null),
    GND2: createPin(12, "GND", INPUT, null),
    GND3: createPin(A, "GND", INPUT, null),
    GND4: createPin(N, "GND", INPUT, null),
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
