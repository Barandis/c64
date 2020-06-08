// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, rand } from "test/helper"
import {
  CIDDRA, CIDDRB, CIACRA, CIACRB, CIAPRA, CIAPRB,
} from "chips/ic-6526/constants"
import { INPUT, OUTPUT } from "components"
import { bitSet, valueToPins, pinsToValue, range } from "utils"

export function ddrInput({ chip, writeRegister }) {
  writeRegister(CIDDRA, 0)
  for (const i of range(8)) {
    assert(chip[`PA${i}`].mode === INPUT)
  }

  writeRegister(CIDDRB, 0)
  for (const i of range(8)) {
    assert(chip[`PB${i}`].mode === INPUT)
  }
}

export function ddrOutput({ chip, writeRegister }) {
  writeRegister(CIDDRA, 0xff)
  for (const i of range(8)) {
    assert(chip[`PA${i}`].mode === OUTPUT)
  }

  writeRegister(CIDDRB, 0xff)
  for (const i of range(8)) {
    assert(chip[`PB${i}`].mode === OUTPUT)
  }
}

export function ddrCombo({ chip, writeRegister }) {
  const value = rand(256)

  writeRegister(CIDDRA, value)
  for (const i of range(8)) {
    assert(chip[`PA${i}`].mode === (bitSet(value, i) ? OUTPUT : INPUT))
  }

  writeRegister(CIDDRB, value)
  for (const i of range(8)) {
    assert(chip[`PB${i}`].mode === (bitSet(value, i) ? OUTPUT : INPUT))
  }
}

export function ddrTimerOut({ chip, writeRegister }) {
  // turn on PBON for timer A
  writeRegister(CIACRA, 0b00000010)

  // Set DDR for port B to all inputs, bit 6 and should remain output
  writeRegister(CIDDRB, 0)
  for (const i of range(8)) {
    assert(chip[`PB${i}`].mode === (i === 6 ? OUTPUT : INPUT))
  }

  // turn on PBON for timer B
  writeRegister(CIACRB, 0b00000010)

  // Set DDR for port B to all inputs, bits 6 and 7 and should remain
  // outputs
  writeRegister(CIDDRB, 0)
  for (const i of range(8)) {
    assert(chip[`PB${i}`].mode === (i === 6 || i === 7 ? OUTPUT : INPUT))
  }
}

export function pdrReceive(
  { writeRegister, readRegister, paTraces, pbTraces }
) {
  const paValue = rand(256)

  writeRegister(CIDDRA, 0)
  valueToPins(paValue, ...paTraces)
  assert(readRegister(CIAPRA) === paValue)

  const pbValue = rand(256)

  writeRegister(CIDDRB, 0)
  valueToPins(pbValue, ...pbTraces)
  assert(readRegister(CIAPRB) === pbValue)
}

export function pdrSend({ writeRegister, paTraces, pbTraces }) {
  const paValue = rand(256)

  writeRegister(CIDDRA, 0xff)
  writeRegister(CIAPRA, paValue)
  assert(pinsToValue(...paTraces) === paValue)

  const pbValue = rand(256)

  writeRegister(CIDDRB, 0xff)
  writeRegister(CIAPRB, pbValue)
  assert(pinsToValue(...pbTraces) === pbValue)
}

export function pdrCombo({ writeRegister, readRegister, paTraces, pbTraces }) {
  const paMask = rand(256)
  const paIn = rand(256)
  const paOut = rand(256)
  const paExp = paMask & paOut | ~paMask & paIn

  writeRegister(CIDDRA, paMask)
  valueToPins(paIn, ...paTraces)
  writeRegister(CIAPRA, paOut)
  const paReg = readRegister(CIAPRA)
  const paPins = pinsToValue(...paTraces)

  assert(paReg === paExp)
  assert(paPins === paExp)

  const pbMask = rand(256)
  const pbIn = rand(256)
  const pbOut = rand(256)
  const pbExp = pbMask & pbOut | ~pbMask & pbIn

  writeRegister(CIDDRB, pbMask)
  valueToPins(pbIn, ...pbTraces)
  writeRegister(CIAPRB, pbOut)
  const pbReg = readRegister(CIAPRB)
  const pbPins = pinsToValue(...pbTraces)

  assert(pbReg === pbExp)
  assert(pbPins === pbExp)
}

export function pdrTimerOut({ writeRegister, readRegister, pbTraces }) {
  // Set all pins to output, write a 0 on all of them
  writeRegister(CIDDRB, 0xff)
  writeRegister(CIAPRB, 0)

  // Turn on PBON for both timers
  writeRegister(CIACRA, 0b00000010)
  writeRegister(CIACRB, 0b00000010)

  // Write all 1's; PB6 and PB7 shouldn't respond
  writeRegister(CIAPRB, 0b11111111)
  assert(readRegister(CIAPRB) === 0b00111111)
  assert(pinsToValue(...pbTraces) === 0b00111111)
}

export function pdrTriggerPc(
  { tr, readRegister, writeRegister, paTraces, pbTraces }
) {
  // Reading port A does not trigger _PC
  writeRegister(CIDDRA, 0x00)
  valueToPins(0xff, ...paTraces)
  assert(readRegister(CIAPRA) === 0xff)
  assert(tr._PC.high)

  // Writing port A does not trigger _PC
  writeRegister(CIDDRA, 0xff)
  writeRegister(CIAPRA, 0x2f)
  assert(pinsToValue(...paTraces) === 0x2f)
  assert(tr._PC.high)

  // Reading port B does trigger _PC
  writeRegister(CIDDRB, 0x00)
  valueToPins(0xff, ...pbTraces)
  assert(tr._PC.high)
  assert(readRegister(CIAPRB) === 0xff)
  assert(tr._PC.low)

  // _PC resets on the next clock high
  tr.φ2.set()
  assert(tr._PC.high)
  tr.φ2.clear()

  // Writing port B does trigger _PC
  writeRegister(CIDDRB, 0xff)
  assert(tr._PC.high)
  writeRegister(CIAPRB, 0x2f)
  assert(pinsToValue(...pbTraces) === 0x2f)
  assert(tr._PC.low)

  tr.φ2.set()
  assert(tr._PC.high)
  tr.φ2.clear()
}
