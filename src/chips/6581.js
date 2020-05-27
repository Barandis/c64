/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPin, INPUT, OUTPUT, UNCONNECTED } from "components/pin"
import { newChip } from "components/chip"

export function new6581() {
  const chip = newChip(
    // Address pins to access internal registers
    newPin(9, "A0", INPUT),
    newPin(10, "A1", INPUT),
    newPin(11, "A2", INPUT),
    newPin(12, "A3", INPUT),
    newPin(13, "A4", INPUT),

    // Data bus pins D0...D7. These are bidirectional but the direction is set by the R__W pin.
    newPin(15, "D0", INPUT),
    newPin(16, "D1", INPUT),
    newPin(17, "D2", INPUT),
    newPin(18, "D3", INPUT),
    newPin(19, "D4", INPUT),
    newPin(20, "D5", INPUT),
    newPin(21, "D6", INPUT),
    newPin(22, "D7", INPUT),

    // Potentiometer pins. These are analog inputs that are fed to the A/D converters.
    newPin(24, "POTX", INPUT),
    newPin(23, "POTY", INPUT),

    // Audio input and output. These are obviously analog and are mostly given names that have
    // spaces in them such as "AUDIO OUT" and "EXT IN"; since that is more difficult to work with
    // the names here are without spaces.
    newPin(27, "AUDIO", OUTPUT),
    newPin(26, "EXT", INPUT),

    // Clock input. This is typcially called "φ2" but that's difficult to type.
    newPin(6, "O2", INPUT),

    // Read/write control pin. If this is high then data is being read from the SID, else data is
    // being written to it.
    newPin(7, "R__W", INPUT),

    // Chip select pin. If this is high then the data bus is hi-Z stated and no response is made to
    // address pins.
    newPin(8, "_CS", INPUT),

    // Resets the chip when it goes low.
    newPin(5, "_RES", INPUT),

    // Filter capacitor connections. Larger capacitors, necessary for the proper operation of the
    // on-board filters, are connected across these pairs of pins. There is no need to emulate them
    // here.
    newPin(1, "CAP1A", UNCONNECTED),
    newPin(2, "CAP1B", UNCONNECTED),
    newPin(3, "CAP2A", UNCONNECTED),
    newPin(4, "CAP2B", UNCONNECTED),

    // Power supply and ground pins. These are not emulated.
    newPin(25, "VCC", UNCONNECTED),
    newPin(28, "VDD", UNCONNECTED),
    newPin(14, "GND", UNCONNECTED),
  )

  return chip
}
