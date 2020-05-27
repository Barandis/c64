// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect, rand } from "test/helper"
import { CIDDRA, CIDDRB, CIACRA, CIACRB, CIAPRA, CIAPRB } from "chips/6526/constants"
import { INPUT, OUTPUT } from "components/pin"
import { bitSet, valueToPins, pinsToValue } from "utils"

export function ddrInput({ chip, writeRegister }) {
  writeRegister(CIDDRA, 0)
  for (let i = 0; i < 8; i++) {
    expect(chip[`PA${i}`].mode).to.equal(INPUT)
  }

  writeRegister(CIDDRB, 0)
  for (let i = 0; i < 8; i++) {
    expect(chip[`PB${i}`].mode).to.equal(INPUT)
  }
}

export function ddrOutput({ chip, writeRegister }) {
  writeRegister(CIDDRA, 0xff)
  for (let i = 0; i < 8; i++) {
    expect(chip[`PA${i}`].mode).to.equal(OUTPUT)
  }

  writeRegister(CIDDRB, 0xff)
  for (let i = 0; i < 8; i++) {
    expect(chip[`PB${i}`].mode).to.equal(OUTPUT)
  }
}

export function ddrCombo({ chip, writeRegister }) {
  const value = rand(256)

  writeRegister(CIDDRA, value)
  for (let i = 0; i < 8; i++) {
    expect(chip[`PA${i}`].mode).to.equal(bitSet(value, i) ? OUTPUT : INPUT)
  }

  writeRegister(CIDDRB, value)
  for (let i = 0; i < 8; i++) {
    expect(chip[`PB${i}`].mode).to.equal(bitSet(value, i) ? OUTPUT : INPUT)
  }
}

export function ddrTimerOut({ chip, writeRegister }) {
  // turn on PBON for timer A
  writeRegister(CIACRA, 0b00000010)

  // Set DDR for port B to all inputs, bit 6 and should remain output
  writeRegister(CIDDRB, 0)
  for (let i = 0; i < 8; i++) {
    expect(chip[`PB${i}`].mode).to.equal(i === 6 ? OUTPUT : INPUT)
  }

  // turn on PBON for timer B
  writeRegister(CIACRB, 0b00000010)

  // Set DDR for port B to all inputs, bits 6 and 7 and should remain outputs
  writeRegister(CIDDRB, 0)
  for (let i = 0; i < 8; i++) {
    expect(chip[`PB${i}`].mode).to.equal(i === 6 || i === 7 ? OUTPUT : INPUT)
  }
}

export function pdrReceive({ writeRegister, readRegister, paTraces, pbTraces }) {
  const paValue = rand(256)

  writeRegister(CIDDRA, 0)
  valueToPins(paValue, ...paTraces)
  expect(readRegister(CIAPRA)).to.equal(paValue)

  const pbValue = rand(256)

  writeRegister(CIDDRB, 0)
  valueToPins(pbValue, ...pbTraces)
  expect(readRegister(CIAPRB)).to.equal(pbValue)
}

export function pdrSend({ writeRegister, paTraces, pbTraces }) {
  const paValue = rand(256)

  writeRegister(CIDDRA, 0xff)
  writeRegister(CIAPRA, paValue)
  expect(pinsToValue(...paTraces)).to.equal(paValue)

  const pbValue = rand(256)

  writeRegister(CIDDRB, 0xff)
  writeRegister(CIAPRB, pbValue)
  expect(pinsToValue(...pbTraces)).to.equal(pbValue)
}