// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Register addresses
export const CIAPRA = 0x0
export const CIAPRB = 0x1
export const CIDDRA = 0x2
export const CIDDRB = 0x3
export const TIMALO = 0x4
export const TIMAHI = 0x5
export const TIMBLO = 0x6
export const TIMBHI = 0x7
export const TODTEN = 0x8
export const TODSEC = 0x9
export const TODMIN = 0xa
export const TODHRS = 0xb
export const CIASDR = 0xc
export const CIAICR = 0xd
export const CIACRA = 0xe
export const CIACRB = 0xf

// Interrupt Control Register bits
export const ICR_TA = 0
export const ICR_TB = 1
export const ICR_ALRM = 2
export const ICR_SP = 3
export const ICR_FLG = 4
export const ICR_IR = 7
export const ICR_SC = 7

// Control Register A bits
export const CRA_START = 0
export const CRA_PBON = 1
export const CRA_OUT = 2
export const CRA_RUN = 3
export const CRA_LOAD = 4
export const CRA_IN = 5
export const CRA_SP = 6
export const CRA_TOD = 7

// Control Register B bits
export const CRB_START = 0
export const CRB_PBON = 1
export const CRB_OUT = 2
export const CRB_RUN = 3
export const CRB_LOAD = 4
export const CRB_IN0 = 5
export const CRB_IN1 = 6
export const CRB_ALRM = 7
