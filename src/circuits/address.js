/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newTrace, PULL_UP } from "components/trace"

// The address bus in the Commodore 64 is written two by only two chips: the CPU and the VIC. Only
// one can write to the address bus at a time, and which is active is determined by the phase of the
// clock cycle (the VIC has control when the clock is low, the CPU when the clock is high) and by
// the BA/AEC signals from the VIC (which can allow the VIC complete control of the bus for an
// extended period of time when it needs it). Whichever is not active tri-states its address outputs
// so that it doens't interfere with the active chip.
//
// The VIC, through logic implemented in the PLA, only has access to system RAM, color RAM,
// character ROM, and potentially the high bank of ROM through the expansion port (only when an
// Ultimax cartridge is plugged in). The CPU has full access to all memory, including registers in
// the VIC, SID, and CIA chips.
//
// Sharing between the VIC and CPU would be easy if that was all there was to it - the VIC signals
// which chip is active through AEC, and whichever chip is not active simply tri-states its address
// outputs. However, there are two caveats. One is that the VIC only has a 14-bit address bus and
// can therefore only address 16k of RAM; the Commodore 64 uses one of the CIAs to bank switch with
// two additional signals, which act functionally as the VIC's 15th and 16th address lines. The
// second caveat is that this is from a time when 40 pins was as large as an IC package got, and
// with all of the other things that the VIC does, it has only 12 pins left for addressing when it
// needs 14. Therefore the VIC multiplexes a portion of its address bus; VA0...VA5 and VA12...VA13
// are *only* available multiplexed (with VA4...VA5), while VA6 and VA7 are available *only* singly
// (they have no multiplex partners because VA14 and VA15 don't exist in a 14-bit system).
// VA8...VA11 are all available on their own pins *and* as opart of multiplexed pins with VA0...VA3.
//
// To account for this, the C64 address bus basically comes in two physical parts: a full address
// bus (full bus) of 16 lines, and a multiplexed address bus (mux bus) of 8 lines. (The names in
// parentheses are something I just made up, but I like them.) While these can be thought of as the
// CPU address bus and the VIC address bus, that isn't fully true as each has reason to access the
// other.
//
// All of the C64 memory components live on the full bus *except* for the system DRAM. Since the
// 4164 chip used as RAM actually uses a multiplexed address bus (it has only 8 address pins), it
// resides on the mux bus. The CPU accesses the mux bus through the multiplexers U13 and U25, which
// are only active when the CPU is active. The VIC accesses the full bus through the latch U26 for
// the low 8 bits and its single address pins A8...A11 for the high 4 bits (the VIC only uses the
// full bus for character ROM and color RAM access, and they only require 12 and 10 bits
// respectively). The latch keeps the lower 8 bits on the full bus even after the mux bus switches
// from low to high.
//
// VA6 and VA7 do not conventionally come in multiplexed form. However, as noted above, the CIA2
// produces signals that can be used as VA14 and VA15. To incorporate those into the mux bus, they
// have to be mulitiplexed with the VA6 and VA7 signals provided by the VIC. This is done with the
// inverting multiplexer U14. The inverting mux (74LS258) is used instead of a regular mux (74LS257)
// because the outputs of the CIAs are active low (inverted). Two of U14's four channels are used to
// invert VA6 and VA7, which are then fed back as _VA6 and _VA7 to U14's other two channels along
// with _VA14 and _VA15 from CIA2. Putting them through the inverting mux once more produces the
// active high multiplexed VA6_VA14 and VA7_VA15.

function newFullBus({ U1, U2, U3, U4, U5, U6, U7, U13, U15, U17, U18, U19, U25, U26 }, { CN6 }) {
  // Full bus to processor chips

  // U1: 6526 CIA1 (A0...A3 to control 16 registers)
  // U2: 6526 CIA2 (A0...A3 to control 16 registers)
  // U7: 6510 CPU (A0...A15, source of address bus)
  // U18: 6581 SID (A0...A4 to control 32 registers)
  // U19: 6567 VIC (A8...A11, other address lines are connected through latch U25)

  // A12...A15 are pulled up because the VIC has no connection to the full bus's A12...A15. Thus,
  // when the VIC is active and the CPU is not connected to the bus, there is nothing driving those
  // four lines.
  const A0 = newTrace(U7.A0, U1.PS0, U2.PS0, U18.A0)
  const A1 = newTrace(U7.A1, U1.PS1, U2.PS1, U18.A1)
  const A2 = newTrace(U7.A2, U1.PS2, U2.PS2, U18.A2)
  const A3 = newTrace(U7.A3, U1.PS3, U2.PS3, U18.A3)
  const A4 = newTrace(U7.A4, U18.A4)
  const A5 = newTrace(U7.A5)
  const A6 = newTrace(U7.A6)
  const A7 = newTrace(U7.A7)
  const A8 = newTrace(U7.A8, U19.A8)
  const A9 = newTrace(U7.A9, U19.A9)
  const A10 = newTrace(U7.A10, U19.A10)
  const A11 = newTrace(U7.A11, U19.A11)
  const A12 = newTrace(PULL_UP, U7.A12)
  const A13 = newTrace(PULL_UP, U7.A13)
  const A14 = newTrace(PULL_UP, U7.A14)
  const A15 = newTrace(PULL_UP, U7.A15)

  // Full bus to memory address and memory control

  // U3: 2364 8k x 8 ROM (BASIC) (A0...A12)
  // U4: 2364 8k x 8 ROM (KERNAL) (A0...A12)
  // U5: 2332 4k x 8 ROM (CHAROM) (A0...A11)
  // U6: 2114 1k x 4 SRAM (Color RAM) (A0...A9)
  // U13: 74LS257 Quad 2-1 Mux (multiplexes A4...A7 and A12...A15 to mux bus lines 4...7)
  // U15: 74LS139 Dual 2-4 Demux (selects CS lines based on A8...A11)
  // U17: 82S100 PLA (A12...A15)
  // U25: 74LS257 Quad 2-1 Mux (multiplexes A0...A3 and A8...A11 to mux bus lines 0...3)
  A0.addPins(U3.A0, U4.A0, U5.A0, U6.A0, U25.B4)
  A1.addPins(U3.A1, U4.A1, U5.A1, U6.A1, U25.B3)
  A2.addPins(U3.A2, U4.A2, U5.A2, U6.A2, U25.B2)
  A3.addPins(U3.A3, U4.A3, U5.A3, U6.A3, U25.B1)
  A4.addPins(U3.A4, U4.A4, U5.A4, U6.A4, U13.B4)
  A5.addPins(U3.A5, U4.A5, U5.A5, U6.A5, U13.B2)
  A6.addPins(U3.A6, U4.A6, U5.A6, U6.A6, U13.B1)
  A7.addPins(U3.A7, U4.A7, U5.A7, U6.A7, U13.B3)
  A8.addPins(U3.A8, U4.A8, U5.A8, U6.A8, U25.A4, U15.A2)
  A9.addPins(U3.A9, U4.A9, U5.A9, U6.A9, U25.A3, U15.B2)
  A10.addPins(U3.A10, U4.A10, U5.A10, U25.A2, U15.A1)
  A11.addPins(U3.A11, U4.A11, U5.A11.U25.A1, U15.A2)
  A12.addPins(U3.A12, U4.A12, U13.A4, U17.I8)
  A13.addPins(U13.A2, U17.I7)
  A14.addPins(U13.A1, U17.I6)
  A15.addPins(U13.A3, U17.I5)

  // Full bus to other circuits

  // U26: 74LS373 Octal Latch (connects mux bus to A0...A7)
  // CN6: Expansion port (A0...A15)
  A0.addPins(U26.O2, CN6.A0)
  A1.addPins(U26.O4, CN6.A1)
  A2.addPins(U26.O3, CN6.A2)
  A3.addPins(U26.O5, CN6.A3)
  A4.addPins(U25.O6, CN6.A4)
  A5.addPins(U25.O7, CN6.A5)
  A6.addPins(U25.O1, CN6.A6)
  A7.addPins(U25.O0, CN6.A7)
  A8.addPins(CN6.A8)
  A9.addPins(CN6.A9)
  A10.addPins(CN6.A10)
  A11.addPins(CN6.A11)
  A12.addPins(CN6.A12)
  A13.addPins(CN6.A13)
  A14.addPins(CN6.A14)
  A15.addPins(CN6.A15)

  return { A0, A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11, A12, A13, A14, A15 }
}

function newMuxBus({ U2, U9, U10, U11, U12, U13, U14, U17, U19, U21, U22, U23, U24, U25, U26 }) {
  // Multiplexers and latches

  // U13: 74LS257 Quad 2-1 Mux (connects VA4...VA7, VA12...VA15 to full bus when CPU active)
  // U14: 74LS258 Quad 2-1 Mux (source of VA6_VA14...VA7_VA15)
  // U19: 6567 VIC (source of VA0_VA8...VA5_VA13)
  // U25: 74LS257 Quad 2-1 Mux (connects VA0...VA3, VA8...VA11 to full bus when CPU active)
  // U26: 74LS373 Octal Latch (connects VA0...VA7 to full bus when VIC active)
  const VA0_VA8 = newTrace(U19.A0_A8, U26.D2, U25.Y4)
  const VA1_VA9 = newTrace(U19.A1_A9, U26.D4, U25.Y3)
  const VA2_VA10 = newTrace(U19.A2_A10, U26.D3, U25.Y2)
  const VA3_VA11 = newTrace(U19.A3_A11, U26.D5, U25.Y1)
  const VA4_VA12 = newTrace(U19.A4_A12, U26.D6, U13.Y4)
  const VA5_VA13 = newTrace(U19.A5_A13, U26.D7, U13.U2)
  const VA6_VA14 = newTrace(U14._Y1, U26.D1, U13.Y1)
  const VA7_VA15 = newTrace(U14._Y2, U26.D0, U13.Y3)

  // Connections to create VA6_VA14 and VA7_VA15

  // U2: 6526 CIA2 (source of _VA14..._VA15)
  // U14: 74LS258 Quad 2-1 Mux (multiplexes VA6...VA7 with _VA14..._VA15 from CIA2)
  // U19: 6567 VIC (source of VA6...VA7)

  // How this works: VA6 and VA7 are fed solo to separate channels of U14, which inverts its
  // outputs, producing _VA6 and _VA7. _VA14 and _VA15 are produced not by the VIC but by CIA2 (VIC
  // has only 14 address lines, CIA2 is used to switch them among 4 banks), and since outputs from
  // the CIA parallel ports are active-low, they match the polarity of the newly-created _VA6 and
  // _VA7. They are multiplexed with the other two channels on U14, and since the outputs are
  // inverted, combine _VA6 and _VA14 into VA6_VA14, and _VA7 and _VA15 into VA7_VA15.
  const _VA14 = newTrace(U2.PA0, U14.A1)
  const _VA15 = newTrace(U2.PA1, U14.A2)
  const VA6 = newTrace(U19.A6, U14.A4, U14.B4)
  const VA7 = newTrace(U19.A7, U14.A3, U14.B3)
  const _VA6 = newTrace(U14._Y4, U14.B1)
  const _VA7 = newTrace(U14._Y3, U14.B2)

  // Mux bus to DRAM

  // U9: 4164 64k x 1-bit dynamic RAM (bit 1)
  // U10: 4164 64k x 1-bit dynamic RAM (bit 3)
  // U11: 4164 64k x 1-bit dynamic RAM (bit 5)
  // U12: 4164 64k x 1-bit dynamic RAM (bit 7)
  // U21: 4164 64k x 1-bit dynamic RAM (bit 0)
  // U22: 4164 64k x 1-bit dynamic RAM (bit 2)
  // U23: 4164 64k x 1-bit dynamic RAM (bit 4)
  // U24: 4164 64k x 1-bit dynamic RAM (bit 6)

  // When the CPU is active, the U19 VIC address lines are hi-Z, the U26 latch and U14 high-VA
  // multiplexer are disabled, and the U13 and U25 full bus multiplexers are active, connecting the
  // full bus to the mux bus and giving it control over the DRAM. When the VIC is active, U19, U26,
  // and U14 become active again, generating the mux bus as U13 and U25 become inactive and cut the
  // full bus off, giving the VIC control of the DRAM.
  VA0_VA8.addPins(U9.A0, U10.A0, U11.A0, U12.A0, U21.A0, U22.A0, U23.A0, U24.A0)
  VA1_VA9.addPins(U9.A1, U10.A1, U11.A1, U12.A1, U21.A1, U22.A1, U23.A1, U24.A1)
  VA2_VA10.addPins(U9.A2, U10.A2, U11.A2, U12.A2, U21.A2, U22.A2, U23.A2, U24.A2)
  VA3_VA11.addPins(U9.A3, U10.A3, U11.A3, U12.A3, U21.A3, U22.A3, U23.A3, U24.A3)
  VA4_VA12.addPins(U9.A4, U10.A4, U11.A4, U12.A4, U21.A4, U22.A4, U23.A4, U24.A4)
  VA5_VA13.addPins(U9.A5, U10.A5, U11.A5, U12.A5, U21.A5, U22.A5, U23.A5, U24.A5)
  VA6_VA14.addPins(U9.A6, U10.A6, U11.A6, U12.A6, U21.A6, U22.A6, U23.A6, U24.A6)
  VA7_VA15.addPins(U9.A7, U10.A7, U11.A7, U12.A7, U21.A7, U22.A7, U23.A7, U24.A7)

  // Mux bus to memory control

  // U17: 82S100 PLA (VA12...VA13, _VA14)

  // Three VIC address lines are necessary to determine whether a memory access from the VIC is
  // within certain ranges to enable certain memory chips.
  VA4_VA12.addPins(U17.I15)
  VA5_VA13.addPins(U17.I14)
  _VA14.addPins(U17.I4)

  // The mux bus lines are the ones with two VA numbers separated by `_`. The other values are
  // intermediate values used only to produce the upper two lines of the mux bus(except for _VA14,
  // which is also sent to the PLA), but even so, all are valid.
  return {
    VA0_VA8,
    VA1_VA9,
    VA2_VA10,
    VA3_VA11,
    VA4_VA12,
    VA5_VA13,
    VA6_VA14,
    VA7_VA15,
    VA6,
    VA7,
    _VA6,
    _VA7,
    _VA14,
    _VA15,
  }
}

export function newAddressBus(chips, ports) {
  return { ...newFullBus(chips, ports), ...newMuxBus(chips, ports) }
}
