// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { writeFile } from "fs"

import { resolve } from "path"

import { WaveformGenerator } from "chips/ic-6581/waveform"
import { Ic6581 } from "chips/index"
import { deviceTraces } from "test/helper"
import { SAWTOOTH, TRIANGLE, PULSE, NOISE } from "chips/ic-6581/constants"
import { range } from "utils"

function write(path, name, value) {
  const text = `const ${name} = [${value.join(",")}]`
  writeFile(resolve(__dirname, path), text, err => {
    if (err) {
      console.log(err)
      return
    }
    console.log(`Wrote ${path}`)
  })
}

describe.only("6581 SID", () => {
  describe("waveform generator", () => {
    let chip, tr, registers, gen1, gen2, gen3
    function readRegister(index) {
      return registers[index]
    }

    beforeEach(() => {
      chip = Ic6581()
      tr = deviceTraces(chip)
      registers = new Uint8Array(15)

      gen1 = WaveformGenerator(chip, 0, readRegister)
      gen2 = WaveformGenerator(chip, 5, readRegister)
      gen3 = WaveformGenerator(chip, 10, readRegister)

      gen1.sync(gen3)
      gen2.sync(gen1)
      gen3.sync(gen2)

      tr._RES.set()
      tr._CS.set()
      tr.R__W.set()
    })

    it("produces a sawtooth waveform", () => {
      registers[0] = 0xd6
      registers[1] = 0x1c
      registers[4] = 1 << SAWTOOTH

      const values = []

      for (const _ of range(500)) {
        tr.φ2.set()
        values.push(gen1.value)
        tr.φ2.clear()

        for (const _ of range(20)) {
          tr.φ2.set().clear()
        }
      }

      const path = "../../../docs/waveforms/sawtooth.js"
      write(path, "sawtooth", values)
    })

    it("produces a triangle waveform", () => {
      registers[0] = 0xd6
      registers[1] = 0x1c
      registers[4] = 1 << TRIANGLE

      const values = []

      for (const _ of range(500)) {
        tr.φ2.set()
        values.push(gen1.value)
        tr.φ2.clear()

        for (const _ of range(20)) {
          tr.φ2.set().clear()
        }
      }

      const path = "../../../docs/waveforms/triangle.js"
      write(path, "triangle", values)
    })

    it("produces a pulse waveform", () => {
      registers[0] = 0xd6
      registers[1] = 0x1c
      registers[2] = 0x00
      registers[3] = 0x08
      registers[4] = 1 << PULSE

      const values = []

      for (const _ of range(500)) {
        tr.φ2.set()
        values.push(gen1.value)
        tr.φ2.clear()

        for (const _ of range(20)) {
          tr.φ2.set().clear()
        }
      }

      const path = "../../../docs/waveforms/pulse.js"
      write(path, "pulse", values)
    })

    it("produces a noise waveform", () => {
      registers[0] = 0xd6
      registers[1] = 0x1c
      registers[4] = 1 << NOISE

      const values = []

      for (const _ of range(500)) {
        tr.φ2.set()
        values.push(gen1.value)
        tr.φ2.clear()

        for (const _ of range(20)) {
          tr.φ2.set().clear()
        }
      }

      const path = "../../../docs/waveforms/noise.js"
      write(path, "noise", values)
    })
  })
})
