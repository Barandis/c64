// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Trace from 'components/trace'

export default function ControlCircuit(
  {
    U1,
    U2,
    U3,
    U4,
    U5,
    U6,
    U7,
    U8,
    U9,
    U10,
    U11,
    U12,
    U13,
    U14,
    U15,
    U16,
    U17,
    U18,
    U19,
    U21,
    U22,
    U23,
    U24,
    U25,
    U26,
    U27,
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

  // This is essentially everything into and out of the PLA and its associated
  // demultiplexer, which uses programmed logic to take 20 inputs and determine which
  // addressable chips/expansion port pins should be enabled. A8...A11 are connected to U15
  // and A12...A15, VA12...VA13, and _VA14 are already connected U17 in the address bus
  // definitions.
  const CCAS = Trace(U19.CAS, U17.I0)
  const LLORAM = Trace(U7.P0, U17.I1).pullUp()
  const HHIRAM = Trace(U7.P1, U17.I2).pullUp()
  const CCHAREN = Trace(U7.P2, U17.I3).pullUp()
  const BA = Trace(U19.BA, U17.I9)
  const AAEC = Trace(U8.Y5, U17.I10)
  const R_W = Trace(U7.R_W, U17.I11).pullUp()
  const EXROM = Trace(CN6.EXROM, U17.I12).pullUp()
  const GAME = Trace(CN6.GAME, U17.I13).pullUp()
  const CASRAM = Trace(
    U17.F0,
    U9.CAS,
    U10.CAS,
    U11.CAS,
    U12.CAS,
    U21.CAS,
    U22.CAS,
    U23.CAS,
    U24.CAS,
  )
  const BBASIC = Trace(U17.F1, U3.CS)
  const KKERNAL = Trace(U17.F2, U4.CS)
  const CCHAROM = Trace(U17.F3, U5.CS1)
  const CCHAROM2 = Trace(U5.CS2).pullUp() // _CS2 always high
  const GR_W = Trace(U17.F4, U6.WE)
  const IIO = Trace(U17.F5, U15.G1)
  const RROML = Trace(U17.F6, CN6.ROML)
  const RROMH = Trace(U17.F7, CN6.ROMH)
  const VVIC = Trace(U15.Y10, U19.CS)
  const SSID = Trace(U15.Y11, U18.CS)
  const CCOLOR = Trace(U15.Y12, U27.A3)
  const SSRAM = Trace(U27.Y3, U6.CS)
  const CCIAS = Trace(U15.Y13, U15.G2)
  const CCIA1 = Trace(U15.Y20, U1.CS)
  const CCIA2 = Trace(U15.Y21, U2.CS)
  const IIO1 = Trace(U15.Y22, CN6.IO1)
  const IIO2 = Trace(U15.Y23, CN6.IO2)
  const PPLA = Trace(U17.OE).pullDown() // PLA out always enabled

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
  // U27: 74LS08 Quad AND gate (combines AEC, BA, _DMA into CAEC, RDY, SRAM _CS)
  // CN6: Expansion port (source of _DMA)

  // Non-PLA signals are done here just in the interest of complexity. The only difference
  // in criteria for this section is that the PLA is not involved in any of these signals.
  CCAS.addPins(U14.SEL, U13.SEL, U25.SEL)
  BA.addPins(U27.A1, CN6.BA)
  AAEC.addPins(U13.OE, U25.OE)
  R_W.addPins(U1.R_W, U2.R_W, U18.R_W, U19.R_W, CN6.R_W)
  R_W.addPins(U9.WE, U10.WE, U11.WE, U12.WE)
  R_W.addPins(U21.WE, U22.WE, U23.WE, U24.WE)
  const RRAS = Trace(U19.RAS, U26.LE, U9.RAS, U10.RAS, U11.RAS, U12.RAS, U21.RAS, U22.RAS, U23.RAS)
  const AEC = Trace(U19.AEC, U16.X1, U16.X2, U16.X3, U16.X4, U27.B3, U26.OE, U14.OE, U8.A5, U27.A2)
  const DDMA = Trace(CN6.DMA, U27.B1, U27.B2).pullUp()
  const RDY = Trace(U27.Y1, U7.RDY)
  const CAEC = Trace(U27.Y2, U7.AEC)

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
  const RRES = Trace(CN2.RESET, CN4.RESET, U7.RES, U1.RES, U2.RES, U18.RES, CN6.RESET).pullUp()
  const NNMI = Trace(U2.IRQ, CN1.RESTORE, CN6.NMI, U7.NMI).pullUp()
  const IIRQ = Trace(U1.IRQ, U19.IRQ, CN6.IRQ, U7.IRQ).pullUp()

  // Clocks

  // U1: 6526 CIA (receives φ2, TOD)
  // U2: 6526 CIA (receives φ2, TOD)
  // U7: 6510 CPU (receives φ0, provides φ2)
  // U18: 6581 SID (receives φ2)
  // U19: 6567 VIC (receives φDOT, φCOLOR, provides φ0)
  // CN6: Expansion port (receives φDOT, φ2)

  // Some of these don't really come from anywhere because we are not emulating the
  // generation of clock pulses. So there is no source for OCOLOR, ODOT, or TOD; the
  // software will provide those clock signals. (In fact, since we're also not emulating VIC
  // output RF signals, there's no *purpose* for OCOLOR and the only purpose for ODOT is
  // providing it to the expansion port.)
  const PHICOLOR = new Trace(U19.PHICOLOR)
  const PHIDOT = new Trace(U19.PHIIN, CN6.PHIDOT)
  const PHI0 = new Trace(U19.PHI0, U7.PHI0)
  const PHI2 = new Trace(U7.PHI2, U1.PHI2, U2.PHI2, U18.PHI2, CN6.PHI2)

  return {
    CCAS,
    LLORAM,
    HHIRAM,
    CCHAREN,
    BA,
    AAEC,
    R_W,
    EXROM,
    GAME,
    CASRAM,
    BBASIC,
    KKERNAL,
    CCHAROM,
    CCHAROM2,
    GR_W,
    IIO,
    RROML,
    RROMH,
    VVIC,
    SSID,
    CCOLOR,
    SSRAM,
    CCIAS,
    CCIA1,
    CCIA2,
    IIO1,
    IIO2,
    PPLA,
    RRAS,
    AEC,
    DDMA,
    RDY,
    CAEC,
    RRES,
    NNMI,
    IIRQ,
    PHICOLOR,
    PHIDOT,
    PHI0,
    PHI2,
  }
}
