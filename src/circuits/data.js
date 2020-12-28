// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Trace from 'components/trace'

export function DataCircuit(
  {
    U1, U2, U3, U4, U5, U6, U7, U9, U10, U11, U12, U16, U18, U19, U21, U22, U23,
    U24,
  },
  { CN6 },
) {
  // Data bus to processor chips

  // U1: 6526 CIA1
  // U2: 6526 CIA2
  // U7: 6510 CPU
  // U18: 6581 SID
  // U19: 6567 VIC
  const D0 = new Trace(U7.D0, U1.D0, U2.D0, U18.D0, U19.D0)
  const D1 = new Trace(U7.D1, U1.D1, U2.D1, U18.D1, U19.D1)
  const D2 = new Trace(U7.D2, U1.D2, U2.D2, U18.D2, U19.D2)
  const D3 = new Trace(U7.D3, U1.D3, U2.D3, U18.D3, U19.D3)
  const D4 = new Trace(U7.D4, U1.D4, U2.D4, U18.D4, U19.D4)
  const D5 = new Trace(U7.D5, U1.D5, U2.D5, U18.D5, U19.D5)
  const D6 = new Trace(U7.D6, U1.D6, U2.D6, U18.D6, U19.D6)
  const D7 = new Trace(U7.D7, U1.D7, U2.D7, U18.D7, U19.D7)

  // Data bus to memory

  // U3: 2364 8k x 8 ROM (BASIC)
  // U4: 2364 8k x 8 ROM (KERNAL)
  // U5: 2332 4k x 8 ROM (CHAROM)
  // U9: 4164 64k x 1-bit dynamic RAM (bit 1)
  // U10: 4164 64k x 1-bit dynamic RAM (bit 3)
  // U11: 4164 64k x 1-bit dynamic RAM (bit 5)
  // U12: 4164 64k x 1-bit dynamic RAM (bit 7)
  // U21: 4164 64k x 1-bit dynamic RAM (bit 0)
  // U22: 4164 64k x 1-bit dynamic RAM (bit 2)
  // U23: 4164 64k x 1-bit dynamic RAM (bit 4)
  // U24: 4164 64k x 1-bit dynamic RAM (bit 6)

  // U9...U12 and U21...U24 have two unidirectional data pins each, one
  // in and one out. For this purpose they're simply tied together.
  D0.addPins(U3.D0, U4.D0, U5.D0, U21.D, U21.Q)
  D1.addPins(U3.D1, U4.D1, U5.D1, U9.D, U9.Q)
  D2.addPins(U3.D2, U4.D2, U5.D2, U22.D, U22.Q)
  D3.addPins(U3.D3, U4.D3, U5.D3, U10.D, U10.Q)
  D4.addPins(U3.D4, U4.D4, U5.D4, U23.D, U23.Q)
  D5.addPins(U3.D5, U4.D5, U5.D5, U11.D, U11.Q)
  D6.addPins(U3.D6, U4.D6, U5.D6, U24.D, U24.Q)
  D7.addPins(U3.D7, U4.D7, U5.D7, U12.D, U12.Q)

  // Data bus to color RAM

  // U6: 2114 1k x 4-bit static RAM (color RAM)
  // U16: 4066 Quad bilateral switch (connects/disconnects D0...D3 and
  //      color RAM)
  // U19: 6567 VIC (source of D8...D11)

  // Once again, the VIC complicates things, though far less so than
  // with the address bus. The VIC has 12 data pins, and the upper four
  // are used exclusively to read from color RAM. The CPU can also see
  // color RAM and in fact is the only device that can write to it.
  //
  // The CPU reads and writes color RAM through D0...D3, as expected.
  // However, when the VIC reads color RAM, it does it through D8...D11
  // and may in fact do that at the same time as it reads other data via
  // D0...D7. To keep color data from polluting D0...D7 at that time,
  // the connection that the CPU needs to send data to color RAM on
  // D0...D3 needs to be severed. That's the purpose of switch U16.
  D0.addPins(U16.A4)
  D1.addPins(U16.A3)
  D2.addPins(U16.A2)
  D3.addPins(U16.A1)
  const D8 = new Trace(U19.D8, U6.D0, U16.B4)
  const D9 = new Trace(U19.D9, U6.D1, U16.B3)
  const D10 = new Trace(U19.D10, U6.D2, U16.B2)
  const D11 = new Trace(U19.D11, U6.D3, U16.B1)

  // Data bus to expansion port

  // CN6: Expansion port
  D0.addPins(CN6.D0)
  D1.addPins(CN6.D1)
  D2.addPins(CN6.D2)
  D3.addPins(CN6.D3)
  D4.addPins(CN6.D4)
  D5.addPins(CN6.D5)
  D6.addPins(CN6.D6)
  D7.addPins(CN6.D7)

  return { D0, D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11 }
}
