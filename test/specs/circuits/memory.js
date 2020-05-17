/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, DEBUG, chipState } from "test/helper"

import { create4164 } from "chips/4164"
import { create74LS257 } from "chips/74LS257"

import { createTrace, PULL_UP, PULL_DOWN } from "circuits/trace"
import { LOW, HIGH } from "circuits/state"

function createMemory() {
  const ram0 = create4164()
  const ram1 = create4164()
  const ram2 = create4164()
  const ram3 = create4164()
  const ram4 = create4164()
  const ram5 = create4164()
  const ram6 = create4164()
  const ram7 = create4164()

  const mux0 = create74LS257()
  const mux1 = create74LS257()

  // Internal connections between the multiplexers and the DRAM
  createTrace(mux0.Y1, ram0.A3, ram1.A3, ram2.A3, ram3.A3, ram4.A3, ram5.A3, ram6.A3, ram7.A3)
  createTrace(mux0.Y2, ram0.A2, ram1.A2, ram2.A2, ram3.A2, ram4.A2, ram5.A2, ram6.A2, ram7.A2)
  createTrace(mux0.Y3, ram0.A1, ram1.A1, ram2.A1, ram3.A1, ram4.A1, ram5.A1, ram6.A1, ram7.A1)
  createTrace(mux0.Y4, ram0.A0, ram1.A0, ram2.A0, ram3.A0, ram4.A0, ram5.A0, ram6.A0, ram7.A0)
  createTrace(mux1.Y1, ram0.A6, ram1.A6, ram2.A6, ram3.A6, ram4.A6, ram5.A6, ram6.A6, ram7.A6)
  createTrace(mux1.Y2, ram0.A5, ram1.A5, ram2.A5, ram3.A5, ram4.A5, ram5.A5, ram6.A5, ram7.A5)
  createTrace(mux1.Y3, ram0.A7, ram1.A7, ram2.A7, ram3.A7, ram4.A7, ram5.A7, ram6.A7, ram7.A7)
  createTrace(mux1.Y4, ram0.A4, ram1.A4, ram2.A4, ram3.A4, ram4.A4, ram5.A4, ram6.A4, ram7.A4)

  // Address bus
  const a0 = createTrace(mux0.B4)
  const a1 = createTrace(mux0.B3)
  const a2 = createTrace(mux0.B2)
  const a3 = createTrace(mux0.B1)
  const a4 = createTrace(mux1.B4)
  const a5 = createTrace(mux1.B2)
  const a6 = createTrace(mux1.B1)
  const a7 = createTrace(mux1.B3)
  const a8 = createTrace(mux0.A4)
  const a9 = createTrace(mux0.A3)
  const a10 = createTrace(mux0.A2)
  const a11 = createTrace(mux0.A1)
  const a12 = createTrace(mux1.A4)
  const a13 = createTrace(mux1.A2)
  const a14 = createTrace(mux1.A1)
  const a15 = createTrace(mux1.A3)

  // Data bus
  const d0 = createTrace(ram0.D, ram0.Q)
  const d1 = createTrace(ram1.D, ram1.Q)
  const d2 = createTrace(ram2.D, ram2.Q)
  const d3 = createTrace(ram3.D, ram3.Q)
  const d4 = createTrace(ram4.D, ram4.Q)
  const d5 = createTrace(ram5.D, ram5.Q)
  const d6 = createTrace(ram6.D, ram6.Q)
  const d7 = createTrace(ram7.D, ram7.Q)

  // External control signals
  const _aec = createTrace(mux0._OE, mux1._OE)
  const _cas = createTrace(mux0.SEL, mux1.SEL)
  const _casram = createTrace(
    ram0._CAS,
    ram1._CAS,
    ram2._CAS,
    ram3._CAS,
    ram4._CAS,
    ram5._CAS,
    ram6._CAS,
    ram7._CAS,
  )
  const _rw = createTrace(ram0._W, ram1._W, ram2._W, ram3._W, ram4._W, ram5._W, ram6._W, ram7._W)
  const _ras = createTrace(
    ram0._RAS,
    ram1._RAS,
    ram2._RAS,
    ram3._RAS,
    ram4._RAS,
    ram5._RAS,
    ram6._RAS,
    ram7._RAS,
  )

  // Power supply and ground traces (not necessary, but for completeness)
  createTrace(ram0.VCC, ram1.VCC, ram2.VCC, ram3.VCC, PULL_UP)
  createTrace(ram4.VCC, ram5.VCC, ram6.VCC, ram7.VCC, PULL_UP)
  createTrace(mux0.VCC, mux1.VCC, PULL_UP)

  createTrace(ram0.VSS, ram1.VSS, ram2.VSS, ram3.VSS, PULL_DOWN)
  createTrace(ram4.VSS, ram5.VSS, ram6.VSS, ram7.VSS, PULL_DOWN)
  createTrace(mux0.GND, mux1.GND, PULL_DOWN)

  _aec.state = HIGH
  _cas.state = HIGH
  _casram.state = HIGH
  _rw.state = HIGH
  _ras.state = HIGH

  return {
    a0,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7,
    a8,
    a9,
    a10,
    a11,
    a12,
    a13,
    a14,
    a15,
    d0,
    d1,
    d2,
    d3,
    d4,
    d5,
    d6,
    d7,
    _aec,
    _cas,
    _casram,
    _rw,
    _ras,
    ram0,
    ram1,
    ram2,
    ram3,
    ram4,
    ram5,
    ram6,
    ram7,
    mux0,
    mux1,
  }
}

function showChipState(memory, title) {
  if (DEBUG) {
    console.log()
    console.log(title.toUpperCase())
    console.log()
    console.log(chipState(memory.ram0, "U21"))
    console.log(chipState(memory.ram1, "U9 "))
    console.log(chipState(memory.ram2, "U22"))
    console.log(chipState(memory.ram3, "U10"))
    console.log(chipState(memory.ram4, "U23"))
    console.log(chipState(memory.ram5, "U11"))
    console.log(chipState(memory.ram6, "U24"))
    console.log(chipState(memory.ram7, "U12"))
    console.log()
    console.log(chipState(memory.mux0, "U25"))
    console.log(chipState(memory.mux1, "U13"))
    console.log()
  }
}

function setAddress(memory, addr) {
  memory.a0.state = (addr >> 0) & 1
  memory.a1.state = (addr >> 1) & 1
  memory.a2.state = (addr >> 2) & 1
  memory.a3.state = (addr >> 3) & 1
  memory.a4.state = (addr >> 4) & 1
  memory.a5.state = (addr >> 5) & 1
  memory.a6.state = (addr >> 6) & 1
  memory.a7.state = (addr >> 7) & 1
  memory.a8.state = (addr >> 8) & 1
  memory.a9.state = (addr >> 9) & 1
  memory.a10.state = (addr >> 10) & 1
  memory.a11.state = (addr >> 11) & 1
  memory.a12.state = (addr >> 12) & 1
  memory.a13.state = (addr >> 13) & 1
  memory.a14.state = (addr >> 14) & 1
  memory.a15.state = (addr >> 15) & 1
}

function setData(memory, data) {
  memory.d0.state = (data >> 0) & 1
  memory.d1.state = (data >> 1) & 1
  memory.d2.state = (data >> 2) & 1
  memory.d3.state = (data >> 3) & 1
  memory.d4.state = (data >> 4) & 1
  memory.d5.state = (data >> 5) & 1
  memory.d6.state = (data >> 6) & 1
  memory.d7.state = (data >> 7) & 1
}

function getData(memory) {
  return (
    memory.d0.value * 1 +
    memory.d1.value * 2 +
    memory.d2.value * 4 +
    memory.d3.value * 8 +
    memory.d4.value * 16 +
    memory.d5.value * 32 +
    memory.d6.value * 64 +
    memory.d7.value * 128
  )
}

describe("Complete CPU-to-memory circuit", () => {
  let memory

  beforeEach(() => (memory = createMemory()))

  it("can write a byte to a certain location", () => {
    memory._aec.state = LOW

    setAddress(memory, 0x06c1)
    showChipState(memory, "Address set")

    setData(memory, 0x2f)
    showChipState(memory, "Data set")

    memory._ras.state = LOW
    showChipState(memory, "_RAS low")

    memory._cas.state = LOW
    showChipState(memory, "_CAS low")

    memory._rw.state = LOW
    showChipState(memory, "R_W low")

    memory._casram.state = LOW
    showChipState(memory, "_CASRAM low")
  })

  it("can read a byte back from a certain location", () => {
    memory._aec.state = LOW
    setAddress(memory, 0x06c1)
    setData(memory, 0x2f)
    memory._ras.state = LOW
    memory._cas.state = LOW
    memory._rw.state = LOW
    memory._casram.state = LOW

    memory._casram.state = HIGH
    memory._rw.state = HIGH
    memory._cas.state = HIGH
    memory._ras.state = HIGH
    setData(memory, 0)
    setAddress(memory, 0)

    setAddress(memory, 0x06c1)
    showChipState(memory, "Address set")

    memory._ras.state = LOW
    showChipState(memory, "_RAS low")

    memory._cas.state = LOW
    showChipState(memory, "_CAS low")

    memory._casram.state = LOW
    showChipState(memory, "_CASRAM low")

    expect(getData(memory)).to.equal(0x2f)
  })
})
