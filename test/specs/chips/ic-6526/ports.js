// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { assert, rand } from 'test/helper'
import { DDRA, DDRB, CRA, CRB, PRA, PRB } from 'chips/ic-6526/constants'
import Pin from 'components/pin'
import { bitSet, valueToPins, pinsToValue, range } from 'utils'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT

export function ddrInput({ chip, writeRegister }) {
  writeRegister(DDRA, 0)
  for (const i of range(8)) {
    assert(chip[`PA${i}`].mode === INPUT)
  }

  writeRegister(DDRB, 0)
  for (const i of range(8)) {
    assert(chip[`PB${i}`].mode === INPUT)
  }
}

export function ddrOutput({ chip, writeRegister }) {
  writeRegister(DDRA, 0xff)
  for (const i of range(8)) {
    assert(chip[`PA${i}`].mode === OUTPUT)
  }

  writeRegister(DDRB, 0xff)
  for (const i of range(8)) {
    assert(chip[`PB${i}`].mode === OUTPUT)
  }
}

export function ddrCombo({ chip, writeRegister }) {
  const value = rand(256)

  writeRegister(DDRA, value)
  for (const i of range(8)) {
    assert(chip[`PA${i}`].mode === (bitSet(value, i) ? OUTPUT : INPUT))
  }

  writeRegister(DDRB, value)
  for (const i of range(8)) {
    assert(chip[`PB${i}`].mode === (bitSet(value, i) ? OUTPUT : INPUT))
  }
}

export function ddrTimerOut({ chip, writeRegister }) {
  // turn on PBON for timer A
  writeRegister(CRA, 0b00000010)

  // Set DDR for port B to all inputs, bit 6 and should remain output
  writeRegister(DDRB, 0)
  for (const i of range(8)) {
    assert(chip[`PB${i}`].mode === (i === 6 ? OUTPUT : INPUT))
  }

  // turn on PBON for timer B
  writeRegister(CRB, 0b00000010)

  // Set DDR for port B to all inputs, bits 6 and 7 and should remain
  // outputs
  writeRegister(DDRB, 0)
  for (const i of range(8)) {
    assert(chip[`PB${i}`].mode === (i === 6 || i === 7 ? OUTPUT : INPUT))
  }
}

export function pdrReceive({ writeRegister, readRegister, paTraces, pbTraces }) {
  const paValue = rand(256)

  writeRegister(DDRA, 0)
  valueToPins(paValue, ...paTraces)
  assert(readRegister(PRA) === paValue)

  const pbValue = rand(256)

  writeRegister(DDRB, 0)
  valueToPins(pbValue, ...pbTraces)
  assert(readRegister(PRB) === pbValue)
}

export function pdrSend({ writeRegister, paTraces, pbTraces }) {
  const paValue = rand(256)

  writeRegister(DDRA, 0xff)
  writeRegister(PRA, paValue)
  assert(pinsToValue(...paTraces) === paValue)

  const pbValue = rand(256)

  writeRegister(DDRB, 0xff)
  writeRegister(PRB, pbValue)
  assert(pinsToValue(...pbTraces) === pbValue)
}

export function pdrCombo({ writeRegister, readRegister, paTraces, pbTraces }) {
  const paMask = rand(256)
  const paIn = rand(256)
  const paOut = rand(256)
  const paExp = (paMask & paOut) | (~paMask & paIn)

  writeRegister(DDRA, paMask)
  valueToPins(paIn, ...paTraces)
  writeRegister(PRA, paOut)
  const paReg = readRegister(PRA)
  const paPins = pinsToValue(...paTraces)

  assert(paReg === paExp)
  assert(paPins === paExp)

  const pbMask = rand(256)
  const pbIn = rand(256)
  const pbOut = rand(256)
  const pbExp = (pbMask & pbOut) | (~pbMask & pbIn)

  writeRegister(DDRB, pbMask)
  valueToPins(pbIn, ...pbTraces)
  writeRegister(PRB, pbOut)
  const pbReg = readRegister(PRB)
  const pbPins = pinsToValue(...pbTraces)

  assert(pbReg === pbExp)
  assert(pbPins === pbExp)
}

export function pdrTimerOut({ writeRegister, readRegister, pbTraces }) {
  // Set all pins to output, write a 0 on all of them
  writeRegister(DDRB, 0xff)
  writeRegister(PRB, 0)

  // Turn on PBON for both timers
  writeRegister(CRA, 0b00000010)
  writeRegister(CRB, 0b00000010)

  // Write all 1's; PB6 and PB7 shouldn't respond
  writeRegister(PRB, 0b11111111)
  assert(readRegister(PRB) === 0b00111111)
  assert(pinsToValue(...pbTraces) === 0b00111111)
}

export function pdrTriggerPc({ tr, readRegister, writeRegister, paTraces, pbTraces }) {
  // Reading port A does not trigger _PC
  writeRegister(DDRA, 0x00)
  valueToPins(0xff, ...paTraces)
  assert(readRegister(PRA) === 0xff)
  assert(tr._PC.high)

  // Writing port A does not trigger _PC
  writeRegister(DDRA, 0xff)
  writeRegister(PRA, 0x2f)
  assert(pinsToValue(...paTraces) === 0x2f)
  assert(tr._PC.high)

  // Reading port B does trigger _PC
  writeRegister(DDRB, 0x00)
  valueToPins(0xff, ...pbTraces)
  assert(tr._PC.high)
  assert(readRegister(PRB) === 0xff)
  assert(tr._PC.low)

  // _PC resets on the next clock high
  tr.φ2.set()
  assert(tr._PC.high)
  tr.φ2.clear()

  // Writing port B does trigger _PC
  writeRegister(DDRB, 0xff)
  assert(tr._PC.high)
  writeRegister(PRB, 0x2f)
  assert(pinsToValue(...pbTraces) === 0x2f)
  assert(tr._PC.low)

  tr.φ2.set()
  assert(tr._PC.high)
  tr.φ2.clear()
}
