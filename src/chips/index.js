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
 * | ID | Name | Description |
 * | ---| --- | ---|
 * | U1 | `{@link Ic6526|6526}` | Complex Interface Adapter
 * | U2 | `{@link Ic6526|6526}` | Complex Interface Adapter
 * | U3 | `{@link Ic2364|2364}` | 8k x 8 Basic ROM
 * | U4 | `{@link Ic2364|2364}` | 8k x 8 Kernal ROM
 * | U5 | `{@link Ic2332|2332}` | 4k x 8 Charcter ROM
 * | U6 | `{@link Ic2114|2114}` | 1k x 4 Static RAM
 * | U7 | `{@link Ic6510|6510}` | Microprocessor
 * | U8 | `{@link Ic7406|7406}` | Hex Inverter
 * | U9 | `{@link Ic4164|4164}` | 64k x 1 Dynamic RAM
 * | U10 | `{@link Ic4164|4164}` | 64k x 1 Dynamic RAM
 * | U11 | `{@link Ic4164|4164}` | 64k x 1 Dynamic RAM
 * | U12 | `{@link Ic4164|4164}` | 64k x 1 Dynamic RAM
 * | U13 | `{@link Ic74257|74257}` | Quad 2-to-1 Multiplexer
 * | U14 | `{@link Ic74258|74258}` | Quad 2-to-1 Multiplexer
 * | U15 | `{@link Ic74139|74139}` | Dual 2-to-4 Demultiplexer
 * | U16 | `{@link Ic4066|4066}` | Quad Bilateral Switch
 * | U17 | `{@link Ic82S100|82S100}` | Programmable Logic Array
 * | U18 | `{@link Ic6581|6581}` | Sound Interface Device
 * | U19 | `{@link Ic6567|6567}` | Video Interface Controller
 * | U21 | `{@link Ic4164|4164}` | 64k x 1 Dynamic RAM
 * | U22 | `{@link Ic4164|4164}` | 64k x 1 Dynamic RAM
 * | U23 | `{@link Ic4164|4164}` | 64k x 1 Dynamic RAM
 * | U24 | `{@link Ic4164|4164}` | 64k x 1 Dynamic RAM
 * | U25 | `{@link Ic74257|74257}` | Quad 2-to-1 Multiplexer
 * | U26 | `{@link Ic74373|74373}` | Octal Transparent Latch
 * | U27 | `{@link Ic7408|7408}` | Quad 2-input AND Gate
 * | U28 | `{@link Ic4066|4066}` | Quad Bilateral Switch
 *
 * Those not emulated are
 * - U20: 556 Dual Timer
 * - U29: 74LS74 Dual D-Type Flip Flop
 * - U30: 74LS193 4-bit Binary Counter
 * - U31: 74LS629 Voltage-Controlled Oscillator
 * - U32: MC4044 Phase-Frequency Detector
 *
 * U20 is used to more precisely time NMI and RESET signals, while
 * U29-U32 are components of the clock. Since a software emulation
 * defines its own timing, none of these is necessary or even useful.
 *
 * Each chip's API is defined wholly by its pins. The pins for each chip
 * can be referenced in two different ways.
 *
 * 1. Via a property with the same name as the pin. These properties are
 *    listed in each chip's documentation.
 * 2. Via an array index with the pin's number. Each property
 *    description includes a number in square brackets; this is the pin
 *    number and the index into the chip object that will return that
 *    pin. Note that because these pin numbers match the numbers on the
 *    chip's datasheet, they are 1-indexed. There is no Pin 0.
 *
 * Additionally, a chip has all methods that an array would, using its
 * pins as its elements. Therefore you can iterate over a chip, map its
 * pins, etc. Remember when doing so that since there is no pin 0 but an
 * array does have an element 0, that element 0 will be an empty item.
 * Filtering it out may be necessary.
 *
 * A chip responds to inputs on some of its pins with outputs on others
 * of its pins. The details on how this happens and upon which pins it
 * happens defines the chip.
 *
 * @module chips
 */

export { Ic2114 } from './ic-2114'
export { Ic2332 } from './ic-2332'
export { Ic2364 } from './ic-2364'
export { Ic4066 } from './ic-4066'
export { Ic4164 } from './ic-4164'
export { Ic6510 } from './ic-6510'
export { Ic6526 } from './ic-6526/index'
export { Ic6567 } from './ic-6567'
export { Ic6581 } from './ic-6581/index'
export { Ic7406 } from './ic-7406'
export { Ic7408 } from './ic-7408'
export { Ic74139 } from './ic-74139'
export { Ic74257 } from './ic-74257'
export { Ic74258 } from './ic-74258'
export { Ic74373 } from './ic-74373'
export { Ic82S100 } from './ic-82S100'
