/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, OUTPUT, createPinArray } from "components/pin"

export function create6526() {
  const pins = createPinArray(
    // Register select pins. The 6526 has 16 addressable 8-bit registers, which requires four pins.
    createPin(38, "RS0", INPUT),
    createPin(37, "RS1", INPUT),
    createPin(36, "RS2", INPUT),
    createPin(35, "RS3", INPUT),

    // Data bus pins. These are bidirectional but only use one direction at a time.
    createPin(33, "D0", INPUT),
    createPin(32, "D1", INPUT),
    createPin(31, "D2", INPUT),
    createPin(30, "D3", INPUT),
    createPin(29, "D4", INPUT),
    createPin(28, "D5", INPUT),
    createPin(27, "D6", INPUT),
    createPin(26, "D7", INPUT),

    // Parallel Port A pins. These are bidirectional but the direction is switchable via register.
    createPin(2, "PA0", INPUT),
    createPin(3, "PA1", INPUT),
    createPin(4, "PA2", INPUT),
    createPin(5, "PA3", INPUT),
    createPin(6, "PA4", INPUT),
    createPin(7, "PA5", INPUT),
    createPin(8, "PA6", INPUT),
    createPin(9, "PA7", INPUT),

    // Parallel Port B pins. These are bidirectional but the direction is switchable via register.
    createPin(10, "PB0", INPUT),
    createPin(11, "PB1", INPUT),
    createPin(12, "PB2", INPUT),
    createPin(13, "PB3", INPUT),
    createPin(14, "PB4", INPUT),
    createPin(15, "PB5", INPUT),
    createPin(16, "PB6", INPUT),
    createPin(17, "PB7", INPUT),

    // Port control pin. Pulses low after a read or write on port B, can be used for handshaking.
    createPin(18, "_PC", OUTPUT, 1),

    // IRQ input, maskable to fire hardware interrupt. Often used for handshaking.
    createPin(24, "_FLAG", INPUT),

    // Determines whether data is being read from (1) or written to (0) the chip
    createPin(22, "R__W", INPUT),

    // Interrupt request output. Signals an interrupt to the CPU. Interrupts in the 6526 can come
    // from five sources: underflow from timer A, underflow from timer B, the TOD alarm, the serial
    // port being full or empty, and the _FLAG pin. Each of these is maskable. If any of these
    // events occur and the interrupt control register indicates that it's on, this pin will go low.
    createPin(21, "_IRQ", OUTPUT, 1),

    // Serial port. This is bidirectional but the direction is chosen by a control bit.
    createPin(39, "SP", INPUT),

    // Timed control line. This is used in conjunction with the serial port to control timing of the
    // bits of data into the port's shift register. It is bidirectional for that reason, though the
    // direction depends on the operation of the shift register and not directly on a control bit.
    createPin(40, "CNT", INPUT),

    // System clock input. In the 6526 this is expected to be a 1 MHz clock. It's actually typically
    // named "φ2" but that's difficult to type.
    createPin(25, "O2", INPUT),

    // TOD clock input. This can be either 50Hz or 60Hz, selectable from a control register.
    createPin(19, "TOD", INPUT),

    // Chip select pin. When this is low, the chip responds to R/W and register select signals.
    // When it's high, the data pins become hi-Z.
    createPin(23, "_CS", INPUT),

    // Resets the chip on a low signal.
    createPin(34, "_RES", INPUT),

    // Power supply and ground pins. These are not emulated.
    createPin(20, "VCC", INPUT, null),
    createPin(1, "VSS", INPUT, null),
  )

  const cia = {
    pins,
  }

  for (const name in pins) {
    cia[name] = pins[name]
  }

  return cia
}
