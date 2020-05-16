/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// An emulation of the Programmable Logic Array (PLA) used to control banking and memory access in
// the Commodore 64.
//
// The 906114 was a chip custom-made by Commodore for use in the C64. It is based on the Signetics
// 82S100, a programmable chip used for the same purpose in early C64's. This was a programmable
// chip used to implement logic circuits that would otherwise have to be comprised of a bunch of
// 74xx TTL devices. It had 16 inputs from which up to 48 product terms could be calculated (by
// ANDing any combination of the 16 input values for each P-term), and those 48 product terms could
// be selectively ORed into up to 8 outputs. The rules for ANDing and then ORing could be programmed
// in the field.
//
// THe 906114 was essentially a clone of the 82S100 except that it was not programmable (the logic
// was baked in at production time) and that it was about twice as fast, as it was reverse
// engineered and then rebuilt with newer technology. It uses only 29 of the available 48 P-terms
// (there are also two additional unused P-terms that still managed to get baked into the chip) and
// uses all 8 outputs. To illustrate how faithfully the chip was reverse engineered, Commodore
// included a working _OE pin, which would disable all of the outputs if set high, despite it being
// tied to ground (and thus always low) in the only computer that it could have been used in.
//
// The input pins of the 82S100 were generically named I0, I1, I2, ... I15, and the output pins were
// similarly named F0, F1, ... F7. However, since the device modeled here was for a specific purpose
// (providing logic for the C64), I have used the more specific pin names, largely as a measure to
// preserve my own sanity.
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
// the CPU clock frequency, and the chip generated a fair bit of heat. This, along with a suspect
// production process in the early days of the 906114, contributed to this chip failing fairly
// frequently, and there is still a rather robust hobby community around producing replacement PLAs.
//
// Another issue with this chip in the C64 was the _CASRAM signal. This line is connected directly
// to the _CAS inputs on the DRAM chips, while the _CAS signal from the VIC (which also is fed to
// the PLA's _CAS input) would control the multiplexer that controlled whether the high or low
// address lines were visible to the DRAM. Since the multiplexer took a few nanoseconds to switch
// its outputs, the PLA had to provide a delay on the output of the _CASRAM to make sure that the
// multiplexers were ready to feed the correct address to the DRAM. This wasn't a problem in the C64
// era, but since chips have become so much faster, many replacement PLAs require an addtional delay
// (by passing the signal through pairs of 7404 inverters, for instance) so that _CASRAM doesn't
// come too early.
//
// In this emulation, I have chosen to not implement temperature and timing problems.
//
// All of the information used in this file for logic equations came from
// http://skoe.de/docs/c64-dissected/pla/c64_pla_dissected_a4ds.pdf. If you're into that sort of
// thing, it's also an excellent read for all aspects of what's actually a pretty interesting chip
// (including why Commodore engineers eventually got banned from putting their initials onto chips
// they designed).

import { createPin, INPUT, OUTPUT } from "circuits/pin"
import { LOW, HIGH, HI_Z } from "circuits/state"

// These are alternate names for the input (I) and output (F) pins, matching the original names.
// They can be used to access the same pins with a different naming convention. For example, the
// _CAS pin can be accessed via `chip.pins._CAS` or `chip.pins["_CAS"]`, but with these constants
// it can also be accessed as `chip.pins[I0]`.
export const I0 = "_CAS"
export const I1 = "_LORAM"
export const I2 = "_HIRAM"
export const I3 = "_CHAREN"
export const I4 = "_VA14"
export const I5 = "A15"
export const I6 = "A14"
export const I7 = "A13"
export const I8 = "A12"
export const I9 = "BA"
export const I10 = "_AEC"
export const I11 = "R__W"
export const I12 = "_EXROM"
export const I13 = "_GAME"
export const I14 = "VA13"
export const I15 = "VA12"

export const F0 = "_CASRAM"
export const F1 = "_BASIC"
export const F2 = "_KERNAL"
export const F3 = "_CHAROM"
export const F4 = "GR__W"
export const F5 = "_IO"
export const F6 = "_ROML"
export const F7 = "_ROMH"

export function create906114() {
  const pins = {
    // Input pins. In the 82S100, these were generically named I0 through I15, in the same order as
    // given here, as their function would be determined by the chip's programming. As the 906114
    // was basically a hard-coded, non-programmable 82S100 meant only for use in the C64, the pins
    // have named reflecting their actual use.
    _CAS: createPin(9, "_CAS", INPUT),
    _LORAM: createPin(8, "_LORAM", INPUT),
    _HIRAM: createPin(7, "_HIRAM", INPUT),
    _CHAREN: createPin(6, "_CHAREN", INPUT),
    _VA14: createPin(5, "_VA14", INPUT),
    A15: createPin(4, "A15", INPUT),
    A14: createPin(3, "A14", INPUT),
    A13: createPin(2, "A13", INPUT),
    A12: createPin(27, "A12", INPUT),
    BA: createPin(26, "BA", INPUT),
    _AEC: createPin(25, "_AEC", INPUT),
    R__W: createPin(24, "R__W", INPUT),
    _EXROM: createPin(23, "_EXROM", INPUT),
    _GAME: createPin(22, "_GAME", INPUT),
    VA13: createPin(21, "VA13", INPUT),
    VA12: createPin(20, "VA12", INPUT),

    // Output pins. Similar to the input pins, these were named F0 through F7 on the 82S100. They
    // have been named here to reflect their usage in the C64.
    _CASRAM: createPin(18, "_CASRAM", OUTPUT),
    _BASIC: createPin(17, "_BASIC", OUTPUT),
    _KERNAL: createPin(16, "_KERNAL", OUTPUT),
    _CHAROM: createPin(15, "_CHAROM", OUTPUT),
    GR__W: createPin(13, "GR__W", OUTPUT),
    _IO: createPin(12, "_IO", OUTPUT),
    _ROML: createPin(11, "_ROML", OUTPUT),
    _ROMH: createPin(10, "_ROMH", OUTPUT),

    // Output enable, disables all outputs when set HIGH
    _OE: createPin(19, "_OE", INPUT, HI_Z),

    // Field programming pin, not used in mask programmable parts and not emulated
    FE: createPin(1, "FE", INPUT, HI_Z),

    // Power supply pins, not emulated
    VCC: createPin(28, "VCC", INPUT, HI_Z),
    GND: createPin(14, "GND", INPUT, HI_Z),
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
      pins._CASRAM.value = HI_Z
      pins._BASIC.value = HI_Z
      pins._KERNAL.value = HI_Z
      pins._CHAROM.value = HI_Z
      pins.GR__W.value = HI_Z
      pins._IO.value = HI_Z
      pins._ROML.value = HI_Z
      pins._ROMH.value = HI_Z

      return
    }

    const cas = pins._CAS.high
    const loram = pins._LORAM.high
    const hiram = pins._HIRAM.high
    const charen = pins._CHAREN.high
    const va14 = pins._VA14.high
    const a15 = pins.A15.high
    const a14 = pins.A14.high
    const a13 = pins.A13.high
    const a12 = pins.A12.high
    const ba = pins.BA.high
    const aec = pins._AEC.high
    const rw = pins.R__W.high
    const exrom = pins._EXROM.high
    const game = pins._GAME.high
    const va13 = pins.VA13.high
    const va12 = pins.VA12.high

    // These are the product term equations programmed into the PLA for use in a Commodore 64. The
    // history of the revelation of these equations can be read at
    // http://skoe.de/docs/c64-dissected/pla/c64_pla_dissected_a4ds.pdf, which is where the
    // information for these equations was gathered from.

    const p0 = loram & hiram & a15 & !a14 & a13 & !aec & rw & game
    const p1 = hiram && a15 && a14 && a13 && !aec && rw && game
    const p2 = hiram && a15 && a14 && a13 && !aec && rw && !exrom && !game
    const p3 = hiram && !charen && a15 && a14 && !a13 && a12 && !aec && rw && game
    const p4 = loram && !charen && a15 && a14 && !a13 && a12 && !aec && rw && game
    const p5 = hiram && !charen && a15 && a14 && !a13 && a12 && !aec && rw && !exrom && !game
    const p6 = va14 && !va13 && va12 && aec && game
    const p7 = va14 && !va13 && va12 && aec && !exrom && !game
    // const p8 = cas && a15 && a14 && !a13 && a12 && !aec && !rw
    const p9 = hiram && charen && a15 && a14 && !a13 && a12 && !aec && ba && rw && game
    const p10 = hiram && charen && a15 && a14 && !a13 && a12 && !aec && !rw && game
    const p11 = loram && charen && a15 && a14 && !a13 && a12 && !aec && ba && rw && game
    const p12 = loram && charen && a15 && a14 && !a13 && a12 && !aec && !rw && game
    const p13 = hiram && charen && a15 && a14 && !a13 && a12 && !aec && ba && rw && !exrom && !game
    const p14 = hiram && charen && a15 && a14 && !a13 && a12 && !aec && !rw && !exrom && !game
    const p15 = loram && charen && a15 && a14 && !a13 && a12 && !aec && ba && rw && !exrom && !game
    const p16 = loram && charen && a15 && a14 && !a13 && a12 && !aec && !rw && !exrom && !game
    const p17 = a15 && a14 && !a13 && a12 && !aec && ba && rw && exrom && !game
    const p18 = a15 && a14 && !a13 && a12 && !aec && !rw && exrom && !game
    const p19 = loram && hiram && a15 && !a14 && !a13 && !aec && rw && !exrom
    const p20 = a15 && !a14 && !a13 && !aec && exrom && !game
    const p21 = hiram && a15 && !a14 && a13 && !aec && rw && !exrom && !game
    const p22 = a15 && a14 && a13 && !aec && exrom && !game
    const p23 = va13 && va12 && aec && exrom && !game
    const p24 = !a15 && !a14 && a12 && exrom && !game
    const p25 = !a15 && !a14 && a13 && exrom && !game
    const p26 = !a15 && a14 && exrom && !game
    const p27 = a15 && !a14 && a13 && exrom && !game
    const p28 = a15 && a14 && !a13 && !a12 && exrom && !game
    // const p29 = !cas
    const p30 = cas
    const p31 = !cas && a15 && a14 && !a13 && a12 && !aec && !rw

    // These are the sum term equations programmed into the PLA for use in a C64.
    const f1 = p0
    const f2 = p1 || p2
    const f3 = p3 || p4 || p5 || p6 || p7
    const f4 = p9 || p10 || p11 || p12 || p13 || p14 || p15 || p16 || p17 || p18
    const f5 = p19 || p20
    const f6 = p21 || p22 || p23
    const f7 = p31

    // No RAM access whenever BASIC, KERNAL, CHAROM, IO, ROML, or ROMH are accessed or any area
    // with RAM disabled in Ultimax mode or when there is no CAS signal from the VIC
    const f0 = f1 || f2 || f3 || f4 || f5 || f6 || p24 || p25 || p26 || p27 || p28 || p30

    pins._CASRAM.state = f0 ? HIGH : LOW
    pins._BASIC.state = f1 ? LOW : HIGH
    pins._KERNAL.state = f2 ? LOW : HIGH
    pins._CHAROM.state = f3 ? LOW : HIGH
    pins.GR__W.state = f7 ? LOW : HIGH
    pins._IO.state = f4 ? LOW : HIGH
    pins._ROML.state = f5 ? LOW : HIGH
    pins._ROMH.state = f6 ? LOW : HIGH
  }
  /* eslint-enable complexity */

  pins._OE.addListener(oneListener)
  pins._CAS.addListener(oneListener)
  pins._LORAM.addListener(oneListener)
  pins._HIRAM.addListener(oneListener)
  pins._CHAREN.addListener(oneListener)
  pins._VA14.addListener(oneListener)
  pins.A15.addListener(oneListener)
  pins.A14.addListener(oneListener)
  pins.A13.addListener(oneListener)
  pins.A12.addListener(oneListener)
  pins.BA.addListener(oneListener)
  pins._AEC.addListener(oneListener)
  pins.R__W.addListener(oneListener)
  pins._EXROM.addListener(oneListener)
  pins._GAME.addListener(oneListener)
  pins.VA13.addListener(oneListener)
  pins.VA12.addListener(oneListener)

  const pla = {
    pins,
  }

  for (const name in pins) {
    pla[name] = pins[name]
  }

  return pla
}
