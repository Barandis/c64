/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// The states that a pin or trace can be in. LOW and HIGH are equivalent to binary 0 and 1
// respectively. HI_Z refers to a high impedence, which is the equivalent of no value at all.
// High impedence states effectively remove a pin from the circuit to which it is connected.

export const LOW = Symbol("LOW")
export const HIGH = Symbol("HIGH")
export const HI_Z = Symbol("HI_Z")
