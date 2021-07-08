// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Register addresses
// There is no register naming scheme listed in any literature that I have seen. These names
// are all made up by me.
export const SPR0X = 0x00
export const SPR0Y = 0x01
export const SPR1X = 0x02
export const SPR1Y = 0x03
export const SPR2X = 0x04
export const SPR2Y = 0x05
export const SPR3X = 0x06
export const SPR3Y = 0x07
export const SPR4X = 0x08
export const SPR4Y = 0x09
export const SPR5X = 0x0a
export const SPR5Y = 0x0b
export const SPR6X = 0x0c
export const SPR6Y = 0x0d
export const SPR7X = 0x0e
export const SPR7Y = 0x0f
export const SPRMSX = 0x10
export const CTRL1 = 0x11
export const RASTER = 0x12
export const LPX = 0x13
export const LPY = 0x14
export const SPREN = 0x15
export const CTRL2 = 0x16
export const SPRYEX = 0x17
export const MEMPTR = 0x18
export const IR = 0x19
export const IE = 0x1a
export const SPRDP = 0x1b
export const SPRMC = 0x1c
export const SPRXEX = 0x1d
export const SSCOL = 0x1e
export const SDCOL = 0x1f
export const BORDER = 0x20
export const BG0 = 0x21
export const BG1 = 0x22
export const BG2 = 0x23
export const BG3 = 0x24
export const SPRMC0 = 0x25
export const SPRMC1 = 0x26
export const SPR0C = 0x27
export const SPR1C = 0x28
export const SPR2C = 0x29
export const SPR3C = 0x2a
export const SPR4C = 0x2b
export const SPR5C = 0x2c
export const SPR6C = 0x2d
export const SPR7C = 0x2e
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

// Memory access types
export const ACCESS_TYPE_CPU = 'x'
export const ACCESS_TYPE_IDLE = 'i'
export const ACCESS_TYPE_REFRESH = 'r'
export const ACCESS_TYPE_VM_COLOR = 'c'
export const ACCESS_TYPE_BM_CHAR = 'g'
export const ACCESS_TYPE_SPR_PTR = 'p'
export const ACCESS_TYPE_SPR_DATA = 's'

export const SPR_PTR_CYCLES = [60, 62, 64, 1, 3, 5, 7, 9]

// Raster-related constants
// The number of clock cycles in a raster line. This is different between different VIC
// versions and even revisions; the 6569 (the PAL equivalent) has 63 cycles per line, while
// the 6567R56A has 64 cycles per line. The particular one emulated here is the 6567R8,
// which uses 65 cycles per line.
export const CYCLES_PER_LINE = 65

// The number of raster lines in a single frame. This again is different between different
// versions of the VIC; the 6567R56A has 262 while the 6569 has 312.
export const RASTER_LINES_PER_FRAME = 263

// The minimum and maximum raster lines that produce visible graphic output. This does not
// include the border. Bad line conditions can only happen on a line in the visible range.
export const RASTER_MIN_VISIBLE = 48
export const RASTER_MAX_VISIBLE = 247
