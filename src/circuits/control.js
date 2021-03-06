// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Trace from 'components/trace'

export function ControlCircuit(
  {
    U1, U2, U3, U4, U5, U6, U7, U8, U9, U10, U11, U12, U13, U14, U15, U16, U17,
    U18, U19, U21, U22, U23, U24, U25, U26, U27,
  },
  { CN1, CN2, CN4, CN6 },
) {
  // PLA-based chip control

  // U1: 6526 CIA (enabled by demux)
  // U2: 6526 CIA (enabled by demux)
  // U3: 2364 8k x 8-bit ROM (BASIC) (enabled by PLA)
  // U4: 2364 8k x 8-bit ROM (KERNAL) (enabled by PLA)
  // U5: 2332 4k x 8-bit ROM (CHAROM) (enabled by PLA)
  // U6: 2114 1k x 4-bit static RAM (color RAM) (write enabled by demux)
  // U7: 6510 CPU (source of _LORAM, _HIRAM, _CHAREN, R/_W)
  // U8: 7406 Hex inverter (source of _AEC)
  // U9: 4164 64k x 1-bit dynamic RAM (enabled by PLA)
  // U10: 4164 64k x 1-bit dynamic RAM (enabled by PLA)
  // U11: 4164 64k x 1-bit dynamic RAM (enabled by PLA)
  // U12: 4164 64k x 1-bit dynamic RAM (enabled by PLA)
  // U15: 74LS138 Dual 2-4 Demux (decodes I/O control addresses)
  // U17: 82S100 PLA
  // U18: 6581 SID  (enabled by demux)
  // U19: 6567 VIC (source of BA, _CAS; enabled by demux)
  // U21: 4164 64k x 1-bit dynamic RAM (enabled by PLA)
  // U22: 4164 64k x 1-bit dynamic RAM (enabled by PLA)
  // U23: 4164 64k x 1-bit dynamic RAM (enabled by PLA)
  // U24: 4164 64k x 1-bit dynamic RAM (enabled by PLA)
  // U27: 74LS06 Quad AND gate (combines signals to enable SRAM)
  // CN6: Expansion port (source of _EXROM, _GAME)

  // This is essentially everything into and out of the PLA and its
  // associated demultiplexer, which uses programmed logic to take 20
  // inputs and determine which addressable chips/expansion port pins
  // should be enabled. A8...A11 are connected to U15 and A12...A15,
  // VA12...VA13, and _VA14 are already connected U17 in the address bus
  // definitions.
  const _CAS = new Trace(U19._CAS, U17.I0)
  const _LORAM = new Trace(U7.P0, U17.I1).pullUp()
  const _HIRAM = new Trace(U7.P1, U17.I2).pullUp()
  const _CHAREN = new Trace(U7.P2, U17.I3).pullUp()
  const BA = new Trace(U19.BA, U17.I9)
  const _AEC = new Trace(U8.Y5, U17.I10)
  const R__W = new Trace(U7.R__W, U17.I11).pullUp()
  const _EXROM = new Trace(CN6._EXROM, U17.I12).pullUp()
  const _GAME = new Trace(CN6._GAME, U17.I13).pullUp()
  const _CASRAM = new Trace(U17.F0, U9._CAS, U10._CAS, U11._CAS, U12._CAS)
  _CASRAM.addPins(U21._CAS, U22._CAS, U23._CAS, U24._CAS)
  const _BASIC = new Trace(U17.F1, U3._CS)
  const _KERNAL = new Trace(U17.F2, U4._CS)
  const _CHAROM = new Trace(U17.F3, U5._CS1)
  const _CHAROM2 = new Trace(U5._CS2).pullUp() // _CS2 always high
  const GR__W = new Trace(U17.F4, U6._WE)
  const _IO = new Trace(U17.F5, U15._G1)
  const _ROML = new Trace(U17.F6, CN6._ROML)
  const _ROMH = new Trace(U17.F7, CN6._ROMH)
  const _VIC = new Trace(U15._Y10, U19._CS)
  const _SID = new Trace(U15._Y11, U18._CS)
  const _COLOR = new Trace(U15._Y12, U27.A3)
  const _SRAM = new Trace(U27.Y3, U6._CS)
  const _CIAS = new Trace(U15._Y13, U15._G2)
  const _CIA1 = new Trace(U15._Y20, U1._CS)
  const _CIA2 = new Trace(U15._Y21, U2._CS)
  const _IO1 = new Trace(U15._Y22, CN6._IO1)
  const _IO2 = new Trace(U15._Y23, CN6._IO2)
  const _PLA = new Trace(U17._OE).pullDown() // PLA out always enabled

  // Non-PLA-based chip control

  // U1: 6526 CIA (write-enabled by R/_W)
  // U2: 6526 CIA (write-enabled by R/_W)
  // U7: 6510 CPU (enabled by CAEC, RDY)
  // U8: 7406 Hex inverter (receives AEC and inverts it into _AEC)
  // U9: 4164 64k x 1-bit dynamic RAM (write-enabled by R/_W)
  // U10: 4164 64k x 1-bit dynamic RAM (write-enabled by R/_W)
  // U11: 4164 64k x 1-bit dynamic RAM (write-enabled by R/_W)
  // U12: 4164 64k x 1-bit dynamic RAM (write-enabled by R/_W)
  // U13: 74LS257 Quad 2-1 mux (enabled by _AEC, seclected by _CAS)
  // U14: 74LS258 Quad 2-1 mux (enabled by AEC, seclected by _CAS)
  // U16: 4066 Quad bilateral switch (switched by AEC)
  // U18: 6581 SID (write-enabled by R/_W)
  // U19: 6567 VIC (source of _RAS, AEC, write-enabled by R/_W)
  // U21: 4164 64k x 1-bit dynamic RAM (write-enabled by R/_W)
  // U22: 4164 64k x 1-bit dynamic RAM (write-enabled by R/_W)
  // U23: 4164 64k x 1-bit dynamic RAM (write-enabled by R/_W)
  // U24: 4164 64k x 1-bit dynamic RAM (write-enabled by R/_W)
  // U25: 74LS257 Quad 2-1 mux (enabled by _AEC, seclected by _CAS)
  // U26: 74LS373 Octal latch (latched by _RAS)
  // U27: 74LS08 Quad AND gate (combines AEC, BA, _DMA into CAEC, RDY,
  //      SRAM _CS)
  // CN6: Expansion port (source of _DMA)

  // Non-PLA signals are done here just in the interest of complexity.
  // The only difference in criteria for this section is that the PLA is
  // not involved in any of these signals.
  _CAS.addPins(U14.SEL, U13.SEL, U25.SEL)
  BA.addPins(U27.A1, CN6.BA)
  _AEC.addPins(U13._OE, U25._OE)
  R__W.addPins(U1.R__W, U2.R__W, U18.R__W, U19.R__W, CN6.R__W)
  R__W.addPins(U9._WE, U10._WE, U11._WE, U12._WE)
  R__W.addPins(U21._WE, U22._WE, U23._WE, U24._WE)
  const _RAS = new Trace(
    U19._RAS, U26.LE, U9._RAS, U10._RAS, U11._RAS, U12._RAS,
  )
  _RAS.addPins(U21._RAS, U22._RAS, U23._RAS)
  const AEC = new Trace(U19.AEC, U16.X1, U16.X2, U16.X3, U16.X4)
  AEC.addPins(U27.B3, U26._OE, U14._OE, U8.A5, U27.A2)
  const _DMA = new Trace(CN6._DMA, U27.B1, U27.B2).pullUp()
  const RDY = new Trace(U27.Y1, U7.RDY)
  const CAEC = new Trace(U27.Y2, U7.AEC)

  // Reset, IRQ, and NMI

  // U1: 6526 CIA (receives _RES, provides _IRQ)
  // U2: 6526 CIA (receives _RES, provides _NMI)
  // U7: 6510 CPU (receives _RES, _IRQ, _NMI)
  // U18: 6581 SID (receives _RES)
  // U19: 6567 VIC (provides _IRQ)
  // CN1: Keyboard port (provides _NMI from _RESTORE)
  // CN2: User port (provides _RES)
  // CN4: Serial port (provides _RES)
  // CN6: Expansion port (receives _RES, provides _NMI, _IRQ)
  const _RES = new Trace(CN2._RESET, CN4._RESET).pullUp()
  _RES.addPins(U7._RES, U1._RES, U2._RES, U18._RES, CN6._RESET)
  const _NMI = new Trace(U2._IRQ, CN1._RESTORE, CN6._NMI, U7._NMI).pullUp()
  const _IRQ = new Trace(U1._IRQ, U19._IRQ, CN6._IRQ, U7._IRQ).pullUp()

  // Clocks

  // U1: 6526 CIA (receives φ2, TOD)
  // U2: 6526 CIA (receives φ2, TOD)
  // U7: 6510 CPU (receives φ0, provides φ2)
  // U18: 6581 SID (receives φ2)
  // U19: 6567 VIC (receives φDOT, φCOLOR, provides φ0)
  // CN6: Expansion port (receives φDOT, φ2)

  // Some of these don't really come from anywhere because we are not
  // emulating the generation of clock pulses. So there is no source for
  // OCOLOR, ODOT, or TOD; the software will provide those clock
  // signals. (In fact, since we're also not emulating VIC output RF
  // signals, there's no *purpose* for OCOLOR and the only purpose for
  // ODOT is providing it to the expansion port.)
  const φCOLOR = new Trace(U19.φCOLOR)
  const φDOT = new Trace(U19.φIN, CN6.φDOT)
  const φ0 = new Trace(U19.φ0, U7.φ0)
  const φ2 = new Trace(U7.φ2, U1.φ2, U2.φ2, U18.φ2, CN6.φ2)

  return {
    _CAS, _LORAM, _HIRAM, _CHAREN, BA, _AEC, R__W, _EXROM, _GAME, _CASRAM,
    _BASIC, _KERNAL, _CHAROM, _CHAROM2, GR__W, _IO, _ROML, _ROMH, _VIC, _SID,
    _COLOR, _SRAM, _CIAS, _CIA1, _CIA2, _IO1, _IO2, _PLA, _RAS, AEC, _DMA, RDY,
    CAEC, _RES, _NMI, _IRQ, φCOLOR, φDOT, φ0, φ2,
  }
}
