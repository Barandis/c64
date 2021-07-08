// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ACCESS_TYPE_SPR_PTR, CTRL1, DEN, MEMPTR } from 'chips/ic-6567/constants'
import Pin from 'components/pin'
import { assert } from 'test/helper'
import { pinsToValue, range } from 'utils'

const { INPUT } = Pin

const getAddrTraces = tr => [
  tr.A0_A8,
  tr.A1_A9,
  tr.A2_A10,
  tr.A3_A11,
  tr.A4_A12,
  tr.A5_A13,
  tr.A6,
  tr.A7,
  tr.A8,
  tr.A9,
  tr.A10,
  tr.A11,
]

export function addressGen({ chip, writeRegister }) {
  const { clock, memory } = chip

  // Register value puts the video matrix at $0400-$07FF and characters at $1000-$1FFF.
  // The values are not important for this test, but they are the default values in the C64.
  writeRegister(MEMPTR, 0x14)

  clock.update()
  clock.update()
  clock.update()
  clock.update()

  // Assert that the clock pulses so far have put us where we want, at cycle 3, phase 1 of
  // the first raster line.
  assert.equal(clock.raster, 0)
  assert.equal(clock.cycle, 3)
  assert.equal(clock.phase, 1)

  const [type, addr] = memory.generateAddress()

  // This address should represent a sprite data pointer access to $07FC, the location of
  // sprite 4's data pointer when the VM begins at $0400
  assert.equal(type, ACCESS_TYPE_SPR_PTR)
  assert.equal(addr, 0x7fc)
}

export function addressPins({ chip, tr, writeRegister }) {
  const { clock } = chip

  const addrTraces = getAddrTraces(tr)
  let rasChecked = false
  let casChecked = false

  const ras = Pin(1, 'RAS', INPUT)
  const cas = Pin(2, 'CAS', INPUT)
  tr.RAS.addPins(ras)
  tr.CAS.addPins(cas)

  // Register value puts the video matrix at $0400-$07FF and characters at $1000-$1FFF.
  // The values are not important for this test, but they are the default values in the C64.
  writeRegister(MEMPTR, 0x14)
  tr.PHIIN.set().clear().set()

  // Assert that the clock pulses so far have put us where we want, at cycle 2, phase 2 of
  // the first raster line.
  assert.equal(clock.raster, 0)
  assert.equal(clock.cycle, 2)
  assert.equal(clock.phase, 2)

  // In the next phase (cycle 3 phase 1), access should be for the sprite pointer for sprite
  // 4. With the current settings, this will be address $07FC.

  const rasListener = pin => {
    if (pin.low) {
      // The full 12-bit address $07FC. (RAM will only see the lower 8 bits, $FC, while if
      // this was a read of color RAM or character ROM, those would see the full $07FC.)
      assert.equal(pinsToValue(...addrTraces), 0b111_1111_1100)
      rasChecked = true
    }
  }

  const casListener = pin => {
    if (pin.low) {
      // The remnants of the 12-bit address on A6 and higher (hasn't changed since RAS
      // assertion), along with bits 8-13 in the lower 6 bits. The `1011` in bits 8-11 is
      // therefore the same as the `0111` in bits 0-3. In the C64, RAM will only see the
      // lower 6 bits, $07, as bits 6 and 7 will be coming from CIA 1 as VA14 and VA15 and
      // control the 16k bank of memory that the VIC sees.
      //
      // Color RAM and character ROM will still see $07FC because the lowering of RAS also
      // triggers the latch U26 to keep the lower 8 bits on its outputs (which is what color
      // RAM and character ROM actually see) even while the signals behind them change. The
      // upper 4 bits are connected directly to color RAM and character ROM rather than
      // going through the latch, but their values are still the same as they were at RAS
      // assertion.
      assert.equal(pinsToValue(...addrTraces), 0b0111_1100_0111)
      casChecked = true
    }
  }

  ras.addListener(rasListener)
  cas.addListener(casListener)

  // Make the next phase happen, which triggers the assertions in the listeners.
  tr.PHIIN.clear()

  // Assert that the assertions in the listeners have actually run.
  assert.isTrue(rasChecked)
  assert.isTrue(casChecked)
}

export function baBgRegularLine({ chip, tr, writeRegister }) {
  const { clock } = chip

  // Set DEN so that bad lines happen
  writeRegister(CTRL1, 1 << DEN)

  // Move to raster line 49, the first visible regular line
  for (const _ of range(49)) {
    for (const __ of range(65)) {
      tr.PHIIN.set().clear()
    }
  }
  assert.equal(clock.raster, 49)
  assert.equal(clock.cycle, 1)
  assert.equal(clock.phase, 1)

  // BA should be high in every phase of a regular line with no sprites
  for (const _ of range(65)) {
    assert.isHigh(tr.BA, `BA is low in cycle ${clock.cycle} phase ${clock.phase}`)
    tr.PHIIN.set()

    assert.isHigh(tr.BA, `BA is low in cycle ${clock.cycle} phase ${clock.phase}`)
    tr.PHIIN.clear()
  }
}

export function baBgBadLine({ chip, tr, writeRegister }) {
  const { clock } = chip

  // Set DEN so that bad lines happen
  writeRegister(CTRL1, 1 << DEN)

  // Move to raster line 48, the first bad line
  for (const _ of range(48)) {
    for (const __ of range(65)) {
      tr.PHIIN.set().clear()
    }
  }
  assert.equal(clock.raster, 48)
  assert.equal(clock.cycle, 1)
  assert.equal(clock.phase, 1)

  // BA should be high except in cycles 12-54
  for (const _ of range(65)) {
    const expP1 = clock.cycle < 12 || clock.cycle > 54 ? 1 : 0
    assert.level(
      tr.BA,
      expP1,
      `BA is ${expP1 === 1 ? 'low' : 'high'} in cycle ${clock.cycle} phase ${clock.phase}`,
    )
    tr.PHIIN.set()

    const expP2 = clock.cycle < 12 || clock.cycle > 54 ? 1 : 0
    assert.level(
      tr.BA,
      expP2,
      `BA is ${expP2 === 1 ? 'low' : 'high'} in cycle ${clock.cycle} phase ${clock.phase}`,
    )
    tr.PHIIN.clear()
  }
}

export function aecBgRegularLine({ chip, tr, writeRegister }) {
  const { clock } = chip

  // Set DEN so that bad lines happen
  writeRegister(CTRL1, 1 << DEN)

  // Move to raster line 49, the first visible regular line
  for (const _ of range(49)) {
    for (const __ of range(65)) {
      tr.PHIIN.set().clear()
    }
  }
  assert.equal(clock.raster, 49)
  assert.equal(clock.cycle, 1)
  assert.equal(clock.phase, 1)

  // AEC should match the clock on every phase of a regular line with no sprites
  for (const _ of range(65)) {
    assert.isLow(tr.AEC, `AEC is high in cycle ${clock.cycle} phase ${clock.phase}`)
    tr.PHIIN.set()

    assert.isHigh(tr.AEC, `BA is low in cycle ${clock.cycle} phase ${clock.phase}`)
    tr.PHIIN.clear()
  }
}

export function aecBgBadLine({ chip, tr, writeRegister }) {
  const { clock } = chip

  // Set DEN so that bad lines happen
  writeRegister(CTRL1, 1 << DEN)

  // Move to raster line 48, the first bad line
  for (const _ of range(48)) {
    for (const __ of range(65)) {
      tr.PHIIN.set().clear()
    }
  }
  assert.equal(clock.raster, 48)
  assert.equal(clock.cycle, 1)
  assert.equal(clock.phase, 1)

  // AEC should match the clock except in cycles 15-54, where it's always low
  for (const _ of range(65)) {
    assert.isLow(tr.AEC, `AEC is high in cycle ${clock.cycle} phase ${clock.phase}`)
    tr.PHIIN.set()

    const expected = clock.cycle < 15 || clock.cycle > 54 ? 1 : 0
    assert.level(
      tr.AEC,
      expected,
      `AEC is ${expected === 1 ? 'low' : 'high'} in cycle ${clock.cycle} phase ${clock.phase}`,
    )
    tr.PHIIN.clear()
  }
}

export function readSpritePointers({ chip, writeRegister }) {
  const { clock, memory } = chip

  writeRegister(MEMPTR, 0x14)

  // We want to get to cycle 60 to start from sprite 0 just to make things easier. This is
  // 59 cycles of 2 phases from where we are now.
  for (const _ of range(118)) {
    clock.update()
  }
  assert.equal(clock.raster, 0)
  assert.equal(clock.cycle, 60)
  assert.equal(clock.phase, 1)

  for (const num of range(8)) {
    const [type, addr] = memory.generateAddress()
    assert.equal(type, ACCESS_TYPE_SPR_PTR, `Incorrect type: sprite ${num}`)
    assert.equal(addr, 0x7f8 + num, `Incorrect address: sprite ${num}`)

    // clock four times to progress two cycles to the next sprite pointer read
    clock.update()
    clock.update()
    clock.update()
    clock.update()
  }

  assert.equal(clock.raster, 1)
  assert.equal(clock.cycle, 11)
  assert.equal(clock.phase, 1)
}
