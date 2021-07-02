// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import ClockModule from 'chips/ic-6567/clock'
import { CTRL1, DEN, ERST, IE, IR, RASTER, RST8 } from 'chips/ic-6567/constants'
import Pin from 'components/pin'
import { assert } from 'test/helper'
import { bitSet, bitValue, hex, range, setBit } from 'utils'

// Test that on each clock in transition, the clock out also transitions. On each of these
// transitions, RAS and CAS should also transition to low (they transition back high on the
// beginning of the next clock in pulse, which is irrelevant and isn't tested)
export function activationOrder({ tr }) {
  let order = 0

  const phi0 = Pin(1, 'PHI0', Pin.INPUT)
  const ras = Pin(2, 'RAS', Pin.INPUT)
  const cas = Pin(3, 'CAS', Pin.INPUT)

  phi0.addListener(() => {
    order += 1
    assert.equal(order, 1)
  })
  ras.addListener(pin => {
    if (pin.low) {
      order += 1
      assert.equal(order, 2)
    }
  })
  cas.addListener(pin => {
    if (pin.low) {
      order += 1
      assert.equal(order, 3)
    }
  })

  tr.PHI0.addPins(phi0)
  tr.RAS.addPins(ras)
  tr.CAS.addPins(cas)

  assert.isLow(phi0, 'initial value of PHI0')
  assert.isHigh(ras, 'initial value of RAS')
  assert.isHigh(cas, 'initial value of CAS')

  tr.PHIIN.set()

  assert.isHigh(phi0, 'PHI0 after PHIIN transition to high')
  assert.isLow(ras, 'RAS after PHIIN transition to high')
  assert.isLow(cas, 'CAS after PHIIN transition to high')
  assert.equal(order, 3, 'all three pin listeners should be called')

  order = 0

  tr.PHIIN.clear()

  assert.isLow(phi0, 'PHI0 after PHIIN transition to low')
  assert.isLow(ras, 'RAS after PHIIN transition to low')
  assert.isLow(cas, 'CAS after PHIIN transition to low')
  assert.equal(order, 3, 'all three pin listeners should be called')
}

// Phase moves back and forth between 1 and 2 with every clock transition
export function phase({ chip }) {
  const clock = ClockModule(chip.pins, chip.registers)

  assert.equal(clock.phase, 1)
  clock.update()
  assert.equal(clock.phase, 2)
  clock.update()
  assert.equal(clock.phase, 1)
}

// Cycle increments every *other* clock pulse, returning to 1 after reaching 65.
export function cycle({ chip }) {
  const clock = ClockModule(chip.pins, chip.registers)

  for (const i of range(1, 65, true)) {
    assert.equal(clock.cycle, i)
    clock.update()
    assert.equal(clock.cycle, i)
    clock.update()
  }
  assert.equal(clock.cycle, 1)
}

// Raster increments every 130 clock pulses (each time cycle returns to 0), returning to 0
// after reaching 262. The contents of the raster registers also changes accordingly.
export function raster({ chip }) {
  const clock = ClockModule(chip.pins, chip.registers)

  for (const i of range(263)) {
    assert.equal(clock.raster, i, 'internal raster number incorrect')
    const regRaster = chip.registers.RASTER + (bitValue(chip.registers.CTRL1, RST8) << 8)
    assert.equal(regRaster, i, 'raster registers incorrect')
    for (const _ of range(1, 65, true)) {
      clock.update()
      clock.update()
    }
  }
  assert.equal(clock.raster, 0)
}

// Test that bad lines are indicated where they're supposed to be, with no y-scroll and with
// the DEN bit of CTRL1 set. This is "normal" operation.
export function badLineNormal({ chip }) {
  const clock = ClockModule(chip.pins, chip.registers)
  chip.registers.CTRL1 = setBit(chip.registers.CTRL1, DEN)

  for (const i of range(263)) {
    assert.equal(
      clock.badLine,
      clock.raster >= 0x30 && clock.raster <= 0xf7 && (clock.raster & 0x07) === 0,
      `raster line $${hex(i)}`,
    )
    for (const _ of range(1, 65, true)) {
      clock.update()
      clock.update()
    }
  }
}

// Test that there are no bad lines at all of DEN is cleared
export function badLineDenOff({ chip }) {
  const clock = ClockModule(chip.pins, chip.registers)

  // DEN is 0 by default, so doing nothing means it's cleared
  for (const i of range(263)) {
    assert.isFalse(clock.badLine, `raster line $${hex(i)}`)
    for (const _ of range(1, 65, true)) {
      clock.update()
      clock.update()
    }
  }
}

export function badLineScroll({ chip }) {
  const clock = ClockModule(chip.pins, chip.registers)
  chip.registers.CTRL1 = setBit(chip.registers.CTRL1, DEN)

  for (const y of range(8)) {
    for (const i of range(263)) {
      assert.equal(
        clock.badLine,
        clock.raster >= 0x30 && clock.raster <= 0xf7 && (clock.raster & 0x07) === 0,
        `raster line $${hex(i)}, y-scroll $${hex(y)}`,
      )
      for (const _ of range(1, 65, true)) {
        clock.update()
        clock.update()
      }
    }
  }
}

// Tests the raster interrupt. This should fire at the moment the configured line is
// reached, and then not again until the next time the configured line is reached. Clearing
// the interrupt register should reset the IRQ pin.
export function rasterIrq({ chip, tr, writeRegister, readRegister }) {
  // Set raster interrupt line to 0x2f
  writeRegister(RASTER, 0x2f)
  // Enable the raster interrupt
  writeRegister(IE, 1 << ERST)
  // Loop until the IRQ pin goes low, which should be at raster line 0x2f
  while (chip.pins.IRQ.floating) {
    tr.PHIIN.set().clear()
  }

  // On raster line 0x2f, RASTER reads 0x2f and the RST8 bit of CTRL1 is cleared
  assert.equal(readRegister(RASTER), 0x2f)
  assert.isFalse(bitSet(CTRL1, RST8))
  assert.equal(readRegister(IR), 0b11110001)

  // Clear the interrupt register, this also clears the IRQ pin
  writeRegister(IR, 0)
  assert.isFloating(chip.pins.IRQ)

  tr.PHIIN.set().clear()
  // On the next cycle, the raster line should be the same, but the interrupt should NOT
  // have fired again
  assert.equal(readRegister(RASTER), 0x2f)
  assert.isFloating(chip.pins.IRQ)

  // Sets the MSB of the raster latch (RST8) along with the regular RASTER reguster. The
  // raster latch should now contain 0x101 (257)).
  writeRegister(RASTER, 0x01)
  writeRegister(CTRL1, 0x80)
  // Loop until the IRQ pin goes low, which should be at raster line 0x12f
  while (chip.pins.IRQ.floating) {
    tr.PHIIN.set().clear()
  }

  // On raster line 0x101, RASTER reads 0x01 and the RST8 bit of CTRL1 is set
  assert.equal(readRegister(RASTER), 0x01)
  assert.isTrue(bitSet(chip.registers.CTRL1, RST8))
  assert.equal(readRegister(IR), 0b11110001)
}

// Test that no interrupts are fired if the raster interrupt is not enabled
export function rasterIrqDisabled({ chip, tr, writeRegister }) {
  // Set raster interrupt line to 0x2f
  writeRegister(RASTER, 0x2f)
  // DO NOT enable the ERST bit of IE here, leaves raster interrupts disabled

  // Run through each raster line to ensure that it does not lower the IRQ pin or mark an
  // interrupt in the IR register
  for (const i of range(263)) {
    assert.isFloating(chip.pins.IRQ, `raster line ${i}`)
    assert.equal(chip.registers.IR, 0)
    for (const _ of range(1, 65, true)) {
      tr.PHIIN.set().clear()
    }
  }
}
