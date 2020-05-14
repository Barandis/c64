/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// The states that a pin or trace can be in. LOW and HIGH are equivalent to binary 0 and 1
// respectively. TRI refers to the third state in a tri-state system, which is the equivalent of no
// value at all. Tri-state is typically implemented in real-world electronics as a high-impedence
// state that effectively disconnects a pin from a circuit.

export const LOW = Symbol("LOW")
export const HIGH = Symbol("HIGH")
export const TRI = Symbol("TRI")
