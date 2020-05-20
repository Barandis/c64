/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { newPinArray } from "./pin"

export function newChip(...pins) {
  const pinArray = newPinArray(...pins)

  const chip = {
    pins: pinArray,
  }

  for (const name in chip.pins) {
    chip[name] = pinArray[name]
  }

  return chip
}
