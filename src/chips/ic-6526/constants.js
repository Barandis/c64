// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Register addresses
export const PRA = 0x0
export const PRB = 0x1
export const DDRA = 0x2
export const DDRB = 0x3
export const TALO = 0x4
export const TAHI = 0x5
export const TBLO = 0x6
export const TBHI = 0x7
export const TOD10TH = 0x8
export const TODSEC = 0x9
export const TODMIN = 0xa
export const TODHR = 0xb
export const SDR = 0xc
export const ICR = 0xd
export const CRA = 0xe
export const CRB = 0xf

// Interrupt Control Register bits
export const TA = 0
export const TB = 1
export const ALRM = 2
export const SP = 3
export const FLG = 4
export const IR = 7
export const SC = 7

// Control Register bits
export const START = 0
export const PBON = 1
export const OUTMODE = 2
export const RUNMODE = 3
export const LOAD = 4
export const INMODE = 5
export const INMODE0 = 5
export const SPMODE = 6
export const INMODE1 = 6
export const TODIN = 7
export const ALARM = 7

// Other register bits
export const PM = 7
