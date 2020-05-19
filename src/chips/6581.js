/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { createPin, INPUT, OUTPUT } from "circuits/pin"

export function create6581() {
  const pins = {
    // Address pins to access internal registers
    A0: createPin(9, "A0", INPUT),
    A1: createPin(10, "A1", INPUT),
    A2: createPin(11, "A2", INPUT),
    A3: createPin(12, "A3", INPUT),
    A4: createPin(13, "A4", INPUT),

    // Data bus pins D0...D7. These are bidirectional but the direction is set by the R__W pin.
    D0: createPin(15, "D0", INPUT),
    D1: createPin(16, "D1", INPUT),
    D2: createPin(17, "D2", INPUT),
    D3: createPin(18, "D3", INPUT),
    D4: createPin(19, "D4", INPUT),
    D5: createPin(20, "D5", INPUT),
    D6: createPin(21, "D6", INPUT),
    D7: createPin(22, "D7", INPUT),

    // Potentiometer pins. These are analog inputs that are fed to the A/D converters.
    POTX: createPin(24, "POTX", INPUT),
    POTY: createPin(23, "POTY", INPUT),

    // Audio input and output. These are obviously analog and are mostly given names that have
    // spaces in them such as "AUDIO OUT" and "EXT IN"; since that is more difficult to work with
    // the names here are without spaces.
    AUDIO: createPin(27, "AUDIO", OUTPUT, 0),
    EXT: createPin(26, "EXT", INPUT),

    // Clock input. This is typcially called "φ2" but that's difficult to type.
    O2: createPin(6, "O2", INPUT),

    // Read/write control pin. If this is high then data is being read from the SID, else data is
    // being written to it.
    R__W: createPin(7, "R__W", INPUT),

    // Chip select pin. If this is high then the data bus is hi-Z stated and no response is made to
    // address pins.
    _CS: createPin(8, "_CS", INPUT),

    // Resets the chip when it goes low.
    _RES: createPin(5, "_RES", INPUT),

    // Filter capacitor connections. Larger capacitors, necessary for the proper operation of the
    // on-board filters, are connected across these pairs of pins. There is no need to emulate them
    // here.
    CAP1A: createPin(1, "CAP1A", INPUT, null),
    CAP1B: createPin(2, "CAP1B", INPUT, null),
    CAP2A: createPin(3, "CAP2A", INPUT, null),
    CAP2B: createPin(4, "CAP2B", INPUT, null),

    // Power supply and ground pins. These are not emulated.
    VCC: createPin(25, "VCC", INPUT, null),
    VDD: createPin(28, "VDD", INPUT, null),
    GND: createPin(14, "GND", INPUT, null),
  }

  const sid = {
    pins,
  }

  for (const name in pins) {
    sid[name] = pins[name]
  }

  return sid
}
