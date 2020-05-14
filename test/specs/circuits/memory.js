/* eslint-disable max-lines */
/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect, DEBUG, chipState } from "test/helper"

import {
  create4164,
  A0 as MA0,
  A1 as MA1,
  A2 as MA2,
  A3 as MA3,
  A4 as MA4,
  A5 as MA5,
  A6 as MA6,
  A7 as MA7,
  D,
  Q,
  _W,
  _RAS,
  _CAS,
} from "chips/4164"

import { create74257, _OE, SEL, A1, A2, A3, A4, B1, B2, B3, B4, Y1, Y2, Y3, Y4 } from "chips/74257"

import { createTrace } from "circuits/trace"
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

  const mux0 = create74257()
  const mux1 = create74257()

  // Internal connections between the multiplexers and the DRAM
  createTrace(
    mux0.pins[Y1],
    ram0.pins[MA3],
    ram1.pins[MA3],
    ram2.pins[MA3],
    ram3.pins[MA3],
    ram4.pins[MA3],
    ram5.pins[MA3],
    ram6.pins[MA3],
    ram7.pins[MA3],
  )
  createTrace(
    mux0.pins[Y2],
    ram0.pins[MA2],
    ram1.pins[MA2],
    ram2.pins[MA2],
    ram3.pins[MA2],
    ram4.pins[MA2],
    ram5.pins[MA2],
    ram6.pins[MA2],
    ram7.pins[MA2],
  )
  createTrace(
    mux0.pins[Y3],
    ram0.pins[MA1],
    ram1.pins[MA1],
    ram2.pins[MA1],
    ram3.pins[MA1],
    ram4.pins[MA1],
    ram5.pins[MA1],
    ram6.pins[MA1],
    ram7.pins[MA1],
  )
  createTrace(
    mux0.pins[Y4],
    ram0.pins[MA0],
    ram1.pins[MA0],
    ram2.pins[MA0],
    ram3.pins[MA0],
    ram4.pins[MA0],
    ram5.pins[MA0],
    ram6.pins[MA0],
    ram7.pins[MA0],
  )
  createTrace(
    mux1.pins[Y1],
    ram0.pins[MA6],
    ram1.pins[MA6],
    ram2.pins[MA6],
    ram3.pins[MA6],
    ram4.pins[MA6],
    ram5.pins[MA6],
    ram6.pins[MA6],
    ram7.pins[MA6],
  )
  createTrace(
    mux1.pins[Y2],
    ram0.pins[MA5],
    ram1.pins[MA5],
    ram2.pins[MA5],
    ram3.pins[MA5],
    ram4.pins[MA5],
    ram5.pins[MA5],
    ram6.pins[MA5],
    ram7.pins[MA5],
  )
  createTrace(
    mux1.pins[Y3],
    ram0.pins[MA7],
    ram1.pins[MA7],
    ram2.pins[MA7],
    ram3.pins[MA7],
    ram4.pins[MA7],
    ram5.pins[MA7],
    ram6.pins[MA7],
    ram7.pins[MA7],
  )
  createTrace(
    mux1.pins[Y4],
    ram0.pins[MA4],
    ram1.pins[MA4],
    ram2.pins[MA4],
    ram3.pins[MA4],
    ram4.pins[MA4],
    ram5.pins[MA4],
    ram6.pins[MA4],
    ram7.pins[MA4],
  )

  // Address bus
  const a0 = createTrace(mux0.pins[B4])
  const a1 = createTrace(mux0.pins[B3])
  const a2 = createTrace(mux0.pins[B2])
  const a3 = createTrace(mux0.pins[B1])
  const a4 = createTrace(mux1.pins[B4])
  const a5 = createTrace(mux1.pins[B2])
  const a6 = createTrace(mux1.pins[B1])
  const a7 = createTrace(mux1.pins[B3])
  const a8 = createTrace(mux0.pins[A4])
  const a9 = createTrace(mux0.pins[A3])
  const a10 = createTrace(mux0.pins[A2])
  const a11 = createTrace(mux0.pins[A1])
  const a12 = createTrace(mux1.pins[A4])
  const a13 = createTrace(mux1.pins[A2])
  const a14 = createTrace(mux1.pins[A1])
  const a15 = createTrace(mux1.pins[A3])

  // Data bus
  const d0 = createTrace(ram0.pins[D], ram0.pins[Q])
  const d1 = createTrace(ram1.pins[D], ram1.pins[Q])
  const d2 = createTrace(ram2.pins[D], ram2.pins[Q])
  const d3 = createTrace(ram3.pins[D], ram3.pins[Q])
  const d4 = createTrace(ram4.pins[D], ram4.pins[Q])
  const d5 = createTrace(ram5.pins[D], ram5.pins[Q])
  const d6 = createTrace(ram6.pins[D], ram6.pins[Q])
  const d7 = createTrace(ram7.pins[D], ram7.pins[Q])

  // External control signals
  const _aec = createTrace(mux0.pins[_OE], mux1.pins[_OE])
  const _cas = createTrace(mux0.pins[SEL], mux1.pins[SEL])
  const _casram = createTrace(
    ram0.pins[_CAS],
    ram1.pins[_CAS],
    ram2.pins[_CAS],
    ram3.pins[_CAS],
    ram4.pins[_CAS],
    ram5.pins[_CAS],
    ram6.pins[_CAS],
    ram7.pins[_CAS],
  )
  const rw = createTrace(
    ram0.pins[_W],
    ram1.pins[_W],
    ram2.pins[_W],
    ram3.pins[_W],
    ram4.pins[_W],
    ram5.pins[_W],
    ram6.pins[_W],
    ram7.pins[_W],
  )
  const _ras = createTrace(
    ram0.pins[_RAS],
    ram1.pins[_RAS],
    ram2.pins[_RAS],
    ram3.pins[_RAS],
    ram4.pins[_RAS],
    ram5.pins[_RAS],
    ram6.pins[_RAS],
    ram7.pins[_RAS],
  )

  _aec.state = HIGH
  _cas.state = HIGH
  _casram.state = HIGH
  rw.state = HIGH
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
    rw,
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
  memory.a0.value = (addr >> 0) & 1
  memory.a1.value = (addr >> 1) & 1
  memory.a2.value = (addr >> 2) & 1
  memory.a3.value = (addr >> 3) & 1
  memory.a4.value = (addr >> 4) & 1
  memory.a5.value = (addr >> 5) & 1
  memory.a6.value = (addr >> 6) & 1
  memory.a7.value = (addr >> 7) & 1
  memory.a8.value = (addr >> 8) & 1
  memory.a9.value = (addr >> 9) & 1
  memory.a10.value = (addr >> 10) & 1
  memory.a11.value = (addr >> 11) & 1
  memory.a12.value = (addr >> 12) & 1
  memory.a13.value = (addr >> 13) & 1
  memory.a14.value = (addr >> 14) & 1
  memory.a15.value = (addr >> 15) & 1
}

function setData(memory, data) {
  memory.d0.value = (data >> 0) & 1
  memory.d1.value = (data >> 1) & 1
  memory.d2.value = (data >> 2) & 1
  memory.d3.value = (data >> 3) & 1
  memory.d4.value = (data >> 4) & 1
  memory.d5.value = (data >> 5) & 1
  memory.d6.value = (data >> 6) & 1
  memory.d7.value = (data >> 7) & 1
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

    memory.rw.state = LOW
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
    memory.rw.state = LOW
    memory._casram.state = LOW

    memory._casram.state = HIGH
    memory.rw.state = HIGH
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
