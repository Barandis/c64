// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  BORDER,
  CTRL1,
  CTRL2,
  IE,
  IR,
  MEMPTR,
  MOBDAT,
  MOBMOB,
  RASTER,
  UNUSED1,
  UNUSED17,
} from 'chips/ic-6567/constants'
import { assert, rand } from 'test/helper'
import { range } from 'utils'

// Read from every register that uses all 8 bits
export function readRegular({ chip, readRegister }) {
  for (const i of range(BORDER)) {
    if (![CTRL2, MEMPTR, IR, IE, MOBMOB, MOBDAT].includes(i)) {
      const value = rand(256)
      chip.registers[i] = value
      assert.equal(readRegister(i), value)
    }
  }
}

// Write to every register that uses all 8 bits. This excludes RASTER and CTRL1 because
// their writes are commited to a latch and do not affect the registers themselves.
export function writeRegular({ chip, writeRegister }) {
  for (const i of range(BORDER)) {
    if (![RASTER, CTRL1, CTRL2, MEMPTR, IR, IE, MOBMOB, MOBDAT].includes(i)) {
      const value = rand(256)
      writeRegister(i, value)
      assert.equal(chip.registers[i], value)
    }
  }
}

// Read from every register that uses only the bottom four bits
export function readBottomFour({ chip, readRegister }) {
  for (const i of [IE, ...range(BORDER, UNUSED1)]) {
    const value = rand(256)
    chip.registers[i] = value
    assert.equal(readRegister(i), value | 0b11110000)
  }
}

// Write to every register that uses only the bottom four bits
export function writeBottomFour({ chip, writeRegister }) {
  for (const i of [IE, ...range(BORDER, UNUSED1)]) {
    const value = rand(256)
    writeRegister(i, value)
    assert.equal(chip.registers[i], value | 0b11110000)
  }
}

// Read from Control Register 2, which uses only the bottom six bits
export function readCtrl2({ chip, readRegister }) {
  for (const _ of range(8)) {
    const value = rand(256)
    chip.registers.CTRL2 = value
    assert.equal(readRegister(CTRL2), value | 0b11000000)
  }
}

// Write to Control Register 2, which uses only the bottom six bits
export function writeCtrl2({ chip, writeRegister }) {
  for (const _ of range(8)) {
    const value = rand(256)
    writeRegister(CTRL2, value)
    assert.equal(chip.registers.CTRL2, value | 0b11000000)
  }
}

// Read from Interrupt  Register, which does not use bits 4, 5, 6
export function readIr({ chip, readRegister }) {
  for (const _ of range(8)) {
    const value = rand(256)
    chip.registers.IR = value
    assert.equal(readRegister(IR), value | 0b01110000)
  }
}

// Write to Interrupt Register, which does not use bits 4, 5, 6
export function writeIr({ chip, writeRegister }) {
  for (const _ of range(8)) {
    const value = rand(256)
    writeRegister(IR, value)
    assert.equal(chip.registers.IR, value | 0b01110000)
  }
}

// Read and write from unused registers, which don't actually exist in chip.registers and
// so which need reads and writes tested together
export function readWriteUnused({ readRegister, writeRegister }) {
  for (const i of range(UNUSED1, UNUSED17, true)) {
    const value = rand(256)
    writeRegister(i, value)
    assert.equal(readRegister(i), 0xff)
  }
}

// Read from collision registers, which reset upon read
export function readCollision({ chip, readRegister }) {
  for (const _ of range(8)) {
    const value = rand(256)
    chip.registers.MOBMOB = value
    chip.registers.MOBDAT = value
    assert.equal(readRegister(MOBMOB), value)
    assert.equal(chip.registers.MOBMOB, 0)
    assert.equal(readRegister(MOBDAT), value)
    assert.equal(chip.registers.MOBDAT, 0)
  }
}

// Write to collision registers, which does nothing (they aren't writable)
export function writeCollision({ chip, writeRegister }) {
  for (const _ of range(8)) {
    const value = rand(256)
    writeRegister(MOBMOB, value)
    writeRegister(MOBDAT, value)
    assert.equal(chip.registers.MOBMOB, 0)
    assert.equal(chip.registers.MOBDAT, 0)
  }
}

// Write to the RASTER register. This has no effect because the value is written to the
// raster latch instead. We don't have access to the raster latch, but that can be tested
// separately by testing interrupts (happens in clock.js).
export function writeRaster({ chip, writeRegister }) {
  for (const _ of range(8)) {
    const value = rand(256)
    writeRegister(RASTER, value)
    assert.equal(chip.registers.RASTER, 0)
  }
}

// Write to the CTRL1 register. The bottom 7 bits are written normally, but the MSB is
// written to the raster latch instead.
export function writeCtrl1({ chip, writeRegister }) {
  for (const _ of range(8)) {
    const value = rand(256)
    writeRegister(CTRL1, value)
    assert.equal(chip.registers.CTRL1, value & 0x7f)
  }
}
