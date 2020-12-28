// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * An emulation of the 82S100 Programmable Logic Array, as it was
 * programmed for early Commodore 64's.
 *
 * The 82S100 is a programmable logic chip made by Signetics and is
 * regarded as the very first programmable logic device, first released
 * in 1975. It took 16 inputs and could form up to 48 product terms
 * (P-terms) by logically ANDind and NOTing selections of the 16 inputs.
 * These P-terms were then fed to another array that would logically OR
 * them selectively, producing up to 8 sum terms (S-terms) that were
 * ultimately sent to the output pins (possibly after NOTing them
 * first). The programming for these P- and S-terms could be done in the
 * field in a similar manner to that of a PROM (programmable read-only
 * memory), and Commodore would program them as a part of production of
 * the C64.
 *
 * A single 82S100 could therefore serve the same function as a large
 * number of 7400-series logic devices, for instance. It was used in a
 * vast array of machines, including other Commodore computers and disk
 * drives and those from several other companies. The differences
 * between the 82S100's used in each would be the programming of the
 * logic arrays.
 *
 * CBM eventually created their own hard-coded versions of the 82S100,
 * which were faster and were cheaper for CBM to produce than it was for
 * them to buy and program 82S100's. The schematic from which this
 * emulation is being produced is an early one, from July, 1982, and at
 * that time the C64 was still using the Signetics device.
 *
 * The input pins of the 82S100 were generically named I0-I15, and the
 * output pins were similarly named F0-F7. That has been maintained
 * here, though constants are provided to be able to use the more
 * C64-centric names that reflect the pins' actual functions in that
 * computer.
 *
 * This chip was tasked with providing the chip enable signals for the
 * C64's RAM and color RAM; BASIC, kernal, and character ROM; registers
 * from the {@link Ic6526|6526 CIAs}, {@link Ic6567|6567 VIC}, and
 * {@link Ic6581|6581 SID}; and two banks of cartridge ROM and two banks
 * of cartridge I/O memory. The 6510 processor, having a 16-bit address
 * bus, could access 64k of memory, but all of this RAM and ROM together
 * added up to closer to 84k. Therefore the PLA used a combination of
 * inputs, including some of the address bus, the specialized 6510 I/O
 * port bus, and signals from the VIC and cartridge ROMs to determine
 * which memory was trying to be accessed at any given time, and then
 * provide chip enable signals for that memory (turning it on and
 * turning other memory that could be at the same address off). It would
 * do this for every memory access, which would happen twice per cycle
 * (half the cycle was used by the CPU, half by the VIC). Thus bank
 * switching actually happened at a frequency of 2MHz, twice the CPU
 * clock frequency, and the chip generated a fair bit of heat.
 *
 * The purpose of the logic in the PLA is to take the current state of
 * the system during a memory access and produce a single output
 * enabling the one device (memory chip, processor chip with register,
 * cartridge, etc.) that will handle that memory access. (If the
 * selected output is _IO, that indicates that the I/O block of memory
 * is being accessed, but the PLA cannot determine *which* device is
 * being accessed from this information alone. When that happens, a
 * separate demultiplexer uses `A8`-`A11` to determine which device it
 * is.)
 *
 * ### Input pin assignments
 *
 * * **`I0`: `_CAS`,** This is the control line from the VIC that
 *     enables access to RAM. Instead of going directly to RAM, this
 *     line comes to the PLA and if RAM access is selected, the _CASRAM
 *     output is sent to the RAM chips.
 * * **`I1`: `_LORAM`.** This line controls the memory block from 0xA000
 *     - 0xBFFF. When high (normal), the BASIC ROM is available in this
 *       memory block. When low, it's switched out for RAM.
 * * **`I2`: `_HIRAM`.** This line controls the memory area from
 *     $E000...$FFFF. When high (normal), the KERNAL ROM is available in
 *     this memory block. When low, it's switched out for RAM.
 * * **`I3`: `_CHAREN`.** This line partially controls the memory block
 *     from $D000...$DFFF. When high (normal), the I/O devices appear in
 *     this memory block. When low, the character ROM appears here
 *     instead. This line can be overridden by other signals, including
 *     those allowing this memory block to contain RAM instead.
 * * **`I4`, `I14-I15`: `_VA14`, `VA13`, and `VA12`.** When the VIC is
 *     active, these are used to determine which block of memory the VIC
 *     is trying to access. `_VA14` is active low because that's the way
 *     it's generated by CIA2; it's inverted back into active high
 *     before being used to access memory but not for use with the PLA.
 * * **`I5`-`I8`: `A15`-`A12`.** Used to determine which block of memory
 *     the CPU wishes to access while the CPU is active.
 * * **`I9`: `BA`.** The VIC sets this "Bus Available" line high to
 *     indicate normal bus operation, switching between VIC and CPU each
 *     cycle. The VIC sets it low when it intends to take exclusive
 *     access of the address bus.
 * * **`I10`: `_AEC`.** This inverse of the VIC's "Address Enable
 *     Control" signal indicates which of the CPU (low) or VIC (high) is
 *     in control of the data bus.
 * * **`I11`: `R__W`.** This is generally written `R/_W`, but the slash
 *     is not a character that can be used in property names without
 *     quoting it. A high signal means that memory is being read, while
 *     a low means memory is being written. This makes a difference to
 *     what memory is being accessed. For example, ROM cannot be
 *     written; if an attempt is made to write to a ROM address while
 *     ROM is banked in, the write will happen to RAM instead.
 * * **`I12`-`I13`: `_GAME` and `_EXROM`.** These are used by cartridges
 *     to indicate the presence of addressable memory within them. There
 *     are two for-sure states for these two signals: if both are high
 *     (the normal state), there is no cartridge; and if `_EXROM` is
 *     high and `_GAME` is low, there is an Ultimax cartridge. Further
 *     mapping to cartridge ROM depends not only on these two signals
 *     but also on `_LORAM`, `_HIRAM`, and `_CHAREN`; [there is a nice
 *     table here][2].
 *
 * [2]: https://www.c64-wiki.com/wiki/Bank_Switching#Mode_Table
 *
 * ### Output pin assignments
 *
 * Since the outputs are fed to chip select pins, which are universally
 * active low, all of these are programmed to be inverted. Thus, at last
 * seven of them will be high at any given time and at most one will be
 * low.
 *
 * * **`F0`: `_CASRAM`.** This is the signal that ultimately enables
 *     RAM. The production of this signal is very different from the
 *     others. For all other output, if one of their terms is selected,
 *     that output will be selected. For `_CASRAM`, its terms are
 *     combined with the terms from all other outputs (except for
 *     `GR/_W`), and if any of the terms are selected, then `_CASRAM`
 *     will be *de*selected. (Even if all of those other outputs are
 *     deselected, `_CASRAM` will be deselected if `_CAS` is high or if
 *     certain addresses are accessed while an Ultimax cartridge is
 *     plugged in. In these cases, no PLA outputs will be selected.)
 * * **`F1`: `_BASIC`.** Enables the BASIC ROM.
 * * **`F2`: `_KERNAL`.** Enables the KERNAL ROM.
 * * **`F3`: `_CHAROM`.** Enables the Character ROM.
 * * **`F4`: `GR__W`.** (written `GR/_W` where slashes are legal.)
 *     Indicates that the static color RAM is being written to. Note
 *     that this is the only output that is not actually a chip enable
 *     signal; color RAM is possibly enabled if the `_IO` output is
 *     selected (see `{@link Ic74139}` for details).
 * * **`F5`: `_IO`.** Indicates that one of the following are going to
 *     be enabled: CIA1 registers, CIA2 registers, VIC registers, SID
 *     registers, color RAM, expansion port I/O from address 0xDE00 -
 *     0xDEFF, or expansion port I/O from address 0xDF00 - 0xDFFF. Which
 *     of these is actually enabled is done by decoding `A8`-`A11`,
 *     which is done by the {@link Ic74139|74139}.
 * * **`F6`: `_ROML`.** Enables expansion port ROM from 0x8000 - 0x9FFF.
 * * **`F7`: `_ROMH`.** Enables expansion port ROM from 0xE000 - 0xEFFF.
 *
 * There is a ton of information about the internal workings of the
 * C64's version of the 82S100 in [The C64 PLA Dissected][1]. This
 * document was used to derive all of the logic in this object and has a
 * number of interesting stories besides (if you find that sort of thing
 * interesting).
 *
 * [1]: http://skoe.de/docs/c64-dissected/pla/c64_pla_dissected_a4ds.pdf
 *
 * Additionally, the 82S100 has an active-low chip enable pin `_CE`
 * which is not used in the Commodore 64 (it is tied directly to ground
 * and therefore is always low, so the chip is always enabled). There is
 * also an `FE` pin that was used for programming the chip in the field;
 * the emulated chip from the C64 doesn't use this as the chip was
 * programmed during manufacturing.
 *
 * The chip comes in a 28-pin dual in-line package with the following
 * pin assignments.
 * ```txt
 *         +-----+--+-----+
 *      FE |1    +--+   28| Vcc
 *      I7 |2           27| I8
 *      I6 |3           26| I9
 *      I5 |4           25| I10
 *      I4 |5           24| I11
 *      I3 |6           23| I12
 *      I2 |7           22| I13
 *      I1 |8   82S100  21| I14
 *      I0 |9           20| I15
 *      F7 |10          19| _CE
 *      F6 |11          18| F0
 *      F5 |12          17| F1
 *      F4 |13          16| F2
 *     Vss |14          15| F3
 *         +--------------+
 * ```
 * *(`Vss` and `Vcc` are ground and power supply pins respectively, and
 * they are not emulated. `FE` is the field programming pin; this chip
 * was not programmed in the field for the Commodore 64, and it is not
 * emulated either.)*
 *
 * In the Commodore 64, U17 is an 82S100. As detailed extensively above,
 * it was used to decode signals to determine which chip would receive a
 * particular read or write.
 *
 * This chip is produced by calling the
 * `{@link module:chips.Ic82S100|Ic82S100}` function.
 *
 * @typedef Ic82S100
 * @property {Pin} _CE [19] The active-low chip enable pin. This is
 *     unused in the Commodore 64; it is tied directly to ground so that
 *     the chip is always enabled.
 * @property {Pin} FE [1] The field programming pin. This is unusued in
 *     the Commodore 64 because the programming is done in the factory.
 * @property {Pin} I0 [9] Input pin 0. This pin is tied to `_CAS`.
 * @property {Pin} I1 [8] Input pin 1. This pin is tied to `_LORAM`.
 * @property {Pin} I2 [7] Input pin 2. This pin is tied to `_HIRAM`.
 * @property {Pin} I3 [6] Input pin 3. This pin is tied to `_CHAREN`.
 * @property {Pin} I4 [5] Input pin 4. This pin is tied to `_VA14`.
 * @property {Pin} I5 [4] Input pin 5. This pin is tied to `A15`.
 * @property {Pin} I6 [3] Input pin 6. This pin is tied to `A14`.
 * @property {Pin} I7 [2] Input pin 7. This pin is tied to `A13`.
 * @property {Pin} I8 [27] Input pin 8. This pin is tied to `A12`.
 * @property {Pin} I9 [26] Input pin 9. This pin is tied to `BA`.
 * @property {Pin} I10 [25] Input pin 10. This pin is tied to `_AEC`.
 * @property {Pin} I11 [24] Input pin 11. This pin is tied to `R__W`.
 * @property {Pin} I12 [23] Input pin 12. This pin is tied to `_EXROM`.
 * @property {Pin} I13 [22] Input pin 13. This pin is tied to `_GAME`.
 * @property {Pin} I14 [21] Input pin 14. This pin is tied to `VA13`.
 * @property {Pin} I15 [20] Input pin 15. This pin is tied to `VA12`.
 * @property {Pin} F0 [18] Output pin 0. This pin is tied to `_CASRAM`.
 * @property {Pin} F1 [18] Output pin 0. This pin is tied to `_BASIC`.
 * @property {Pin} F2 [18] Output pin 0. This pin is tied to `_KERNAL`.
 * @property {Pin} F3 [18] Output pin 0. This pin is tied to `_CHAROM`.
 * @property {Pin} F4 [18] Output pin 0. This pin is tied to `GR__W`.
 * @property {Pin} F5 [18] Output pin 0. This pin is tied to `_IO`.
 * @property {Pin} F6 [18] Output pin 0. This pin is tied to `_ROML`.
 * @property {Pin} F7 [18] Output pin 0. This pin is tied to `_ROMH`.
 * @property {Pin} Vcc [28] The positive power supply. This pin is not
 *     emulated.
 * @property {Pin} Vss [14] The ground. This pin is not emulated.
 */

import { Chip } from 'components'
import Pin from 'components/pin'

const INPUT = Pin.INPUT
const OUTPUT = Pin.OUTPUT

// These are alternate names for the input (I) and output (F) pins,
// matching purpose of each pin in the Commodore 64. They can be used to
// access the same pins with a different naming convention. For example,
// the I0 pin, which accepts the _CAS signal from the VIC, can be
// accessed regularly with `chip.I0` or `chip[9]`. With these constants,
// if so desired, it can also be accessed as `chip[_CAS]`.
export const _CAS = 'I0'
export const _LORAM = 'I1'
export const _HIRAM = 'I2'
export const _CHAREN = 'I3'
export const _VA14 = 'I4'
export const A15 = 'I5'
export const A14 = 'I6'
export const A13 = 'I7'
export const A12 = 'I8'
export const BA = 'I9'
export const _AEC = 'I10'
export const R__W = 'I11'
export const _EXROM = 'I12'
export const _GAME = 'I13'
export const VA13 = 'I14'
export const VA12 = 'I15'

export const F0 = '_CASRAM'
export const F1 = '_BASIC'
export const F2 = '_KERNAL'
export const F3 = '_CHAROM'
export const F4 = 'GR__W'
export const F5 = '_IO'
export const F6 = '_ROML'
export const F7 = '_ROMH'

/**
 * Creates an emulation of the 82S100 programmable logic array, as it
 * was programmed for the Commodore 64.
 *
 * @returns {Ic82S100} A new 82S100 programmable logic array.
 * @memberof module:chips
 */
function Ic82S100() {
  const chip = Chip(
    // Input pins. In the 82S100, these were generically named I0
    // through I15, since each pin could serve any function depending on
    // the programming applies.
    new Pin(9, 'I0', INPUT),
    new Pin(8, 'I1', INPUT),
    new Pin(7, 'I2', INPUT),
    new Pin(6, 'I3', INPUT),
    new Pin(5, 'I4', INPUT),
    new Pin(4, 'I5', INPUT),
    new Pin(3, 'I6', INPUT),
    new Pin(2, 'I7', INPUT),
    new Pin(27, 'I8', INPUT),
    new Pin(26, 'I9', INPUT),
    new Pin(25, 'I10', INPUT),
    new Pin(24, 'I11', INPUT),
    new Pin(23, 'I12', INPUT),
    new Pin(22, 'I13', INPUT),
    new Pin(21, 'I14', INPUT),
    new Pin(20, 'I15', INPUT),

    // Output pins. Similar to the input pins, these were named
    // generically on the 82S100.
    new Pin(18, 'F0', OUTPUT).clear(),
    new Pin(17, 'F1', OUTPUT).set(),
    new Pin(16, 'F2', OUTPUT).set(),
    new Pin(15, 'F3', OUTPUT).set(),
    new Pin(13, 'F4', OUTPUT).set(),
    new Pin(12, 'F5', OUTPUT).set(),
    new Pin(11, 'F6', OUTPUT).set(),
    new Pin(10, 'F7', OUTPUT).set(),

    // Output enable, disables all outputs when set HIGH
    new Pin(19, '_OE', INPUT),

    // Field programming pin, not used in mask programmed parts and not
    // emulated
    new Pin(1, 'FE'),

    // Power supply pins, not emulated
    new Pin(28, 'VCC'),
    new Pin(14, 'GND'),
  )

  // One listener to rule them all
  //
  // In fact it rules them all so much that it violate's ESLint's
  // complexity lint. This is chiefly because logical and and or
  // operators add to cyclomatic complexity because they offer short-
  // circuiting, and short-circuiting is a flow-control mechanism since
  // it creates a choce between executing the second term or not.
  // Short-circuiting in this function serves only as an optimization.
  // It is only used in the production of Boolean values, not in making
  // choices about one result or another. Therefore I find it safe to
  // disable the complexity check for this function.
  //
  // Besides, any other way of performing this logic will involve
  // function calls, whereas keeping everything - input pin reading,
  // logic, and output driving - within this function keeps function
  // calls from being necessary. Since I expect this code to be run
  // early and often (it ran enough on the original C64 to make chip
  // temperature a concern, leading to a lot of failures of early
  // PLA's), it seems alright to optimize a little early.
  //
  /* eslint-disable complexity */
  function oneListener() {
    if (chip._OE.high) {
      chip.F0.float()
      chip.F1.float()
      chip.F2.float()
      chip.F3.float()
      chip.F4.float()
      chip.F5.float()
      chip.F6.float()
      chip.F7.float()

      return
    }

    const i0 = chip.I0.high
    const i1 = chip.I1.high
    const i2 = chip.I2.high
    const i3 = chip.I3.high
    const i4 = chip.I4.high
    const i5 = chip.I5.high
    const i6 = chip.I6.high
    const i7 = chip.I7.high
    const i8 = chip.I8.high
    const i9 = chip.I9.high
    const i10 = chip.I10.high
    const i11 = chip.I11.high
    const i12 = chip.I12.high
    const i13 = chip.I13.high
    const i14 = chip.I14.high
    const i15 = chip.I15.high

    // These are the product term equations programmed into the PLA for
    // use in a Commodore 64. The names for each signal reflect the
    // names of the pins that those signals come from, and while that is
    // an excellent way to make long and complex code succinct, it
    // doesn't do much for the human reader. For that reason, each term
    // has a comment to describe in more human terms what is happening
    // with that piece of the algorithm.
    //
    // Each P-term below has a comment with three lines. The first line
    // describes the state of the three 6510 I/O port lines that are
    // used for bank switching (_LORAM, _HIRAM, and _CHAREN). The second
    // line is the memory address that needs to be accessed to select
    // that P-term (this is from either the regular address bus when the
    // CPU is active or the VIC address bus when the VIC is active). The
    // final line gives information about whether the CPU or the VIC is
    // active, whether the memory access is a read or a write, and what
    // type (if any) of cartridge must be plugged into the expansion
    // port (the cartridge informaion takes into account the values of
    // _LORAM, _HIRAM, and _CHAREN already).
    //
    // If any piece of information is not given, its value doesn't
    // matter to that P-term. For example, in p0, the comment says that
    // _LORAM and _HIRAM must both be deselected. _CHAREN isn't
    // mentioned because whether it is selected or not doesn't change
    // whether that P-term is selected or not.
    //
    // Oftentimes, the reason for multiple terms for one output
    // selection is the limitation on what can be checked in a single
    // logic term, given that no ORs are possible in the production of
    // P-terms. For example, it is very common to see two terms that are
    // identical except that one indicates "no cartridge or 8k
    // cartridge" while the other has "16k cartridge". These two terms
    // together really mean "anything but an Ultimax cartridge", but
    // there's no way to do that in a single term with only AND and NOT.
    //
    // This information comes from the excellent paper available at
    // http://skoe.de/docs/c64-dissected/pla/c64_pla_dissected_a4ds.pdf.
    // If this sort of thing interests you, there's no better place for
    // information about the C64 PLA.

    // _LORAM deselected, _HIRAM deselected
    // $A000...$BFFF
    // CPU active, Read, No cartridge or 8k cartridge
    const p0 = i1 & i2 & i5 & !i6 & i7 & !i10 & i11 & i13

    // _HIRAM deselected
    // $E000...$FFFF
    // CPU active, Read, No cartridge or 8k cartridge
    const p1 = i2 && i5 && i6 && i7 && !i10 && i11 && i13

    // _HIRAM deselected
    // $E000...$FFFF
    // CPU active, Read, 16k cartridge
    const p2 = i2 && i5 && i6 && i7 && !i10 && i11 && !i12 && !i13

    // _HIRAM deselected, _CHAREN selected
    // $D000...$DFFF
    // CPU active, Read, No cartridge or 8k cartridge
    const p3 = i2 && !i3 && i5 && i6 && !i7 && i8 && !i10 && i11 && i13

    // _LORAM deselected, _CHAREN selected
    // $D000...$DFFF
    // CPU active, Read, No cartridge or 8k cartridge
    const p4 = i1 && !i3 && i5 && i6 && !i7 && i8 && !i10 && i11 && i13

    // _HIRAM deselected, _CHAREN selected
    // $D000...$DFFF
    // CPU active, Read, 16k cartridge
    const p5 = i2 && !i3 && i5 && i6 && !i7 && i8 && !i10 && i11 && !i12 && !i13

    //
    // $1000...$1FFF or $9000...$9FFF
    // VIC active, No cartridge or 8k cartridge
    const p6 = i4 && !i14 && i15 && i10 && i13

    //
    // $1000...$1FFF or $9000...$9FFF
    // VIC active, 16k cartridge
    const p7 = i4 && !i14 && i15 && i10 && !i12 && !i13

    // Unused. May be a relic from earlier design in C64 prototypes that
    // never got removed.
    // const p8 = i0 && i5 && i6 && !i7 && i8 && !i10 && !i11

    // _HIRAM deselected, _CHAREN deselected
    // $D000...$DFFF
    // CPU active, Bus available, Read, No cartridge or 8k cartridge
    const p9 = i2 && i3 && i5 && i6 && !i7 && i8 && !i10 && i9 && i11 && i13

    // _HIRAM deselected, _CHAREN deselected
    // $D000...$DFFF
    // CPU active, Write, No cartridge or 8k cartridge
    const p10 = i2 && i3 && i5 && i6 && !i7 && i8 && !i10 && !i11 && i13

    // _LORAM deselected, _CHAREN deselected
    // $D000...$DFFF
    // CPU active, Bus available, Read, No cartridge or 8k cartridge
    const p11 = i1 && i3 && i5 && i6 && !i7 && i8 && !i10 && i9 && i11 && i13

    // _LORAM deselected, _CHAREN deselected
    // $D000...$DFFF
    // CPU active, Write, No cartridge or 8k cartridge
    const p12 = i1 && i3 && i5 && i6 && !i7 && i8 && !i10 && !i11 && i13

    // _HIRAM deselected, _CHAREN deselected
    // $D000...$DFFF
    // CPU active, Bus available, Read, 16k cartridge
    const p13 = i2 && i3 && i5 && i6 && !i7 && i8 && !i10 && i9 && i11 && !i12
                   && !i13

    // _HIRAM deselected, _CHAREN deselected
    // $D000...$DFFF
    // CPU active, Write, 16k cartridge
    const p14 = i2 && i3 && i5 && i6 && !i7 && i8 && !i10 && !i11 && !i12
                   && !i13

    // _LORAM deselected, _CHAREN deselected
    // $D000...$DFFF
    // CPU active, Bus available, Read, 16k cartridge
    const p15 = i1 && i3 && i5 && i6 && !i7 && i8 && !i10 && i9 && i11 && !i12
      && !i13

    // _LORAM deselected, _CHAREN deselected
    // $D000...$DFFF
    // CPU active, Write, 16k cartridge
    const p16 = i1 && i3 && i5 && i6 && !i7 && i8 && !i10 && !i11 && !i12
                   && !i13

    //
    // $D000...$DFFF
    // CPU active, Bus available, Read, Ultimax cartridge
    const p17 = i5 && i6 && !i7 && i8 && !i10 && i9 && i11 && i12 && !i13

    //
    // $D000...$DFFF
    // CPU active, Write, Ultimax cartridge
    const p18 = i5 && i6 && !i7 && i8 && !i10 && !i11 && i12 && !i13

    // _LORAM deselected, _HIRAM deselected
    // $8000...$9FFF
    // CPU active, Read, 8k or 16k cartridge
    const p19 = i1 && i2 && i5 && !i6 && !i7 && !i10 && i11 && !i12

    //
    // $8000...$9FFF
    // CPU active, Ultimax cartridge
    const p20 = i5 && !i6 && !i7 && !i10 && i12 && !i13

    // _HIRAM deselected
    // $A000...$BFFF
    // CPU active, Read, 16k cartridge
    const p21 = i2 && i5 && !i6 && i7 && !i10 && i11 && !i12 && !i13

    //
    // $E000...$EFFF
    // CPU active, Ultimax cartridge
    const p22 = i5 && i6 && i7 && !i10 && i12 && !i13

    //
    // $3000...$3FFF, $7000...$7FFF, $B000...$BFFF, or $E000...$EFFF
    // VIC active, Ultimax cartridge
    const p23 = i14 && i15 && i10 && i12 && !i13

    //
    // $1000...$1FFF or $3000...$3FFF
    // Ultimax cartridge
    const p24 = !i5 && !i6 && i8 && i12 && !i13

    //
    // $2000...$3FFF
    // Ultimax cartridge
    const p25 = !i5 && !i6 && i7 && i12 && !i13

    //
    // $4000...$7FFF
    // Ultimax cartridge
    const p26 = !i5 && i6 && i12 && !i13

    //
    // $A000...$BFFF
    // Ultimax cartridge
    const p27 = i5 && !i6 && i7 && i12 && !i13

    //
    // $C000...$CFFF
    // Ultimax cartridge
    const p28 = i5 && i6 && !i7 && !i8 && i12 && !i13

    // Unused.
    // const p29 = !i1

    // _CAS deselected
    //
    //
    const p30 = i0

    // _CAS selected
    // $D000...$DFFF
    // CPU access, Write
    const p31 = !i0 && i5 && i6 && !i7 && i8 && !i10 && !i11

    // This is the sum-term (S-term) portion of the logic, where the
    // P-terms calculated above are logically ORed to poroduce a single
    // output. This is much simpler than P-term production because the
    // P-terms handle everything about chip selection, except that each
    // chip may be the choice of several different P-terms. That's the
    // role of the S-term logic, to combine P-terms to come up with
    // single outputs.

    // Selects BASIC ROM.
    const s1 = p0

    // Selects KERNAL ROM.
    const s2 = p1 || p2

    // Selects Character ROM.
    const s3 = p3 || p4 || p5 || p6 || p7

    // Selects I/O, color RAM, or processor registers.
    const s4 = p9 || p10 || p11 || p12 || p13 || p14 || p15 || p16 || p17 || p18

    // Selects low cartridge ROM.
    const s5 = p19 || p20

    // Selects high cartridge ROM.
    const s6 = p21 || p22 || p23

    // Selects write mode for color RAM.
    const s7 = p31

    // Deselects RAM. This is the only *de*selection, which is why it is
    // the only one not inverted in the state assignment below.
    const s0 = s1 || s2 || s3 || s4 || s5 || s6 || p24 || p25 || p26 || p27
                  || p28 || p30

    chip.F0.level = s0
    chip.F1.level = !s1
    chip.F2.level = !s2
    chip.F3.level = !s3
    chip.F4.level = !s7
    chip.F5.level = !s4
    chip.F6.level = !s5
    chip.F7.level = !s6
  }
  /* eslint-enable complexity */

  chip._OE.addListener(oneListener)
  chip.I0.addListener(oneListener)
  chip.I1.addListener(oneListener)
  chip.I2.addListener(oneListener)
  chip.I3.addListener(oneListener)
  chip.I4.addListener(oneListener)
  chip.I5.addListener(oneListener)
  chip.I6.addListener(oneListener)
  chip.I7.addListener(oneListener)
  chip.I8.addListener(oneListener)
  chip.I9.addListener(oneListener)
  chip.I10.addListener(oneListener)
  chip.I11.addListener(oneListener)
  chip.I12.addListener(oneListener)
  chip.I13.addListener(oneListener)
  chip.I14.addListener(oneListener)
  chip.I15.addListener(oneListener)

  return chip
}

export { Ic82S100 }
