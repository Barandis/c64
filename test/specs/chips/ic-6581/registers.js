// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  ATDCY1,
  ATDCY2,
  ATDCY3,
  CUTHI,
  CUTLO,
  ENV3,
  FREHI1,
  FREHI2,
  FREHI3,
  FRELO1,
  FRELO2,
  FRELO3,
  POTX,
  POTY,
  PWHI1,
  PWHI2,
  PWHI3,
  PWLO1,
  PWLO2,
  PWLO3,
  RANDOM,
  RESON,
  SIGVOL,
  SUREL1,
  SUREL2,
  SUREL3,
  VCREG1,
  VCREG2,
  VCREG3,
} from 'chips/ic-6581/constants'
import { assert, rand } from 'test/helper'
import { range } from 'utils'

export function writePwRegisters({ chip, writeRegister }) {
  for (const _ of range(16)) {
    const value = rand(256)

    writeRegister(PWLO1, value)
    writeRegister(PWLO2, value)
    writeRegister(PWLO3, value)
    writeRegister(PWHI1, value)
    writeRegister(PWHI2, value)
    writeRegister(PWHI3, value)

    assert.equal(chip.registers.PWLO1, value)
    assert.equal(chip.registers.PWLO2, value)
    assert.equal(chip.registers.PWLO3, value)

    assert.equal(chip.registers.PWHI1, value & 0x0f)
    assert.equal(chip.registers.PWHI2, value & 0x0f)
    assert.equal(chip.registers.PWHI3, value & 0x0f)
  }
}

export function writeFcRegisters({ chip, writeRegister }) {
  for (const _ of range(16)) {
    const value = rand(256)

    writeRegister(CUTLO, value)
    writeRegister(CUTHI, value)

    assert.equal(chip.registers.CUTLO, value & 0x07)
    assert.equal(chip.registers.CUTHI, value)
  }
}

export function writeOtherRegisters({ chip, writeRegister }) {
  for (const _ of range(16)) {
    const value = rand(256)

    const registers = [
      FRELO1,
      FREHI1,
      VCREG1,
      ATDCY1,
      SUREL1,
      FRELO2,
      FREHI2,
      VCREG2,
      ATDCY2,
      SUREL2,
      FRELO3,
      FREHI3,
      VCREG3,
      ATDCY3,
      SUREL3,
      RESON,
      SIGVOL,
    ]

    for (const reg of registers) {
      writeRegister(reg, value)
      assert.equal(chip.registers[reg], value)
    }
  }
}

export function writeReadOnly({ chip, writeRegister }) {
  for (const _ of range(16)) {
    const value = rand(256)
    writeRegister(POTX, value)
    writeRegister(POTY, value)
    writeRegister(RANDOM, value)
    writeRegister(ENV3, value)

    assert.equal(chip.registers.POTX, 0)
    assert.equal(chip.registers.POTY, 0)
    assert.equal(chip.registers.RANDOM, 0)
    assert.equal(chip.registers.ENV3, 0)
  }
}

export function readPotRegisters({ tr, readRegister }) {
  // pot registers are 8 bit, so the top bit of each of these is dropped (hence the
  // `& 0xff` in the assertions)
  const x1 = rand(512)
  const y1 = rand(512)
  const x2 = rand(512)
  const y2 = rand(512)

  tr.POTX.level = x1
  tr.POTY.level = y1

  // initial value doesn't appear in register until 512 clock cycles have passed
  assert.equal(readRegister(POTX), x1 & 0)
  assert.equal(readRegister(POTY), y1 & 0)

  for (const __ of range(512)) {
    tr.PHI2.set().clear()
  }

  // initial value after 512 clock cycles
  assert.equal(readRegister(POTX), x1 & 0xff)
  assert.equal(readRegister(POTY), y1 & 0xff)

  for (const __ of range(256)) {
    tr.PHI2.set().clear()
  }

  tr.POTX.level = x2
  tr.POTY.level = y2

  // remain x1, y1 because pot registers update every 512 cycles
  assert.equal(readRegister(POTX), x1 & 0xff)
  assert.equal(readRegister(POTY), y1 & 0xff)

  for (const __ of range(256)) {
    tr.PHI2.set().clear()
  }

  // 512 more cycles have passed, pot registers update
  assert.equal(readRegister(POTX), x2 & 0xff)
  assert.equal(readRegister(POTY), y2 & 0xff)
}

export function readEnvRegister({ tr, writeRegister, readRegister }) {
  writeRegister(SUREL3, 0xc0) // sustained level will be 0xcc
  writeRegister(VCREG3, 0x11) // gate voice 3 (triangle waveform, but that has no effect on env)
  assert.equal(readRegister(ENV3), 0)

  let current = 0
  while (current < 255) {
    // attack phase, ascending until 255
    tr.PHI2.set().clear()
    const next = readRegister(ENV3)
    assert.isAtLeast(next, current)
    current = next
  }

  while (current > 0xcc) {
    // decay phase, descending above sustain level
    tr.PHI2.set().clear()
    const next = readRegister(ENV3)
    assert.isAtMost(next, current)
    current = next
  }

  for (const _ of range(64)) {
    // sustain phase, at sustain level
    tr.PHI2.set().clear()
    assert.equal(readRegister(ENV3), 0xcc)
  }

  writeRegister(VCREG3, 0x10) // ungate voice 3
  while (current > 0) {
    // release phase, descending above zero
    tr.PHI2.set().clear()
    const next = readRegister(ENV3)
    assert.isAtMost(next, current)
    current = next
  }

  for (const _ of range(64)) {
    // end of release phase, at zero
    tr.PHI2.set().clear()
    assert.equal(readRegister(ENV3), 0)
  }
}

export function readOscRegister({ tr, writeRegister, readRegister }) {
  writeRegister(FREHI3, 0x80) // freq of 0x8000, one wave per 512 CPU cycles
  writeRegister(PWHI3, 0x08) // 50% PW means value change every 256 cycles
  writeRegister(VCREG3, 0x40) // set to pulse waveform

  for (const i of range(255)) {
    tr.PHI2.set().clear()
    assert.equal(readRegister(RANDOM), 0xff, `Incorrect RANDOM value in cycle ${i}`)
  }
  for (const i of range(255)) {
    tr.PHI2.set().clear()
    assert.equal(readRegister(RANDOM), 0x00, `Incorrect RANDOM value in cycle ${i + 255}`)
  }
}

export function readWriteOnly({ tr, writeRegister, readRegister }) {
  const registers = [
    FRELO1,
    FREHI1,
    PWLO1,
    PWHI1,
    VCREG1,
    ATDCY1,
    SUREL1,
    FRELO2,
    FREHI2,
    PWLO2,
    PWHI2,
    VCREG2,
    ATDCY2,
    SUREL2,
    FRELO3,
    FREHI3,
    PWLO3,
    PWHI3,
    VCREG3,
    ATDCY3,
    SUREL3,
    CUTLO,
    CUTHI,
    RESON,
    SIGVOL,
  ]

  for (const reg of registers) {
    assert.equal(readRegister(reg), 0)
  }

  const value = rand(256)
  writeRegister(FRELO1, value)

  for (const reg of registers) {
    // last written value stays on the bus and becomes read result
    assert.equal(readRegister(reg), value)
  }

  for (const _ of range(2000)) {
    tr.PHI2.set().clear()
  }

  for (const reg of registers) {
    // last written value clears after 2000 cycles
    assert.equal(readRegister(reg), 0)
  }
}
