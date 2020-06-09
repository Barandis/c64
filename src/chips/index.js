// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Emulations of the integrated circuits used in the Commodore 64.
 *
 * The early Commodore 64 had 32 integrated circuits. (Later verions had
 * fewer, as some chips were combined and a smaller number of larger
 * DRAM chips were used.) There are 27 of those ICs emulated here.
 *
 * | Designation | Link | Description |
 * | ---| --- | ---|
 * | U1 | `{@link module:chips.Ic6526|Ic6526}` | 6526 CIA
 * | U2 | `{@link module:chips.Ic6526|Ic6526}` | 6526 CIA
 * | U3 | `{@link module:chips.Ic2364|Ic2364}` | 2364 Basic ROM
 * | U4 | `{@link module:chips.Ic2364|Ic2364}` | 2364 Kernal ROM
 * | U5 | `{@link module:chips.Ic2332|Ic2332}` | 2332 Charcter ROM
 * | U6 | `{@link module:chips.Ic2114|Ic2114}` | 2114L-30 Static RAM
 * | U7 | `{@link module:chips.Ic6510|Ic6510}` | 6510 CPU
 * | U8 | `{@link module:chips.Ic7406|Ic7406}` | 7406 Inverter
 * | U9 | `{@link module:chips.Ic4164|Ic4164}` | 4164 Dynamic RAM
 * | U10 | `{@link module:chips.Ic4164|Ic4164}` | 4164 Dynamic RAM
 * | U11 | `{@link module:chips.Ic4164|Ic4164}` | 4164 Dynamic RAM
 * | U12 | `{@link module:chips.Ic4164|Ic4164}` | 4164 Dynamic RAM
 * | U13 | `{@link module:chips.Ic74257|Ic74257}` | 74LS257 Mux
 * | U14 | `{@link module:chips.Ic74258|Ic74258}` | 74LS258 Mux
 * | U15 | `{@link module:chips.Ic74139|Ic74139}` | 74LS139 Demux
 * | U16 | `{@link module:chips.Ic4066|Ic4066}` | 4066 Bilateral Switch
 * | U17 | `{@link module:chips.Ic82S100|Ic82S100}` | 82S100 PLA
 * | U18 | `{@link module:chips.Ic6581|Ic6581}` | 6581 SID
 * | U19 | `{@link module:chips.Ic6567|Ic6567}` | 6567 VIC
 * | U21| `{@link module:chips.Ic4164|Ic4164}` | 4164 Dynamic RAM
 * | U22 | `{@link module:chips.Ic4164|Ic4164}` | 4164 Dynamic RAM
 * | U23 | `{@link module:chips.Ic4164|Ic4164}` | 4164 Dynamic RAM
 * | U24 | `{@link module:chips.Ic4164|Ic4164}` | 4164 Dynamic RAM
 * | U25 | `{@link module:chips.Ic74257|Ic74257}` | 74LS257 Mux
 * | U26 | `{@link module:chips.Ic74373|Ic74373}` | 74LS373 Latch
 * | U27 | `{@link module:chips.Ic7408|Ic7408}` | 74LS08 AND Gate
 * | U28 | `{@link module:chips.Ic4066|Ic4066}` | 4066 Bilateral Switch
 *
 * Those not emulated are
 * - U20: 556 Timer
 * - U29: 74LS74 Flip Flop
 * - U30: 74LS193 Binary Counter
 * - U31: 74LS629 Oscillator
 * - U32: MC4044 Phase Detector
 *
 * U20 is used to more precisely time NMI and RESET signals, while
 * U29-U32 are components of the clock. Since a software emulation
 * defines its own timing, none of these is necessary or even useful.
 *
 * Each chip's API is defined wholly by its pins. This makes the API
 * documentation a little unusual. Chips have a similar set of
 * capabilities, none of which are methods.
 *
 * - `pins`: a `{@link module:components.PinArray|PinArray}` of all of
 *   the pins the chip has
 * - A set of properties named after each individual pin, which are
 *   themselves `{@link module:components.Pin|Pin}` objects representing
 *   those pins
 *
 * A chip responds to inputs on some of its pins with outputs on others
 * of its pins. The details on how this happens and upon which pins it
 * happens defines the chip.
 *
 * @module chips
 */

export { Ic2114 } from "./ic-2114"
export { Ic2332 } from "./ic-2332"
export { Ic2364 } from "./ic-2364"
export { Ic4066 } from "./ic-4066"
export { Ic4164 } from "./ic-4164"
export { Ic6510 } from "./ic-6510"
export { Ic6526 } from "./ic-6526/index"
export { Ic6567 } from "./ic-6567"
export { Ic6581 } from "./ic-6581/index"
export { Ic7406 } from "./ic-7406"
export { Ic7408 } from "./ic-7408"
export { Ic74139 } from "./ic-74139"
export { Ic74257 } from "./ic-74257"
export { Ic74258 } from "./ic-74258"
export { Ic74373 } from "./ic-74373"
export { Ic82S100 } from "./ic-82S100"
