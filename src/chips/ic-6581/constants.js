// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Register addresses
export const FRELO1 = 0x00
export const FREHI1 = 0x01
export const PWLO1 = 0x02
export const PWHI1 = 0x03
export const VCREG1 = 0x04
export const ATDCY1 = 0x05
export const SUREL1 = 0x06
export const FRELO2 = 0x07
export const FREHI2 = 0x08
export const PWLO2 = 0x09
export const PWHI2 = 0x0a
export const VCREG2 = 0x0b
export const ATDCY2 = 0x0c
export const SUREL2 = 0x0d
export const FRELO3 = 0x0e
export const FREHI3 = 0x0f
export const PWLO3 = 0x10
export const PWHI3 = 0x11
export const VCREG3 = 0x12
export const ATDCY3 = 0x13
export const SUREL3 = 0x14
export const CUTLO = 0x15
export const CUTHI = 0x16
export const RESON = 0x17
export const SIGVOL = 0x18
export const POTX = 0x19
export const POTY = 0x1a
export const RANDOM = 0x1b
export const ENV3 = 0x1c
export const UNUSED1 = 0x1d
export const UNUSED2 = 0x1e
export const UNUSED3 = 0x1f

// Control register bits
export const GATE = 0
export const SYNC = 1
export const RING = 2
export const TEST = 3
export const TRIANGLE = 4
export const SAWTOOTH = 5
export const PULSE = 6
export const NOISE = 7

// Filter control register bits
export const FILTV1 = 0
export const FILTV2 = 1
export const FILTV3 = 2
export const FILTEXT = 3

// Filter select register bits
export const FILTLP = 4
export const FILTBP = 5
export const FILTHP = 6
export const DSCNV3 = 7

// Miscellaneous constants not tied to registers or bits within them

// This is the maximum number of cycles for which a write-only register, when read, will
// return a value of whatever was last written to *any* register. After that number of
// cycles since the last write, any read from a write-only register will result in zero.
// This is a simplification of the actual write-only read model, which fades the value more
// gradually to zero.
export const MAX_LAST_WRITE_TIME = 2000

// The minimum value that can be placed on one of the analog input pins (POTX, POTY).
export const MIN_ANALOG_VALUE = 0

// The maximum value that can be placed on one of the analog input pins (POTX, POTY).
export const MAX_ANALOG_VALUE = 1
