// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Register addresses
export const CIAPRA = 0x0 // Data Port Register A
export const CIAPRB = 0x1 // Data Port Register B
export const CIDDRA = 0x2 // Data Direction Register A
export const CIDDRB = 0x3 // Data Direction Register B
export const TIMALO = 0x4 // Timer A (low byte)
export const TIMAHI = 0x5 // Timer A (high byte)
export const TIMBLO = 0x6 // Timer B (low byte)
export const TIMBHI = 0x7 // Timer B (high byte)
export const TODTEN = 0x8 // Time of Day Clock Tenths of Seconds
export const TODSEC = 0x9 // Time of Day Clock Seconds
export const TODMIN = 0xa // Time of Day Clock Minutes
export const TODHRS = 0xb // Time of Day Clock Hours
export const CIASDR = 0xc // Serial Data Port
export const CIAICR = 0xd // Interrupt Control Register
export const CIACRA = 0xe // Control Register A
export const CIACRB = 0xf // Control Register B

// Interrupt Control Register bits
export const ICR_TA = 0 // Timer A Underflow
export const ICR_TB = 1 // Timer B Underflow
export const ICR_ALRM = 2 // Time of Day Alarm
export const ICR_SP = 3 // Serial Port Full/Empty
export const ICR_FLG = 4 // _FLAG Pin
export const ICR_IR = 7 // (Read only) _IRQ Enable
export const ICR_SC = 7 // (Write only) Set/Carry

// Control Register A bits
export const CRA_START = 0 // Timer A: 1 = start, 0 = stop
export const CRA_PBON = 1 // PB6: 1 = Timer A output, 0 = normal operation
export const CRA_OUT = 2 // Timer A output: 1 = toggle, 0 = pulse
export const CRA_RUN = 3 // Timer A mode: 1 = one-shot, 0 = continuous
export const CRA_LOAD = 4 // 1 = force load latch into Timer A (not stored)
export const CRA_IN = 5 // Timer A counts: 1 = CNT transitions, 0 = φ2 pulses
export const CRA_SP = 6 // Serial Port: 1 = output, 0 = input
export const CRA_TOD = 7 // 1 = 50Hz clock on TOD pin, 0 = 60HZ clock on TOD pin

// Control Register B bits
export const CRB_START = 0 // Timer B: 1 = start, 0 = stop
export const CRB_PBON = 1 // PB7: 1 = Timer B output, 0 = normal operation
export const CRB_OUT = 2 // Timer B output: 1 = toggle, 0 = pulse
export const CRB_RUN = 3 // Timer B mode: 1 = one-shot, 0 = continuous
export const CRB_LOAD = 4 // 1 = force load latch into Timer B (not stored)
export const CRB_IN0 = 5 // Timer B counts: 11 = Timer A zeros when CNT high, 10 = Timer A zeros,
export const CRB_IN1 = 6 //                 01 = CNT transitions, 00 = φ2 pulses
export const CRB_ALRM = 7 // 1 = writing to TOD sets ALARM, 0 = writing to TOD sets TOD clock
