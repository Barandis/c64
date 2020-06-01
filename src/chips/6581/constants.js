// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Register addresses
export const FRELO1 = 0x00 // Voice 1 Frequency Control (low byte)
export const FREHI1 = 0x01 // Voice 1 Frequency Control (high byte)
export const PWLO1 = 0x02 // Voice 1 Pulse Waveform Width (low byte)
export const PWHI1 = 0x03 // Voice 1 Pulse Waveform Width (high nybble)
export const VCREG1 = 0x04 // Voice 1 Control Register
export const ATDCY1 = 0x05 // Voice 1 Attack/Decay Register
export const SUREL1 = 0x06 // Voice 1 Sustain/Release Register
export const FRELO2 = 0x07 // Voice 2 Frequency Control (low byte)
export const FREHI2 = 0x08 // Voice 2 Frequency Control (high byte)
export const PWLO2 = 0x09 // Voice 2 Pulse Waveform Width (low byte)
export const PWHI2 = 0x0a // Voice 2 Pulse Waveform Width (high nybble)
export const VCREG2 = 0x0b // Voice 2 Control Register
export const ATDCY2 = 0x0c // Voice 2 Attack/Decay Register
export const SUREL2 = 0x0d // Voice 2 Sustain/Release Register
export const FRELO3 = 0x0e // Voice 3 Frequency Control (low byte)
export const FREHI3 = 0x0f // Voice 3 Frequency Control (high byte)
export const PWLO3 = 0x10 // Voice 3 Pulse Waveform Width (low byte)
export const PWHI3 = 0x11 // Voice 3 Pulse Waveform Width (high nybble)
export const VCREG3 = 0x12 // Voice 3 Control Register
export const ATDCY3 = 0x13 // Voice 3 Attack/Decay Register
export const SUREL3 = 0x14 // Voice 3 Sustain/Release Register
export const CUTLO = 0x15 // Filter Cutoff Frequency (low byte)
export const CUTHI = 0x16 // Filter Cutoff Frequency (high byte)
export const RESON = 0x17 // Filter Resonance Control Register
export const SIGVOL = 0x18 // Volume and Filter Select Register
export const POTX = 0x19 // Read Game Paddle 1 (or 3) Position
export const POTY = 0x1a // Read Game Paddle 2 (or 4) Position
export const RANDOM = 0x1b // Read Oscillator 3/Random Number Generator
export const ENV3 = 0x1c // Envelope Generator 3 Output
export const UNUSED1 = 0x1d // Unused
export const UNUSED2 = 0x1e // Unused
export const UNUSED3 = 0x1f // Unused

// Control register bits
export const GATE = 0 // Gates tone; 1 = start attack, 0 = start release
export const SYNC = 1 // Sync oscillator from voice with (voice + 2) % 3
export const RING = 2 // 1 = replace triangle with RM combination of voice & (voice + 2) % 3
export const TEST = 3 // 1 = disable oscillator
export const TRIANGLE = 4 // 1 = select triangle waveform
export const SAWTOOTH = 5 // 1 = select sawtooth waveform
export const PULSE = 6 // 1 = select pulse waveform
export const NOISE = 7 // 1 = select white noise waveform

// Filter control register bits
export const FILTV1 = 0 // 1 = voice 1 is filtered
export const FILTV2 = 1 // 1 = voice 2 is filtered
export const FILTV3 = 2 // 1 = voice 3 is filtered
export const FILTEXT = 3 // 1 = external audio is filtered

// Filter select register bits
export const FILTLP = 4 // 1 = low-pass filter is on
export const FILTBP = 5 // 1 = band-pass filter is on
export const FILTHP = 6 // 1 = high-pass filter is on
export const DSCNV3 = 7 // 1 = voice 3 audio output is disconnected

// Miscellaneous constants not tied to registers or bits within them

// This is the maximum number of cycles for which a write-only register, when read, will return a
// value of whatever was last written to *any* register. After that number of cycles since the last
// write, any read from a write-only register will result in zero. This is a simplification of the
// actual write-only read model, which fades the value more gradually to zero.
export const MAX_LAST_WRITE_TIME = 2000

// The minimum value that can be placed on one of the analog input pins (POTX, POTY).
export const MIN_ANALOG_VALUE = 0

// The maximum value that can be placed on one of the analog input pins (POTX, POTY).
export const MAX_ANALOG_VALUE = 1
