// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// A convenience object to attach names to the elements of an 8-bit typed array (all
// registers in the C64 are 8 bits).
export default function Registers(...names) {
  const regs = new Uint8Array(names.length)

  for (const [index, name] of names.entries()) {
    if (name) {
      Object.defineProperty(regs, name, {
        get: () => regs[index],
        set: value => (regs[index] = value),
      })
    }
  }

  return Object.assign(regs, {
    get names() {
      return names
    },
  })
}
