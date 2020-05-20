/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, OUTPUT, createPinArray, UNCONNECTED } from "components/pin"

export function create6581() {
  const pins = createPinArray(
    // Address pins to access internal registers
    createPin(9, "A0", INPUT),
    createPin(10, "A1", INPUT),
    createPin(11, "A2", INPUT),
    createPin(12, "A3", INPUT),
    createPin(13, "A4", INPUT),

    // Data bus pins D0...D7. These are bidirectional but the direction is set by the R__W pin.
    createPin(15, "D0", INPUT),
    createPin(16, "D1", INPUT),
    createPin(17, "D2", INPUT),
    createPin(18, "D3", INPUT),
    createPin(19, "D4", INPUT),
    createPin(20, "D5", INPUT),
    createPin(21, "D6", INPUT),
    createPin(22, "D7", INPUT),

    // Potentiometer pins. These are analog inputs that are fed to the A/D converters.
    createPin(24, "POTX", INPUT),
    createPin(23, "POTY", INPUT),

    // Audio input and output. These are obviously analog and are mostly given names that have
    // spaces in them such as "AUDIO OUT" and "EXT IN"; since that is more difficult to work with
    // the names here are without spaces.
    createPin(27, "AUDIO", OUTPUT, 0),
    createPin(26, "EXT", INPUT),

    // Clock input. This is typcially called "φ2" but that's difficult to type.
    createPin(6, "O2", INPUT),

    // Read/write control pin. If this is high then data is being read from the SID, else data is
    // being written to it.
    createPin(7, "R__W", INPUT),

    // Chip select pin. If this is high then the data bus is hi-Z stated and no response is made to
    // address pins.
    createPin(8, "_CS", INPUT),

    // Resets the chip when it goes low.
    createPin(5, "_RES", INPUT),

    // Filter capacitor connections. Larger capacitors, necessary for the proper operation of the
    // on-board filters, are connected across these pairs of pins. There is no need to emulate them
    // here.
    createPin(1, "CAP1A", UNCONNECTED),
    createPin(2, "CAP1B", UNCONNECTED),
    createPin(3, "CAP2A", UNCONNECTED),
    createPin(4, "CAP2B", UNCONNECTED),

    // Power supply and ground pins. These are not emulated.
    createPin(25, "VCC", UNCONNECTED),
    createPin(28, "VDD", UNCONNECTED),
    createPin(14, "GND", UNCONNECTED),
  )

  const sid = {
    pins,
  }

  for (const name in pins) {
    sid[name] = pins[name]
  }

  return sid
}
