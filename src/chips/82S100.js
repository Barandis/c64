/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// An emulation of the Programmable Logic Array (PLA) used to control banking and memory access in
// the Commodore 64.
//
// The 82S100 was a programmable logic chip made by Signetics and is regarded as the very first
// programmable logic device, first released in 1975. It took 16 inputs and could form up to 48
// product terms (P-terms) by logically AND- or NANDing selections of the 16 inputs. These P-terms
// were then fed to another array that would logically OR them selectively, producing up to 8 sum
// terms (S-terms) that were ultimately sent to the output pins. The programming for these P- and
// S-terms could be done in the field in a similar manner to that of a PROM (programmable read-only
// memory), and Commodore would program them as a part of production of the C64.
//
// A single 82S100 could therefore serve the same function as a large number of 7400-series logic
// devices, for instance. It was used in a vast array of machines, including other Commodore
// computers and disk drives and those from several other companies. The differences between the
// 82S100's used in each would be the programming of the logic arrays.
//
// CBM eventually created their own hard-coded versions of the 82S100, which were faster and were
// cheaper for CBM to produce than it was for them to buy and program 82S100's. The schematic from
// which this emulation is being produced is an early one, from July, 1982, and at that time the
// C64 was still using the Signetics device.
//
// The input pins of the 82S100 were generically named I0, I1, I2, ... I15, and the output pins were
// similarly named F0, F1, ... F7. That has been maintained here, though constants are provided to
// be able to use the more C64-centric names that reflect the pins' actual functions in that
// computer.
//
// This chip was tasked with providing the chip enable signals for the C64's RAM, BASIC ROM, KERNAL
// ROM, character ROM, I/O memory, and cartridge ROM. The 6510 processor, having a 16-bit address
// bus, could access 64k of memory, but all of this RAM and ROM together added up to closer to 84k.
// Therefore the PLA used a combination of inputs, including some of the address bus, the
// specialized 6510 I/O port bus, and signals from the VIC and cartridge ROMs to determine which
// memory was trying to be accessed at any given time, and then provide chip enable signals for that
// memory (turning it on and turning other memory that could be at the same address off). It would
// do this for every memory access, which would happen twice per cycle (half the cycle was used by
// the CPU, half by the VIC). Thus bank switching actually happened at a frequency of 2MHz, twice
// the CPU clock frequency, and the chip generated a fair bit of heat.
//
// Another issue with this chip in the C64 was the _CASRAM signal. This line is connected directly
// to the _CAS inputs on the DRAM chips, while the _CAS signal from the VIC (which also is fed to
// the PLA's _CAS input) would control the multiplexer that controlled whether the high or low
// address lines were visible to the DRAM. Since the multiplexer took a few nanoseconds to switch
// its outputs, the PLA had to provide a delay on the output of the _CASRAM to make sure that the
// multiplexers were ready to feed the correct address to the DRAM. This was easily done in the
// 82S100 since its 90ns response time gave plenty of time for the multiplexers to change state, but
// replacement PLA's have often had to deal with delaying the _CASRAM line because the replacement
// chips are too fast.
//
// Fortunately, that's not an issue that an emulator program needs to worry about.
//
// All of the information used in this file for logic equations came from
// http://skoe.de/docs/c64-dissected/pla/c64_pla_dissected_a4ds.pdf. If you're into that sort of
// thing, it's also an excellent read for all aspects of what's actually a pretty interesting chip
// (including why Commodore engineers eventually got banned from putting their initials onto chips
// they designed).
//
// The 82S100 PLA is U17 on the C64 schematic.

import { createPin, INPUT, OUTPUT } from "components/pin"

// These are alternate names for the input (I) and output (F) pins, matching purpose of each pin in
// the Commodore 64. They can be used to access the same pins with a different naming convention.
// For example, the I0 pin, which accepts the _CAS signal from the VIC, can be accessed regularly
// with `chip.I0` or `chip.pins.I0`. With these constants, if so desired, it can also be accessed as
// `chip[_CAS]` or `chip.pins[_CAS]`.
export const _CAS = "I0"
export const _LORAM = "I1"
export const _HIRAM = "I2"
export const _CHAREN = "I3"
export const _VA14 = "I4"
export const A15 = "I5"
export const A14 = "I6"
export const A13 = "I7"
export const A12 = "I8"
export const BA = "I9"
export const _AEC = "I10"
export const R__W = "I11"
export const _EXROM = "I12"
export const _GAME = "I13"
export const VA13 = "I14"
export const VA12 = "I15"

export const F0 = "_CASRAM"
export const F1 = "_BASIC"
export const F2 = "_KERNAL"
export const F3 = "_CHAROM"
export const F4 = "GR__W"
export const F5 = "_IO"
export const F6 = "_ROML"
export const F7 = "_ROMH"

export function create82S100() {
  const pins = {
    // Input pins. In the 82S100, these were generically named I0 through I15, since each pin could
    // serve any function depending on the programming applies.
    I0: createPin(9, "I0", INPUT),
    I1: createPin(8, "I1", INPUT),
    I2: createPin(7, "I2", INPUT),
    I3: createPin(6, "I3", INPUT),
    I4: createPin(5, "I4", INPUT),
    I5: createPin(4, "I5", INPUT),
    I6: createPin(3, "I6", INPUT),
    I7: createPin(2, "I7", INPUT),
    I8: createPin(27, "I8", INPUT),
    I9: createPin(26, "I9", INPUT),
    I10: createPin(25, "I10", INPUT),
    I11: createPin(24, "I11", INPUT),
    I12: createPin(23, "I12", INPUT),
    I13: createPin(22, "I13", INPUT),
    I14: createPin(21, "I14", INPUT),
    I15: createPin(20, "I15", INPUT),

    // Output pins. Similar to the input pins, these were named generically on the 82S100.
    F0: createPin(18, "F0", OUTPUT, false),
    F1: createPin(17, "F1", OUTPUT, true),
    F2: createPin(16, "F2", OUTPUT, true),
    F3: createPin(15, "F3", OUTPUT, true),
    F4: createPin(13, "F4", OUTPUT, true),
    F5: createPin(12, "F5", OUTPUT, true),
    F6: createPin(11, "F6", OUTPUT, true),
    F7: createPin(10, "F7", OUTPUT, true),

    // Output enable, disables all outputs when set HIGH
    _OE: createPin(19, "_OE", INPUT),

    // Field programming pin, not used in mask programmed parts and not emulated
    FE: createPin(1, "FE", INPUT, null),

    // Power supply pins, not emulated
    VCC: createPin(28, "VCC", INPUT, null),
    GND: createPin(14, "GND", INPUT, null),
  }

  // One listener to rule them all
  //
  // In fact it rules them all so much that it violate's ESLint's complexity lint. This is chiefly
  // because logical and and or operators add to cyclomatic complexity because they offer short-
  // circuiting, and short-circuiting is a flow-control mechanism since it creates a choce between
  // executing the second term or not. Short-circuiting in this function serves only as an
  // optimization. It is only used in the production of Boolean values, not in making choices about
  // one result or another. Therefore I find it safe to disable the complexity check for this
  // function.
  //
  // Besides, any other way of performing this logic will involve function calls, whereas keeping
  // everything - input pin reading, logic, and output driving - within this function keeps function
  // calls from being necessary. Since I expect this code to be run early and often (it ran enough
  // on the original C64 to make chip temperature a concern, leading to a lot of failures of early
  // PLA's), it seems alright to optimize a little early.
  //
  /* eslint-disable complexity */
  function oneListener() {
    if (pins._OE.high) {
      pins.F0.state = null
      pins.F1.state = null
      pins.F2.state = null
      pins.F3.state = null
      pins.F4.state = null
      pins.F5.state = null
      pins.F6.state = null
      pins.F7.state = null

      return
    }

    const i0 = pins.I0.high
    const i1 = pins.I1.high
    const i2 = pins.I2.high
    const i3 = pins.I3.high
    const i4 = pins.I4.high
    const i5 = pins.I5.high
    const i6 = pins.I6.high
    const i7 = pins.I7.high
    const i8 = pins.I8.high
    const i9 = pins.I9.high
    const i10 = pins.I10.high
    const i11 = pins.I11.high
    const i12 = pins.I12.high
    const i13 = pins.I13.high
    const i14 = pins.I14.high
    const i15 = pins.I15.high

    // These are the product term equations programmed into the PLA for use in a Commodore 64. The
    // names for each signal reflect the names of the pins that those signals come from, but that is
    // not a terribly good way to understand what is going on here. For details about what each of
    // these P-terms do and are used for, see the excellent paper on the C64 PLA at
    // http://skoe.de/docs/c64-dissected/pla/c64_pla_dissected_a4ds.pdf, which is where the
    // information for these equations was gathered from.

    const p0 = i1 & i2 & i5 & !i6 & i7 & !i10 & i11 & i13
    const p1 = i2 && i5 && i6 && i7 && !i10 && i11 && i13
    const p2 = i2 && i5 && i6 && i7 && !i10 && i11 && !i12 && !i13
    const p3 = i2 && !i3 && i5 && i6 && !i7 && i8 && !i10 && i11 && i13
    const p4 = i1 && !i3 && i5 && i6 && !i7 && i8 && !i10 && i11 && i13
    const p5 = i2 && !i3 && i5 && i6 && !i7 && i8 && !i10 && i11 && !i12 && !i13
    const p6 = i4 && !i14 && i15 && i10 && i13
    const p7 = i4 && !i14 && i15 && i10 && !i12 && !i13
    // const p8 = i0 && i5 && i6 && !i7 && i8 && !i10 && !i11
    const p9 = i2 && i3 && i5 && i6 && !i7 && i8 && !i10 && i9 && i11 && i13
    const p10 = i2 && i3 && i5 && i6 && !i7 && i8 && !i10 && !i11 && i13
    const p11 = i1 && i3 && i5 && i6 && !i7 && i8 && !i10 && i9 && i11 && i13
    const p12 = i1 && i3 && i5 && i6 && !i7 && i8 && !i10 && !i11 && i13
    const p13 = i2 && i3 && i5 && i6 && !i7 && i8 && !i10 && i9 && i11 && !i12 && !i13
    const p14 = i2 && i3 && i5 && i6 && !i7 && i8 && !i10 && !i11 && !i12 && !i13
    const p15 = i1 && i3 && i5 && i6 && !i7 && i8 && !i10 && i9 && i11 && !i12 && !i13
    const p16 = i1 && i3 && i5 && i6 && !i7 && i8 && !i10 && !i11 && !i12 && !i13
    const p17 = i5 && i6 && !i7 && i8 && !i10 && i9 && i11 && i12 && !i13
    const p18 = i5 && i6 && !i7 && i8 && !i10 && !i11 && i12 && !i13
    const p19 = i1 && i2 && i5 && !i6 && !i7 && !i10 && i11 && !i12
    const p20 = i5 && !i6 && !i7 && !i10 && i12 && !i13
    const p21 = i2 && i5 && !i6 && i7 && !i10 && i11 && !i12 && !i13
    const p22 = i5 && i6 && i7 && !i10 && i12 && !i13
    const p23 = i14 && i15 && i10 && i12 && !i13
    const p24 = !i5 && !i6 && i8 && i12 && !i13
    const p25 = !i5 && !i6 && i7 && i12 && !i13
    const p26 = !i5 && i6 && i12 && !i13
    const p27 = i5 && !i6 && i7 && i12 && !i13
    const p28 = i5 && i6 && !i7 && !i8 && i12 && !i13
    // const p29 = !i1
    const p30 = i0
    const p31 = !i0 && i5 && i6 && !i7 && i8 && !i10 && !i11

    // These are the sum term equations programmed into the PLA for use in a C64.
    const s1 = p0
    const s2 = p1 || p2
    const s3 = p3 || p4 || p5 || p6 || p7
    const s4 = p9 || p10 || p11 || p12 || p13 || p14 || p15 || p16 || p17 || p18
    const s5 = p19 || p20
    const s6 = p21 || p22 || p23
    const s7 = p31
    const s0 = s1 || s2 || s3 || s4 || s5 || s6 || p24 || p25 || p26 || p27 || p28 || p30

    pins.F0.state = s0
    pins.F1.state = !s1
    pins.F2.state = !s2
    pins.F3.state = !s3
    pins.F4.state = !s7
    pins.F5.state = !s4
    pins.F6.state = !s5
    pins.F7.state = !s6
  }
  /* eslint-enable complexity */

  pins._OE.addListener(oneListener)
  pins.I0.addListener(oneListener)
  pins.I1.addListener(oneListener)
  pins.I2.addListener(oneListener)
  pins.I3.addListener(oneListener)
  pins.I4.addListener(oneListener)
  pins.I5.addListener(oneListener)
  pins.I6.addListener(oneListener)
  pins.I7.addListener(oneListener)
  pins.I8.addListener(oneListener)
  pins.I9.addListener(oneListener)
  pins.I10.addListener(oneListener)
  pins.I11.addListener(oneListener)
  pins.I12.addListener(oneListener)
  pins.I13.addListener(oneListener)
  pins.I14.addListener(oneListener)
  pins.I15.addListener(oneListener)

  const pla = {
    pins,
  }

  for (const name in pins) {
    pla[name] = pins[name]
  }

  return pla
}
