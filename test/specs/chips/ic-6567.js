// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Ic6567 from 'chips/ic-6567/index'
import { deviceTraces } from 'test/helper'
import { pinsToValue, range, valueToPins } from 'utils'
import {
  activationOrder,
  badLineDenOff,
  badLineNormal,
  badLineScroll,
  cycle,
  phase,
  raster,
  rasterIrq,
  rasterIrqDisabled,
} from './ic-6567/clock'
import {
  addressGen,
  addressPins,
  aecBgBadLine,
  aecBgRegularLine,
  baBgBadLine,
  baBgRegularLine,
} from './ic-6567/memory'
import {
  readBottomFour,
  readCollision,
  readCtrl2,
  readIr,
  readRegular,
  readWriteUnused,
  writeBottomFour,
  writeCollision,
  writeCtrl1,
  writeCtrl2,
  writeIr,
  writeRaster,
  writeRegular,
} from './ic-6567/registers'

describe('6567 VIC II', () => {
  let chip
  let tr
  let regAddrTraces
  let regDataTraces

  beforeEach(() => {
    chip = Ic6567()
    tr = deviceTraces(chip)

    regAddrTraces = [...range(24, 30, true)].map(pin => tr[pin])
    regDataTraces = [...range(8)].map(pin => tr[`D${pin}`])

    tr.R_W.set()
    tr.CS.set()
  })

  function writeRegister(register, value) {
    valueToPins(value, ...regDataTraces)
    valueToPins(register, ...regAddrTraces)
    tr.R_W.clear()
    tr.CS.clear()
    tr.CS.set()
    tr.R_W.set()
  }

  function readRegister(register) {
    valueToPins(register, ...regAddrTraces)
    tr.CS.clear()
    const value = pinsToValue(...regDataTraces)
    tr.CS.set()
    return value
  }

  const test = fn => () =>
    fn({
      chip,
      tr,
      writeRegister,
      readRegister,
    })

  describe('reading and writing registers', () => {
    it('reads from 8-bit registers', test(readRegular))
    it('writes to 8-bit registers', test(writeRegular))
    it('reads from 4-bit registers', test(readBottomFour))
    it('writes to 4-bit registers', test(writeBottomFour))
    it('reads from control register 2', test(readCtrl2))
    it('writes to control register 2', test(writeCtrl2))
    it('reads from interrupt register', test(readIr))
    it('writes to interrupt register', test(writeIr))
    it('reads and writes to unused registers', test(readWriteUnused))
    it('reads from collision registers', test(readCollision))
    it('writes to collision registers', test(writeCollision))
    it('does not write directly to the raster register', test(writeRaster))
    it('does not write directly to bit 7 of control register 1', test(writeCtrl1))
  })
  describe('clock and timing signals', () => {
    it('activates PHI0, RAS, and CAS in the correct order', test(activationOrder))
    it('properly progresses the phase number', test(phase))
    it('properly progresses the cycle number', test(cycle))
    it('properly progresses the raster line and raster registers', test(raster))
    it('marks bad lines in the right places', test(badLineNormal))
    it('does not mark bad lines if DEN is cleared', test(badLineDenOff))
    it('modifies which lines are bad if YSCROLL is changed', test(badLineScroll))
    it('handles raster interrupts', test(rasterIrq))
    it('does not fire raster interrupts if they are are disabled', test(rasterIrqDisabled))
  })
  describe.only('memory manager', () => {
    it('generates an address of the right type and value', test(addressGen))
    it('applies the right values to the address pins at the right times', test(addressPins))
    it('sets BA high on an entire regular line with no sprites', test(baBgRegularLine))
    it('lowers BA in cycles 12-54 on a bad line', test(baBgBadLine))
    it('alternates AEC with clock on a regular line with no sprites', test(aecBgRegularLine))
    it('lowers AEC in cycles 15-54 on a bad line', test(aecBgBadLine))
  })
})
