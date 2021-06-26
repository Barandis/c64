// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Register addresses
export const MOB0X = 0x00
export const MOB0Y = 0x01
export const MOB1X = 0x02
export const MOB1Y = 0x03
export const MOB2X = 0x04
export const MOB2Y = 0x05
export const MOB3X = 0x06
export const MOB3Y = 0x07
export const MOB4X = 0x08
export const MOB4Y = 0x09
export const MOB5X = 0x0a
export const MOB5Y = 0x0b
export const MOB6X = 0x0c
export const MOB6Y = 0x0d
export const MOB7X = 0x0e
export const MOB7Y = 0x0f
export const MOBMSB = 0x10
export const CTRL1 = 0x11
export const RASTER = 0x12
export const LPX = 0x13
export const LPY = 0x14
export const MOBEN = 0x15
export const CTRL2 = 0x16
export const MOBYE = 0x17
export const MEMPTR = 0x18
export const IR = 0x19
export const IE = 0x1a
export const MOBDP = 0x1b
export const MOBMC = 0x1c
export const MOBXE = 0x1d
export const MOBMOB = 0x1e
export const MOBDAT = 0x1f
export const BORDER = 0x20
export const BG0 = 0x21
export const BG1 = 0x22
export const BG2 = 0x23
export const BG3 = 0x24
export const MOBMC0 = 0x25
export const MOBMC1 = 0x26
export const MOB0C = 0x27
export const MOB1C = 0x28
export const MOB2C = 0x29
export const MOB3C = 0x2a
export const MOB4C = 0x2b
export const MOB5C = 0x2c
export const MOB6C = 0x2d
export const MOB7C = 0x2e
export const UNUSED1 = 0x2f
export const UNUSED2 = 0x30
export const UNUSED3 = 0x31
export const UNUSED4 = 0x32
export const UNUSED5 = 0x33
export const UNUSED6 = 0x34
export const UNUSED7 = 0x35
export const UNUSED8 = 0x36
export const UNUSED9 = 0x37
export const UNUSED10 = 0x38
export const UNUSED11 = 0x39
export const UNUSED12 = 0x3a
export const UNUSED13 = 0x3b
export const UNUSED14 = 0x3c
export const UNUSED15 = 0x3d
export const UNUSED16 = 0x3e
export const UNUSED17 = 0x3f

// Control register 1 bits
export const RSEL = 3
export const DEN = 4
export const BMM = 5
export const ECM = 6
export const RST8 = 7

// Control register 2 bits
export const CSEL = 3
export const MCM = 4
export const RES = 5

// Memory pointer bits
export const CB11 = 1
export const CB12 = 2
export const CB13 = 3
export const VM10 = 4
export const VM11 = 5
export const VM12 = 6
export const VM13 = 7

// Interrupt register bits
export const IRST = 0
export const IMBC = 1
export const IMMC = 2
export const ILP = 3
export const IRQ = 7

// Interrupt enable bits
export const ERST = 0
export const EMBC = 1
export const EMMC = 2
export const ELP = 3

// Colors
export const BLACK = 0
export const WHITE = 1
export const RED = 2
export const CYAN = 3
export const PINK = 4
export const GREEN = 5
export const BLUE = 6
export const YELLOW = 7
export const ORANGE = 8
export const BROWN = 9
export const LTRED = 10
export const DKGRAY = 11
export const MDGRAY = 12
export const LTGREEN = 13
export const LTBLUE = 14
export const LTGRAY = 15
