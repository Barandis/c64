/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newTrace } from "components/trace"

export function newIoCircuit({ U1, U2, U7, U8, U18, U19, U28 }, { CN1, CN2, CN3, CN4, CN8, CN9 }) {
  // Keyboard/control ports

  // U1: 6526 CIA (connects to keyboard matrix)
  // U18: 6581 SID (receives pot lines)
  // U19: 6567 VIC (receives light pen line)
  // U28: 4066 Quad bilateral switch (switches pot lines on for a portion of the polling cycle)
  // CN1: Keyboard port
  // CN8: Control port 2
  // CN9: Control port 1

  // Lines PB6 and PB7 from the CIA also have timer output functions, which is why they're connected
  // to the bilateral switch controls. This limits the rate at which the potentiometers from the
  // control ports are sampled. These poteniometers are typically game paddles, though they can in
  // theory be other devices based on a variable R/C circuit compatible with what the SID A/D
  // converters expect (this is not normal A/D conversion but is instead based on timing the
  // discharge from an R/C circuit).
  //
  // These are merely the connections between the CIA and ports. The programming of those
  // connections (data direction, polling, etc.) is done by KERNAL ROM routines.
  //
  // The keyboard line from the RESTORE key is already handled in the NMI circuit in 'control.js'.
  // NOTE: All I/O port lines from the CIA are pulled up internally; this is done with the traces
  // here.
  const COL0 = newTrace(U1.PA0, CN1.COL0, CN8.JOYB0).pullUp()
  const COL1 = newTrace(U1.PA1, CN1.COL1, CN8.JOYB1).pullUp()
  const COL2 = newTrace(U1.PA2, CN1.COL2, CN8.JOYB2).pullUp()
  const COL3 = newTrace(U1.PA3, CN1.COL3, CN8.JOYB3).pullUp()
  const COL4 = newTrace(U1.PA4, CN1.COL4, CN8.BTNB).pullUp()
  const COL5 = newTrace(U1.PA5, CN1.COL5).pullUp()
  const COL6 = newTrace(U1.PA6, CN1.COL6, U28.A3, U28.A4).pullUp()
  const COL7 = newTrace(U1.PA7, CN1.COL7, U28.A1, U28.A2).pullUp()
  const ROW0 = newTrace(U1.PB0, CN1.ROW0, CN9.JOYA0).pullUp()
  const ROW1 = newTrace(U1.PB1, CN1.ROW1, CN9.JOYA1).pullUp()
  const ROW2 = newTrace(U1.PB2, CN1.ROW2, CN9.JOYA2).pullUp()
  const ROW3 = newTrace(U1.PB3, CN1.ROW3, CN9.JOYA3).pullUp()
  const ROW4 = newTrace(U1.PB4, CN1.ROW4, CN9.BTNA_LP, U19.LP).pullUp()
  const ROW5 = newTrace(U1.PB5, CN1.ROW5).pullUp()
  const ROW6 = newTrace(U1.PB6, CN1.ROW6).pullUp()
  const ROW7 = newTrace(U1.PB7, CN1.ROW7).pullUp()
  const POTAX = newTrace(U28.Y3, CN9.POTAX)
  const POTAY = newTrace(U28.X4, CN9.POTAY)
  const POTBX = newTrace(U28.X1, CN8.POTBX)
  const POTBY = newTrace(U28.Y2, CN8.POTBY)
  const POTX = newTrace(U28.X3, U28.Y1, U18.POTX)
  const POTY = newTrace(U28.Y4, U28.X2, U18.POTY)

  // Serial/User (parallel) ports

  // U1: 6526 CIA (provides one serial port)
  // U2: 6526 CIA (provides one serial port plus a parallel port)
  // U8: 7406 Hex inverter (inverts active-low lines going to the serial port)
  // CN2: User port
  // CN4: Serial port

  // These are merely the connections between the CIAs and the serial and user ports. Programming
  // of these connections is done through KERNAL ROM routines.
  //
  // The _RESET line from both the user and the serial port has already been handled in the
  // reset/interrupt circuitry in 'control.js'.
  const PA2 = newTrace(U2.PA2, CN2.PA2).pullUp()
  const PB0 = newTrace(U2.PB0, CN2.PB0).pullUp()
  const PB1 = newTrace(U2.PB1, CN2.PB1).pullUp()
  const PB2 = newTrace(U2.PB2, CN2.PB2).pullUp()
  const PB3 = newTrace(U2.PB3, CN2.PB3).pullUp()
  const PB4 = newTrace(U2.PB4, CN2.PB4).pullUp()
  const PB5 = newTrace(U2.PB5, CN2.PB5).pullUp()
  const PB6 = newTrace(U2.PB6, CN2.PB6).pullUp()
  const PB7 = newTrace(U2.PB7, CN2.PB7).pullUp()
  const _PC2 = newTrace(U2._PC, CN2._PC2) // not pulled up on the schematic?
  const _FLAG2 = newTrace(U2._FLAG, CN2._FLAG2).pullUp()
  const SP2 = newTrace(U2.SP, CN2.SP2).pullUp()
  const CNT2 = newTrace(U2.CNT, CN2.CNT2).pullUp()
  const SP1 = newTrace(U1.SP, CN2.SP1).pullUp()
  const CNT1 = newTrace(U1.CNT, CN2.CNT1).pullUp()
  const ATNOUT = newTrace(U2.PA3, U8.A1)
  const CLKOUT = newTrace(U2.PA4, U8.A4)
  const DATAOUT = newTrace(U2.PA5, U8.A2)
  const ATN = newTrace(U8.Y1, CN2.ATN, CN4.ATN).pullUp()
  const CLK = newTrace(U8.Y4, U2.PA6, CN4.CLK).pullUp()
  const DATA = newTrace(U8.Y2, U2.PA7, CN4.DATA).pullUp()
  const _SRQ = newTrace(U1._FLAG, CN4._SRQ).pullUp()

  // Cassette port

  // U7: 6510 CPU (I/O ports interface with cassette)
  // CN3: Cassette port

  _SRQ.addPins(CN3.READ)
  const WRITE = newTrace(U7.P3, CN3.WRITE)
  const SENSE = newTrace(U7.P4, CN3.SENSE).pullUp()
  const MOTOR = newTrace(U7.P5, CN3.MOTOR)

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
    _PC2,
    _FLAG2,
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
    _SRQ,
    WRITE,
    SENSE,
    MOTOR,
  }
}
