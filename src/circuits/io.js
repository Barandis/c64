// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Trace from 'components/trace'

export default function IoCircuit(
  { U1, U2, U7, U8, U18, U19, U28 },
  { CN1, CN2, CN3, CN4, CN8, CN9 },
) {
  // Keyboard/control ports

  // U1: 6526 CIA (connects to keyboard matrix)
  // U18: 6581 SID (receives pot lines)
  // U19: 6567 VIC (receives light pen line)
  // U28: 4066 Quad bilateral switch (switches pot lines on for a portion of the polling
  //   cycle)
  // CN1: Keyboard port
  // CN8: Control port 2
  // CN9: Control port 1

  // Lines PB6 and PB7 from the CIA also have timer output functions, which is why they're
  // connected to the bilateral switch controls. This limits the rate at which the
  // potentiometers from the control ports are sampled. These poteniometers are typically
  // game paddles, though they can in theory be other devices based on a variable R/C
  // circuit compatible with what the SID A/D converters expect (this is not normal A/D
  // conversion but is instead based on timing the discharge from an R/C circuit).
  //
  // These are merely the connections between the CIA and ports. The programming of those
  // connections (data direction, polling, etc.) is done by KERNAL ROM routines.
  //
  // The keyboard line from the RESTORE key is already handled in the NMI circuit in
  // 'control.js'.
  const COL0 = Trace(U1.PA0, CN1.COL0, CN8.JOYB0)
  const COL1 = Trace(U1.PA1, CN1.COL1, CN8.JOYB1)
  const COL2 = Trace(U1.PA2, CN1.COL2, CN8.JOYB2)
  const COL3 = Trace(U1.PA3, CN1.COL3, CN8.JOYB3)
  const COL4 = Trace(U1.PA4, CN1.COL4, CN8.BTNB)
  const COL5 = Trace(U1.PA5, CN1.COL5)
  const COL6 = Trace(U1.PA6, CN1.COL6, U28.X3, U28.X4)
  const COL7 = Trace(U1.PA7, CN1.COL7, U28.X1, U28.X2)
  const ROW0 = Trace(U1.PB0, CN1.ROW0, CN9.JOYA0)
  const ROW1 = Trace(U1.PB1, CN1.ROW1, CN9.JOYA1)
  const ROW2 = Trace(U1.PB2, CN1.ROW2, CN9.JOYA2)
  const ROW3 = Trace(U1.PB3, CN1.ROW3, CN9.JOYA3)
  const ROW4 = Trace(U1.PB4, CN1.ROW4, CN9.BTNA_LP, U19.LP)
  const ROW5 = Trace(U1.PB5, CN1.ROW5)
  const ROW6 = Trace(U1.PB6, CN1.ROW6)
  const ROW7 = Trace(U1.PB7, CN1.ROW7)
  const POTAX = Trace(U28.B3, CN9.POTAX)
  const POTAY = Trace(U28.A4, CN9.POTAY)
  const POTBX = Trace(U28.A1, CN8.POTBX)
  const POTBY = Trace(U28.B2, CN8.POTBY)
  const POTX = Trace(U28.A3, U28.B1, U18.POTX)
  const POTY = Trace(U28.B4, U28.A2, U18.POTY)

  // Serial/User (parallel) ports

  // U1: 6526 CIA (provides one serial port)
  // U2: 6526 CIA (provides one serial port plus a parallel port)
  // U8: 7406 Hex inverter (inverts active-low lines going to the serial port)
  // CN2: User port
  // CN4: Serial port

  // These are merely the connections between the CIAs and the serial and user ports.
  // Programming of these connections is done through KERNAL ROM routines.
  //
  // The _RESET line from both the user and the serial port has already been handled in the
  // reset/interrupt circuitry in 'control.js'.
  const PA2 = Trace(U2.PA2, CN2.PA2)
  const PB0 = Trace(U2.PB0, CN2.PB0)
  const PB1 = Trace(U2.PB1, CN2.PB1)
  const PB2 = Trace(U2.PB2, CN2.PB2)
  const PB3 = Trace(U2.PB3, CN2.PB3)
  const PB4 = Trace(U2.PB4, CN2.PB4)
  const PB5 = Trace(U2.PB5, CN2.PB5)
  const PB6 = Trace(U2.PB6, CN2.PB6)
  const PB7 = Trace(U2.PB7, CN2.PB7)
  const PPC2 = Trace(U2.PC, CN2.PC2) // not pulled up on the schematic?
  const FFLAG2 = Trace(U2.FLAG, CN2.FLAG2).pullUp()
  const SP2 = Trace(U2.SP, CN2.SP2).pullUp()
  const CNT2 = Trace(U2.CNT, CN2.CNT2).pullUp()
  const SP1 = Trace(U1.SP, CN2.SP1).pullUp()
  const CNT1 = Trace(U1.CNT, CN2.CNT1).pullUp()
  const ATNOUT = Trace(U2.PA3, U8.A1)
  const CLKOUT = Trace(U2.PA4, U8.A4)
  const DATAOUT = Trace(U2.PA5, U8.A2)
  const ATN = Trace(U8.Y1, CN2.ATN, CN4.ATN).pullUp()
  const CLK = Trace(U8.Y4, U2.PA6, CN4.CLK)
  const DATA = Trace(U8.Y2, U2.PA7, CN4.DATA)
  const SSRQ = Trace(U1.FLAG, CN4.SRQ).pullUp()

  // Cassette port

  // U7: 6510 CPU (I/O ports interface with cassette)
  // CN3: Cassette port

  SSRQ.addPins(CN3.READ)
  const WRITE = Trace(U7.P3, CN3.WRITE)
  const SENSE = Trace(U7.P4, CN3.SENSE).pullUp()
  const MOTOR = Trace(U7.P5, CN3.MOTOR)

  return {
    COL0,
    COL1,
    COL2,
    COL3,
    COL4,
    COL5,
    COL6,
    COL7,
    ROW0,
    ROW1,
    ROW2,
    ROW3,
    ROW4,
    ROW5,
    ROW6,
    ROW7,
    POTAX,
    POTAY,
    POTBX,
    POTBY,
    POTX,
    POTY,
    PA2,
    PB0,
    PB1,
    PB2,
    PB3,
    PB4,
    PB5,
    PB6,
    PB7,
    PPC2,
    FFLAG2,
    SP1,
    SP2,
    CNT1,
    CNT2,
    ATN,
    CLK,
    DATA,
    ATNOUT,
    CLKOUT,
    DATAOUT,
    SSRQ,
    WRITE,
    SENSE,
    MOTOR,
  }
}
