// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 6581 Sound Interface Device.
//
// The 6581 was designed as an advanced (for 1982) synthesizer, something that would set the
// new Commodore 64 apart from similar home computers. It has three individual oscillators
// that are each controlled with their own envelope generators and amplitude modulators. The
// outputs from these "voices" can optionally then be sent through a programmable audio
// filter (analog in the physical 6581, simulated digitally here), and then they are mixed
// for output. Tacked onto this is the capability to handle two game paddles
// (potentiometers).
//
// These features are controlled with a collection of 29 registers (32 addresses are
// available with the 5 address inputs, but the last three addresses are unused). The first
// 25 are write-only; these are 7 for control of each of the three voices and 4 for control
// of the filter and mixer. The final 4 registers are read-only and provide information
// about the potentiometers and the internals of voice 3.
//
// | Addr | Register | R/W | Description                                    |
// | ---- | -------- | --- | ---------------------------------------------- |
// | 0x00 | FRELO1   |  W  | Voice 1 frequency, low 8 bits                  |
// | 0x01 | FREHI1   |  W  | Voice 1 frequency, high 8 bits                 |
// | 0x02 | PWLO1    |  W  | Voice 1 pulse width, low 8 bits                |
// | 0x03 | PWHI1    |  W  | Voice 1 pulse width, high 4 bits               |
// | 0x04 | VCREG1   |  W  | Voice 1 control register                       |
// | 0x05 | ATDCY1   |  W  | Voice 1 attack/decay                           |
// | 0x06 | SUREL1   |  W  | Voice 1 sustain/release                        |
// | 0x07 | FRELO2   |  W  | Voice 2 frequency, low 8 bits                  |
// | 0x08 | FREHI2   |  W  | Voice 2 frequency, high 8 bits                 |
// | 0x09 | PWLO2    |  W  | Voice 2 pulse width, low 8 bits                |
// | 0x0a | PWHI2    |  W  | Voice 2 pulse width, high 4 bits               |
// | 0x0b | VCREG2   |  W  | Voice 2 control register                       |
// | 0x0c | ATDCY2   |  W  | Voice 2 attack/decay                           |
// | 0x0d | SUREL2   |  W  | Voice 2 sustain/release                        |
// | 0x0e | FRELO3   |  W  | Voice 3 frequency, low 8 bits                  |
// | 0x0f | FREHI3   |  W  | Voice 3 frequency, high 8 bits                 |
// | 0x10 | PWLO3    |  W  | Voice 3 pulse width, low 8 bits                |
// | 0x11 | PWHI3    |  W  | Voice 3 pulse width, high 4 bits               |
// | 0x12 | VCREG3   |  W  | Voice 3 control register                       |
// | 0x13 | ATDCY3   |  W  | Voice 3 attack/decay                           |
// | 0x14 | SUREL3   |  W  | Voice 3 sustain/release                        |
// | 0x15 | CUTLO    |  W  | Filter cutoff, low 3 bits                      |
// | 0x16 | CUTHI    |  W  | Filter cutoff, high 8 bits                     |
// | 0x17 | RESON    |  W  | Filter voice switching and resonance           |
// | 0x18 | SIGVOL   |  W  | Master volume and filter mode                  |
// | 0x19 | POTX     |  R  | Potentiometer X current value                  |
// | 0x1a | POTY     |  R  | Potentiometer Y current value                  |
// | 0x1b | RANDOM   |  R  | Voice 3 waveform generator output, high 8 bits |
// | 0x1c | ENV3     |  R  | Voice 3 envelope generator output              |
// | 0x1d | UNUSED1  |     | Unused                                         |
// | 0x1e | UNUSED2  |     | Unused                                         |
// | 0x1f | UNUSED3  |     | Unused                                         |
//
// ## Voices
//
// Each of the 6581's three voices consists of a waveform generator, an envelope generator,
// and an amplitude modulator. The waveform generator creates a sound wave of a particular
// shape at the requested frequency. The envelope generator creates a volume profile for
// each "note", controlling the note's attack time, decay time, sustain level, and release
// time. The amplitude modulator then combines these two, making a waveform that varies in
// volume according to the envelope.
//
// ### Waveform Generators
//
// Each waveform generator starts with a 24-bit phase accumulating oscillator. This is a
// digital oscillator in which the 16-bit number held in FRELOx and FREHIx is added to the
// accumulator every clock cycle. Once the PAO reaches its max value, it rolls over to 0 and
// starts again. In this way, the FRELOx and FREHIx registers control the frequency of the
// oscillator; a higher number will cause the PAO to roll over more often, increasing its
// frequency.
//
// The output of a PAO is therefore a digital sawtooth wave. In most applications, this
// output is fed to a lookup table which results in the value of a sine wave at that point
// in its phase (hence the name "phase accumulating oscillator"), but the 6581 doesn't have
// enough silicon to hold a lookup table. Instead, it uses logical manipulations to produce
// four waveforms that do not require lookup tables.
//
// One of those waveforms is the sawtooth itself. The top 12 bits of the PAO output are
// passed along as the sawtooth output.
//
// A triangle wave is produced by exclusive-oring the most significant bit of the PAO output
// with the next 11 bits. This causes those 11 bits to reverse when the MSB is high, turning
// the sawtooth into a triangle. These 11 bits are shifted to the left (and a 0 added as bit
// zero) to produce a triangle wave that has the same amplitude as the sawtooth but with
// half the resolution.
//
// A pulse wave is produced with a comparator. The value of the top 12 bits of the PAO is
// compared with the contents of the pulse width registers PWLOx and PWHIx (the high 4 bits
// of PWHIx are ignored). If the register value is higher, the output is 0xfff. If the PAO
// value is higher, the output is 0x000. A square (pulse) wave is thus created that
// alternates at these two values at a rate depending on the frequency of the PAO's
// sawtooth, with the pulse width registers controlling the percentage of time that the
// waveform spends at the max value compared to the min value.
//
// Finally, pseudo-random noise is produced by a separate 23-bit linear feedback shift
// register (LFSR). This shift register is clocked by bit 19 of the PAO, so the frequency of
// the noise can be controlled. The values of bits 17 and 22 are exclusive-ored and fed back
// to bit 0. The result is a completely deterministic set of bits that nonetheless "looks"
// random. Eight bits of this register are used as the output; four zeros are added as low
// bits to create a 12-bit noise waveform.
//
// Selection of the waveforms is done with the VCREGx register, which looks like this:
//
// | Bit        | 7     | 6     | 5        | 4        | 3     | 2     | 1     | 0     |
// | ---------- | ----- | ----- | -------- | -------- | ----- | ----- | ----- | ----- |
// | Function   | NOISE | PULSE | SAWTOOTH | TRIANGLE | TEST  | RING  | SYNC  | GATE  |
//
// Bits 4-7 control the output waveform. More than one of these can be selected at a time;
// doing so is *supposed* to (by the documentation) logically and the bits of each waveform
// together. The reality was not so. Combining waveforms creates output that can't be
// accurately modelled; this emulator instead uses samples of actual 6581 output to create
// these "combined waveforms".
//
// The exception is noise; due to a flaw in the chip design (and there were a few; the 6581
// was designed and produced with severe limits on time and silican space), combining
// another waveform with the noise waveform causes the LFSR to fill with zeroes, resulting
// in zero output (and requiring that the chip be reset or the TEST bit to be set and
// cleared before noise can be produced again). This emulator simply returns a 0 value when
// combining noise.
//
// The diagram above has four other bits hinting at other functions. The TEST bit causes
// normal operation of it is low, but if it is set to high, the PAO fills with zeroes, the
// LFSR fills with ones, and the pulse generator latches at max value. Returning TEST to low
// resumes normal operation (including resetting the LFSR so it didn't simply continue to
// produce all 1's).
//
// The SYNC bit controlled synching the PAO with another voice's PAO (the other voice is
// hardcoded; voice 1 used voice 3, voice 2 used voice 1, and voice 3 used voice 2). When
// the synched PAO's MSB transitions from 0 to 1, the current PAO resets to zero no matter
// what value it is at. No other property of the synched PAO matters, only its frequency, so
// the synched voice can still be controlled to produce sound as normal. This mechanism
// allows for the production of much more complex waveforms than one PAO alone could do.
//
// The RING bit controls ring modulation. Ring modulation is only used if the current PAO is
// set to the triangle waveform. In this case, the MSB of the synced PAO is *exclusive-ored*
// with the current PAO's value, meaning that the current PAO output reverses (like the
// triangle wave output) when the synched MSB is 1. This can produce even more complex
// waveforms with a wide range of non-harmonic overtones that can be used for creating
// special effects, including gongs and bells.
//
// The GATE bit has no effect on the waveform generator; it is used by the envelope
// generator that is discussed next.
//
// The high 8 bits of voice 3's waveform generator output are made available in the RANDOM
// register. This is so named because it's common usage to apply a NOISE waveform to voice 3
// and then use this register to generate pseudo-random numbers. The waveform is available
// here even if the voice is not used, because it's never gated (see the GATE bit of the
// envelope generator below) or because it's disconnected (see the DSCNV3 bit in the filter
// discussion even further below).
//
// ### Envelope Generator
//
// Each envelope generator is a simple circuit that produces a value from 0x00 to 0xff on
// every clock cycle. This value behaves in a way determined by the phase that the envelope
// generator is in at the time: either attack, decay, sustain, or release. The result is an
// "envelope", a volume profile that controls the way each note is shaped.
//
// The attack phase begins when the GATE bit of the VCREGx register (seen in the diagram
// just above) is set to 1. The envelope output starts at 0x00 and rises to 0xff at a rate
// determined by the high 4 bits of the ATDCYx register, according to the following table:
//
// | Value | Attack rate |
// | ----- | ----------- |
// | 0x0   | 2 ms        |
// | 0x1   | 8 ms        |
// | 0x2   | 16 ms       |
// | 0x3   | 24 ms       |
// | 0x4   | 38 ms       |
// | 0x5   | 56 ms       |
// | 0x6   | 68 ms       |
// | 0x7   | 80 ms       |
// | 0x8   | 100 ms      |
// | 0x9   | 250 ms      |
// | 0xa   | 500 ms      |
// | 0xb   | 800 ms      |
// | 0xc   | 1 s         |
// | 0xd   | 3 s         |
// | 0xe   | 5 s         |
// | 0xf   | 8 s         |
//
// Once the envelope output reaches 0xff, the decay phase begins. In this phase, the
// envelope output falls at a rate determined by the low 4 bits of the ATDCYx register,
// according to the table above. However, at various points, the decay rate slows. This is
// used to produce a smooth curve from the max value to zero, and it results in the decay
// (and release, see below) phases taking three times as long as the table above.
//
// The decay continues until the envelope output reaches the sustain level, set by the high
// 4 bits of the SURELx register. (Note that unlike attack and decay, this setting does not
// control a *time*, it controls a *level*.) The actual sustain value is derived by doubling
// the hexadecimal digit set in the register; setting sustain to 0xc, for instance, would
// cause the decay phase to end and the sustain phase to begin once the envelope output
// falls to 0xcc. Nothing terribly interesting happens in the sustain phase; the envelope
// output simply stays at the same level.
//
// This phase transitions into the release phase when the GATE bit of the VCREGx register is
// set to 0. The release phase is mechanically exactly the same as the decay phase, except
// that it makes the envelope output decrement all the way to zero rather than to the
// sustain level. The rate at which this happens is controlled by the low 4 bits of the
// SURELx register.
//
// The result is a volume profile that is meant to sound more natural than simply turning a
// waveform on and off to produce a note. It can be used to simulate a number of different
// instruments, from an organ (min attack and release, max sustain) to a percussion
// instrument (min attack, decay fast for a drum or slow for a cymbal, zero sustain). It can
// also be used to produce more unusual effects, such as the reverse envelope (slow attack,
// max sustain, fast release).
//
// The envelope generator has a couple of important bugs that were exploited by software
// engineers and thus need to be emulated as well. The most famous is the ADSR delay bug.
// This bug manifests when an attack, decay, or release value is reset in the middle of its
// phase to a number that has already passed. For example, if the attack is set initially to
// 250ms, and then after half that time it gets reset to 100ms, this bug would happen. The
// attack does not immediately stop and move into the decay phase; instead, the internal
// counter that controls each phase must reach its max value, wrap to zero, and *then* reach
// the new value before the attack will end. This can cause significant enough delays in
// phase transitions to be audible, and it would be used by programmers to create
// interesting sounds.
//
// Another bug skirts the design that once the envelope value does not wrap around once it
// reaches zero. In this case, if an attack is started by setting the GATE bit, and that
// GATE bit is immediately cleared while the envelope output is still zero (starting the
// release phase), then the envelope generator *will* wrap around, basically starting a
// release phase from 0xff rather than just doing nothing as it should have.
//
// The output of voice 3's envelope generator is made available in the ENV3 register.
//
// ### Amplitude modulator
//
// The amplitude modulator basically multiplies the outputs of the waveform and envelope
// generators. The result is the waveform produced by the waveform generator, with its
// volume controlled by the envelope produced by the envelope generator. There is no control
// for the amplitude modulator, and in this emulation, it does not merit a separate file of
// code (it's embedded into voice.js).
//
// ## Filter/mixer
//
// The 6581 also features a single programmable filter. Each voice can either skip the
// filter or be routed through it, and an additional external input (from the EXT pin) can
// be controlled in the same way. Whether or not these four inputs are filtered, they are
// all combined in a mixer at the end which produces the final output.
//
// The 6581's filter is an analog filter, but since we don't have the capability of being
// analog in a computer program, it is emulated digitally. The filter's mode, cutoff
// frequency, and resonance can be changed, along with the selection of voices that are
// routed through it, and these are all controlled by four registers.
//
// The cutoff frequency is controlled by the CUTLO and CUTHI registers. This renders an
// 11-bit number (the top 5 bits of CUTLO are ignored) that determines the frequency at
// which the filter begins to work - if set to low-pass, this is the frequency above which
// volume is lowered; if set to high-pass, this is the frequency *below* which volume is
// lowered; and if set to band-pass, this is the center of the frequencies that are passed
// through unimpeded while both lower *and* higher frequencies are suppressed.
//
// The values in CUTLO and CUTHI do not determine the cutoff frequency directly. In fact,
// the curve for frequencies depending on the register setting is complex and even has a
// discontinuiuty at one point. The cutoff frequency starts at about 220Hz at register value
// zero and rises, slowly at first, and then much more quickly as it approaches the halfway
// register value of 0x3ff; at 0x3ff, the frequency is about 6kHz. Then there is a sudden
// drop to about 4.6kHz at register value 0x400. The frequency then again rises, quickly at
// first and then slower as it approaches the max register value of 0x7ff, where the cutoff
// frequency is about 18kHz. There is no particular model to these values, and they vary
// slightly between chips; the values in this emulator are interpolated from 27 sample
// values taken from a physical 6581 chip.
//
// The cutoff frequency values also depend on the two capacitors external to the chip. One
// is attached across CAP1A and CAP1B, while the other is connected to CAP2A and CAP2B. The
// values selected here assume 470pF capacitors across these pins, as was the case in the
// Commodore 64. The CAP pins are otherwise not emulated.
//
// The other two filter/mixer-related registers have multiple purposes. The RESON register
// controls resonance and which voices are actually filtered:
//
// | Bit        | 7     | 6     | 5     | 4     | 3      | 2      | 1      | 0      |
// | ---------- | ----- | ----- | ----- | ----- | ------ | ------ | ------ | ------ |
// | Function   | RES3  | RES2  | RES1  | RES0  | FILTEX | FILTV3 | FILTV2 | FILTV1 |
//
// Bits 4-7 control the resonance, which essentially causes frequencies near the cutoff
// frequency to be *amplified* before being attentuated beyond the cutoff frequency. This
// was an undesirable artifact in filters originally, but it became useful particularly for
// sound effects and so is often a feature in modern filters. A higher value for resonance
// will cause frequencies near the cutoff frequency to be amplified more.
//
// Bits 0-3 control which voices are sent through the filter in the first place; there is
// one bit for each voice, plus an additional bit to control whether the external input is
// filtered. (The external input is not otherwise controllable; it is either filtered or
// not, and then it's mixed with the signals from the three voices before being output.)
//
// The type of filter is determined by the settings in the final filter register, SIGVOL:
//
// | Bit        | 7      | 6      | 5      | 4      | 3     | 2     | 1     | 0     |
// | ---------- | ------ | ------ | ------ | ------ | ----- | ----- | ----- | ----- |
// | Function   | DSCNV3 | FILTHP | FILTBP | FILTLP | VOL3  | VOL2  | VOL1  | VOL0  |
//
// Bits 4-6 control the filter mode, which is either high-pass, band-pass, or low-pass.
// These modes can be combined (though they must share their cutoff frequencies and
// resonances); a common way to do this is to create a "notch filter" by combining high-pass
// and low-pass filters that reject frequencies near the cutoff frequency in a manner
// opposite to that of a band-pass filter.
//
// Bit 7 allows voice 3 to be disconnected entirely. This is only possible if voice 3 is
// *not* routed through the filter; if it is, the setting of this bit is ignored. This
// option lets voice 3 be used simply for synching or ring modulation without actually
// contributing sound to the output.
//
// The other four bits (0-3) control the master volume of the mixer. All four signals,
// whether they are filtered or unfiltered, are combined by a mixer and the final volume of
// that mixer is controlled by these four bits.
//
// ## External filter
//
// In the physical 6581, the signal that comes out of the mixer is sent directly to the
// AUDIO output pin. However, in the COmmodore 64, this pin is connected to another filter
// external to the 6581, and the output of that filter is actually sent to the audio/video
// connector. For the sake of convenience, that external filter is emulated directly in this
// Ic6581 object.
//
// The external filter is a simple pair of RC filters that is tuned to pass frequencies
// between 16Hz and 16kHz. It is completely passive, neither tunable or otherwise
// controllable (including that it can't be disabled).
//
// ## Potentiometers
//
// Completely unrelated to sound production, the 6581 also dedicates two pins and two
// registers to potentiometer reading. In practice, these potentiometers are almost always
// game paddles, though there is nothing preventing them from being any other kind of device
// that can send a varying voltage to the POTX and POTY pins (via Control Ports 1 and 2).
//
// The physical 6581 expects these to be RC circuits that charge a capacitor at a varying
// rate depending on the value of the resistor (which is a variable resistor - a
// potentiometer - that is normally the game paddle itself). The 6581 circuitry reads the
// capacitor discharge time and translates it to a value between 0x00 and 0xff, which is
// then made available in the appropriate register (POTX register for POTX pin, and POTY
// register for POTY pin). This process takes 512 clock cycles, so the values of the
// registers update that often.
//
// In this emulation, physical processes like capacitor discharge are not modelled, so the
// values on the POTX and POTY pins are simply reflected in their registers (after dropping
// any bits above the eighth). The registers still only update every 512 cycles to be
// consistent with that original behavior.
//
// ## Read-only versus write-only registers
//
// The 6581 is unusual in that it has no registers that can be both read and written. The
// POTX, POTY, RANDOM, and ENV3 registers are read-only; attempting to write to these
// registers has no effect. All of the other registers are write-only, and attempting to
// read them is handled a bit strangely.
//
// When a register is written to in a physical 6581, the value on the data pins lingers on
// the internal data bus for a time. An attempt to read a write-only register would then
// result in that value, no matter which register had been written and no matter which
// write-only register has a read attempted on it. This value on the internal data bus would
// decay over time, causing bits to switch to zero at unpredictable times over the course of
// about two milliseconds. Since that unpredicable behavior is impossible to model (it's
// different on every 6581), the choice here is to return the last written value on any read
// of a write-only register, unless it's been more than 2000 clock cycles since the last
// write. In that case, a zero is returned.
//
// ## Pin interface
//
// The vast majority of interaction with the 6581 is done through setting registers to
// certain values. The main output only takes up one pin. For this reason, despite the
// complexity of the chip internally, it can comfortably fit in a 28-pin package.
//
//            +-----+--+-----+
//      CAP1A |1    +--+   28| Vdd
//      CAP1B |2           27| AUDIO
//      CAP2A |3           26| EXT
//      CAP2B |4           25| Vcc
//        RES |5           24| POTX
//       PHI2 |6           23| POTY
//        R_W |7           22| D7
//         CS |8    6581   21| D6
//         A0 |9           20| D5
//         A1 |10          19| D4
//         A2 |11          18| D3
//         A3 |12          17| D2
//         A4 |13          16| D1
//        GND |14          15| D0
//            +--------------+
//
// Some names are changed from the datasheet, aside from the regular switch from φ2 to PHI2.
// POTX and POTY are called POT X and POT Y respectively, and the audio pins are called EXT
// IN and AUDIO OUT. These are all changed here because spaces are inconvenient.
//
// Pin assignments are explained below.
//
// | Pin | Name  | Description                                                             |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 1   | CAP1A | Filter capacitor connections. One capacitor is connected across CAP1A   |
// | 2   | CAP1B | and CAP1B, and the oher is connected acrros CAP2A and CAP2B. The values |
// | 3   | CAP2A | of these capacitors determine the filter cutoff frequency range. This   |
// | 4   | CAP2B | is emulated by assuming 470pF capacitors.                               |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 5   | RES   | Active low reset pin. If held low for more than 10 clock cycles, this   |
// |     |       | resets the chip. While held low, it causes the noise LFSR in the        |
// |     |       | waveform generators to fill with 1's.                                   |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 6   | PHI2  | Clock input. Should be 1MHz; other values will shift audio frequencies. |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 7   | R_W   | Read (high) or write (low) control for the registers.                   |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 8   | CS    | Active low chip select. Must be low for register reading and writing.   |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 9   | A0    | Address pins, controlling which register is read from/written to. Five  |
// | 10  | A1    | pins can address 32 registers but there are only 29 present; addresses  |
// | 11  | A2    | 0x1d, 0x1e, and 0x1f are unused.                                        |
// | 12  | A3    |                                                                         |
// | 13  | A4    |                                                                         |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 14  | GND   | Electrical ground pin. Not emulated.                                    |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 15  | D0    | Data pins. Data to be written to registers should be given to these     |
// | 16  | D1    | pins, and data read from registers will appear on them.                 |
// | 17  | D2    |                                                                         |
// | 18  | D3    |                                                                         |
// | 19  | D4    |                                                                         |
// | 20  | D5    |                                                                         |
// | 21  | D6    |                                                                         |
// | 22  | D7    |                                                                         |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 23  | POTY  | Potentiometer inputs. These are analog inputs that are expected to be   |
// | 24  | POTX  | between 0x00 and 0xff (if not, the higher bits will be dropped). The    |
// |     |       | values of these pins will be stored in the POTX and POTY registers      |
// |     |       | every 512 clock cycles.                                                 |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 25  | Vcc   | +5V power supply. Not emulated.                                         |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 26  | EXT   | External audio input. This is an analog input whose value will be       |
// |     |       | optionally filtered and then mixed with the voice outputs. Can be any   |
// |     |       | value, but should match the ~20-bit voice outputs.                      |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 27  | AUDIO | Audio output. This is an analog output (about 20 bits) which is the     |
// |     |       | result of the three voices and the external input after filtering,      |
// |     |       | additively mixing, and external filtering.                              |
// | --- | ----- | ----------------------------------------------------------------------- |
// | 28  | Vdd   | +12V power supply. Not emulated.                                        |

import Chip from 'components/chip'
import Pin from 'components/pin'
import Registers from 'components/registers'
import { setMode, valueToPins, pinsToValue, range } from 'utils'
import {
  ATDCY1,
  ATDCY2,
  ATDCY3,
  CUTHI,
  CUTLO,
  FREHI1,
  FREHI2,
  FREHI3,
  FRELO1,
  FRELO2,
  FRELO3,
  POTX,
  PWHI1,
  PWHI2,
  PWHI3,
  PWLO1,
  PWLO2,
  PWLO3,
  RESON,
  SIGVOL,
  SUREL1,
  SUREL2,
  SUREL3,
  UNUSED1,
  VCREG1,
  VCREG2,
  VCREG3,
} from './constants'
import ExternalFilter from './external'
import Filter from './filter'
import Voice from './voice'

const { INPUT, OUTPUT } = Pin

// This is the maximum number of cycles for which a write-only register, when read, will
// return a value of whatever was last written to *any* register. After that number of
// cycles since the last write, any read from a write-only register will result in zero.
// This is a simplification of the actual write-only read model, which fades the value more
// gradually to zero.
const MAX_LAST_WRITE_TIME = 2000

export default function Ic6581() {
  const chip = Chip(
    // Address pins to access internal registers
    Pin(9, 'A0', INPUT),
    Pin(10, 'A1', INPUT),
    Pin(11, 'A2', INPUT),
    Pin(12, 'A3', INPUT),
    Pin(13, 'A4', INPUT),

    // Data bus pins D0...D7. These are bidirectional but the direction is set by the R__W
    // pin.
    Pin(15, 'D0', INPUT),
    Pin(16, 'D1', INPUT),
    Pin(17, 'D2', INPUT),
    Pin(18, 'D3', INPUT),
    Pin(19, 'D4', INPUT),
    Pin(20, 'D5', INPUT),
    Pin(21, 'D6', INPUT),
    Pin(22, 'D7', INPUT),

    // Potentiometer pins. These are analog inputs that are fed to the A/D converters.
    Pin(24, 'POTX', INPUT),
    Pin(23, 'POTY', INPUT),

    // Audio input and output. These are obviously analog and are mostly given names that
    // have spaces in them such as "AUDIO OUT" and "EXT IN"; since that is more difficult
    // to work with the names here are without spaces.
    Pin(27, 'AUDIO', OUTPUT),
    Pin(26, 'EXT', INPUT),

    // Clock input.
    Pin(6, 'PHI2', INPUT),

    // Read/write control pin. If this is high then data is being read from the SID, else
    // data is being written to it.
    Pin(7, 'R_W', INPUT),

    // Chip select pin. If this is high then the data bus is hi-Z stated and no response
    // is made to address pins.
    Pin(8, 'CS', INPUT),

    // Resets the chip when it goes low.
    Pin(5, 'RES', INPUT),

    // Filter capacitor connections. Larger capacitors, necessary for the proper operation
    // of the on-board filters, are connected across these pairs of pins. There is no need
    // to emulate them here.
    Pin(1, 'CAP1A'),
    Pin(2, 'CAP1B'),
    Pin(3, 'CAP2A'),
    Pin(4, 'CAP2B'),

    // Power supply and ground pins. These are not emulated.
    Pin(25, 'Vcc'),
    Pin(28, 'Vdd'),
    Pin(14, 'GND'),
  )

  const addrPins = [...range(5)].map(pin => chip[`A${pin}`])
  const dataPins = [...range(8)].map(pin => chip[`D${pin}`])

  // The 32 addressable registers on the 6581. Only 29 of these are actually used; reading
  // the others will always return 0xff and writing them will have no effect. All are
  // write-only except for the last four in use (which are read-only and marked so here).
  const registers = Registers(
    'FRELO1', //  Voice 1 frequency, low 8 bits
    'FREHI1', //  Voice 1 frequency, high 8 bits
    'PWLO1', //   Voice 1 pulse width, low 8 bits
    'PWHI1', //   Voice 1 pulse width, high 4 bits (bits 4-7 unused)
    'VCREG1', //  Voice 1 control register
    'ATDCY1', //  Voice 1 attack (bits 4-7) and decay (bits 0-3)
    'SUREL1', //  Voice 1 sustain (bits 4-7) and release (bits 0-3)
    'FRELO2', //  Voice 2 frequency, low 8 bits
    'FREHI2', //  Voice 2 frequency, high 8 bits
    'PWLO2', //   Voice 2 pulse width, low 8 bits
    'PWHI2', //   Voice 2 pulse width, high 4 bits (bits 4-7 unused)
    'VCREG2', //  Voice 2 control register
    'ATDCY2', //  Voice 2 attack (bits 4-7) and decay (bits 0-3)
    'SUREL2', //  Voice 2 sustain (bits 4-7) and release (bits 0-3)
    'FRELO3', //  Voice 3 frequency, low 8 bits
    'FREHI3', //  Voice 3 frequency, high 8 bits
    'PWLO3', //   Voice 3 pulse width, low 8 bits
    'PWHI3', //   Voice 3 pulse width, high 4 bits (bits 4-7 unused)
    'VCREG3', //  Voice 3 control register
    'ATDCY3', //  Voice 3 attack (bits 4-7) and decay (bits 0-3)
    'SUREL3', //  Voice 3 sustain (bits 4-7) and release (bits 0-3)
    'CUTLO', //   Filter cutoff frequency, low 3 bits (bits 3-7 unused)
    'CUTHI', //   Filter cutoff frequency, high 8 bits
    'RESON', //   Filter resonance (bits 4-7) and input control (bits 0-3)
    'SIGVOL', //  Filter mode (bits 4-7) and master volume (bits 0-3)
    'POTX', //    Value of potentiometer X (read-only)
    'POTY', //    Value of potentiometer Y (read-only)
    'RANDOM', //  High 8 bits of voice 3 waveform generator (read-only)
    'ENV3', //    Value of voice 3 envelope generator (read-only)
    'UNUSED1', // Unused
    'UNUSED2', // Unused
    'UNUSED3', // Unused
  )

  // The spec says that RES must be low for at least 10 cycles before a reset will occur.
  // This variable is set to 0 when RES first goes low, and each φ2 cycle increments it.
  // When it gets to 10, `reset` will be called.
  let resetClock = 0

  // Flag to know whether the chip has reset since the last time RES went low. This is used
  // to ensure that the chip only resets once, rather than once every 10 cycles as long as
  // RES is held low.
  let hasReset = false

  // The last value that was written to a write-only register. This is used to emulate the
  // way the SID returns that value if a write-only register is read from.
  let lastWriteValue = 0

  // The number of cycles since the last write to a write-only register. After a certain
  // number of these, reading from a write-only register no longer returns the last written
  // value and instead returns 0.
  let lastWriteTime = 0

  // The number of cycles since the last time the potentiometer pins were read and their
  // values stored in the pot registers. This resets after 512 cycles.
  let lastPotTime = 0

  // The waveform generator, envelope generator, and amplitude modulator for the first
  // voice.
  const voice1 = Voice()

  // The waveform generator, envelope generator, and amplitude modulator for the second
  // voice.
  const voice2 = Voice()

  // The waveform generator, envelope generator, and amplitude modulator for the thid
  // voice.
  const voice3 = Voice()

  // The filter for individual voices, plus the mixer that puts them all together into one
  // signal.
  const filter = Filter()

  // The external filter. This is actually, as the name suggests, a circuit that is external
  // to the 6581. It is a high-pass RC filter tuned to 16Hz and a low-pass RC filter tuned
  // to 16kHz. In a physical C-64, this is the only thing that exists between the audio out
  // pin of the 6581 and the audio output pin on the audio/video connector, so it makes
  // sense to have it be a part of a 6581 emulation that is intended only for a C64
  // emulation.
  const extfilter = ExternalFilter()

  // This is the result of a reset according to the specs of the device. This is pretty
  // simple since the only outputs are the data lines and the audio out; all registers are
  // set to zero, audio output is silenced, and data lines are set back to their normal
  // unconnected state.
  //
  // Since the three unused registers always return 0xff, we just set that here and keep it
  // from changing.
  const reset = () => {
    for (const i of range(32)) {
      registers[i] = i >= UNUSED1 ? 0xff : 0x00
    }
    for (const i of range(8)) {
      const name = `D${i}`
      chip[name].mode = OUTPUT
      chip[name].level = null
    }
    voice1.reset()
    voice2.reset()
    voice3.reset()
    filter.reset()
    extfilter.reset()
  }

  // Reads a SID register. This only works as expected for the four read-only registers.
  //
  // The three unused registers always return 0xff. The write-only registers return the
  // value of the last write made to *any* SID register. However, in the real chip this
  // last-write value 'fades' over time until, after 2000-4000 clock cycles, it is zero. The
  // model for this fading is unknown and is not properly emulated here; this emulation
  // simply returns the last written value as long as the last write has happened in the
  // last 2000 cycles; otherwise it returns 0.
  const readRegister = index => (index < POTX ? lastWriteValue : registers[index])

  // Writes a value to a register. This does not affect the read-only and unused registers,
  // and the high byte of the pulse-width registers only sees its low 4 bits written (the
  // high 4 bits remain, as always, 0).
  const writeRegister = (index, value) => {
    if (index === PWHI1 || index === PWHI2 || index === PWHI3) {
      // Strip the upper four bits
      registers[index] = value & 0x0f
    } else if (index === CUTLO) {
      // Strip the upper five bits
      registers[index] = value & 0x07
    } else if (index < POTX) {
      registers[index] = value
    }
    lastWriteValue = value
    lastWriteTime = 0

    switch (index) {
      case FRELO1:
        voice1.frelo(value)
        break
      case FREHI1:
        voice1.frehi(value)
        break
      case PWLO1:
        voice1.pwlo(value)
        break
      case PWHI1:
        voice1.pwhi(value)
        break
      case VCREG1:
        voice1.vcreg(value)
        break
      case ATDCY1:
        voice1.atdcy(value)
        break
      case SUREL1:
        voice1.surel(value)
        break
      case FRELO2:
        voice2.frelo(value)
        break
      case FREHI2:
        voice2.frehi(value)
        break
      case PWLO2:
        voice2.pwlo(value)
        break
      case PWHI2:
        voice2.pwhi(value)
        break
      case VCREG2:
        voice2.vcreg(value)
        break
      case ATDCY2:
        voice2.atdcy(value)
        break
      case SUREL2:
        voice2.surel(value)
        break
      case FRELO3:
        voice3.frelo(value)
        break
      case FREHI3:
        voice3.frehi(value)
        break
      case PWLO3:
        voice3.pwlo(value)
        break
      case PWHI3:
        voice3.pwhi(value)
        break
      case VCREG3:
        voice3.vcreg(value)
        break
      case ATDCY3:
        voice3.atdcy(value)
        break
      case SUREL3:
        voice3.surel(value)
        break
      case CUTLO:
        filter.cutlo(value)
        break
      case CUTHI:
        filter.cuthi(value)
        break
      case RESON:
        filter.reson(value)
        break
      case SIGVOL:
        filter.sigvol(value)
        break
      default:
        break
    }
  }

  const resetListener = () => pin => {
    if (pin.low) {
      resetClock = 0
      voice1.reset(false)
      voice2.reset(false)
      voice3.reset(false)
    } else {
      hasReset = false
    }
  }

  const clockListener = () => pin => {
    if (pin.high) {
      // Check to see if RES has been held low for 10 cycles; if so, perform the reset
      if (chip.RES.low && !hasReset) {
        resetClock += 1
        if (resetClock >= 10) {
          reset()
          hasReset = true
        }
      }

      // Check to see if last written value has bled off internal data bus yet
      lastWriteTime += 1
      if (lastWriteTime >= MAX_LAST_WRITE_TIME) {
        lastWriteValue = 0
      }

      // Check to see if pots should be read (once every 512 clock cycles); if so, load
      // their registers with values off the pins
      lastPotTime += 1
      if (lastPotTime >= 512) {
        lastPotTime = 0
        registers.POTX = chip.POTX.level & 0xff
        registers.POTY = chip.POTY.level & 0xff
      }

      // Clock sound components and put their output on the AUDIO pin
      voice1.clock()
      voice2.clock()
      voice3.clock()
      filter.clock(voice1.output, voice2.output, voice3.output, chip.EXT.level)
      extfilter.clock(filter.output)
      chip.AUDIO.level = extfilter.output

      registers.RANDOM = (voice3.waveform.output >> 4) & 0xff
      registers.ENV3 = voice3.envelope.output
    }
  }

  const enableListener = () => pin => {
    if (pin.high) {
      setMode(OUTPUT, ...dataPins)
      valueToPins(null, ...dataPins)
    } else {
      const index = pinsToValue(...addrPins)
      if (chip.R_W.high) {
        valueToPins(readRegister(index), ...dataPins)
      } else {
        setMode(INPUT, ...dataPins)
        writeRegister(index, pinsToValue(...dataPins))
      }
    }
  }

  chip.RES.addListener(resetListener())
  chip.PHI2.addListener(clockListener())
  chip.CS.addListener(enableListener())

  voice1.sync(voice3)
  voice2.sync(voice1)
  voice3.sync(voice2)

  return Object.assign(chip, {
    get registers() {
      return registers
    },
  })
}
