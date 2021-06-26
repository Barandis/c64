// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default function Pins(...pins) {
  const array = []

  for (const pin of pins) {
    if (pin) {
      array[pin.number] = pin
      Object.defineProperty(array, pin.name, {
        value: pin,
        writable: false,
      })
    }
  }

  return array
}
