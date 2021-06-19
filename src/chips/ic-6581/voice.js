// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import WaveformGenerator from './waveform'
import EnvelopeGenerator from './envelope'

// The value of the waveform generator that corresponds to zero in the output waveform.
// Since the 12-bit waveform output ranges from 0x000 to 0xfff, this value *should* be in
// the middle, at 0x800. However, actual measurement of the zero-output voltages on the
// 6581's output pins showed that the actual zero value was much lower.
//
// It's entirely possible that different chips could lead to different zero values, but they
// all should be similar enough that this value will suffice for emulation.
/** @type {number} */
const waveformZero = 0x380

// It turns out that the D/A converter in the 6581 (which is not emulated since the
// emulation is entirely digital) adds an additional DC offset to the output signal. This
// was also measured directly on a physical 6581 to be about this value.
/** @type {number} */
const voiceOffset = 0x800 * 0xff

// An emulation of a single 6581 voice, including a waveform generator, an envelope
// generator, and an amplitude modulator. The waveform and envelope generators are created
// from their respective classes, while the amplitude modulator is built into this class (in
// the `output` method).
//
// This is a pretty straightforward class, consisting largely of methods that delegate to
// the underlying waveform and envelope generators. The amplitude modulator is fashioned by
// simply multiplying the outputs of the generators, adjusting the output value with the
// DC offsets that have been found in the actual chip.
export default class Voice {
  // This voice's waveform generator.
  /** @type {WaveformGenerator} */
  #waveform

  // This voice's envelope generator.
  /** @type {EnvelopeGenerator} */
  #envelope

  constructor() {
    this.#waveform = new WaveformGenerator()
    this.#envelope = new EnvelopeGenerator()

    this.reset()
  }

  // Sets the lower 8 bits of the frequency of this voice's waveform generator.
  /** @param {number} value */
  set frelo(value) {
    this.#waveform.frelo = value
  }

  // Sets the upper 8 bits of the frequency of this voice's waveform generator.
  /** @param {number} value */
  set frehi(value) {
    this.#waveform.frehi = value
  }

  // Sets the lower 8 bits of the pulse width of this voice's waveform generator.
  /** @param {number} value */
  set pwlo(value) {
    this.#waveform.pwlo = value
  }

  // Sets the upper 4 bits of the pulse width of this voice's waveform generator. The high 4
  // bits of the passed value are ignored.
  /** @param {number} value */
  set pwhi(value) {
    this.#waveform.pwhi = value
  }

  // Sets the value of the control register for this voice. Setting bit 0 to a different
  // value than it previously had will initiate the attack phase (0 -> 1) or the release
  // phase (1 -> 0) of the envelope generator.
  /** @param {number} value */
  set vcreg(value) {
    this.#waveform.vcreg = value
    this.#envelope.vcreg = value
  }

  // Sets the attack (upper 4 bits) and the decay (lower 4 bits) for this voice's envelope
  // generator.
  /** @param {number} value */
  set atdcy(value) {
    this.#envelope.atdcy = value
  }

  // Sets the sustain (upper 4 bits) and the release (lower 4 bits) for this voice's
  // envelope generator.
  /** @param {number} value */
  set surel(value) {
    this.#envelope.surel = value
  }

  // Resets the voice. This delegates to the reset methods for the voice's waveform and
  // envelope generator. `value` is the state of the _RES pin; returning it to high will
  // perform the actual reset, but this value is necessary because the waveform generator's
  // LFSR will behave differently while the _RES pin is held low.
  /** @param {boolean} value */
  reset(value = true) {
    this.#waveform.reset(value)
    this.#envelope.reset(value)
  }

  // Clocks the waveform and envelope generators so that they calculate their next output
  // values.
  clock() {
    this.#waveform.clock()
    this.#envelope.clock()
  }

  // Returns a reference to this voice's waveform generator.
  /** @returns {WaveformGenerator} */
  get waveform() {
    return this.#waveform
  }

  // Returns a reference to this voice's envelope generator.
  /** @returns {EnvelopeGenerator} */
  get envelope() {
    return this.#envelope
  }

  // Calculates the output of the voice on this clock cycle. This function emulates the
  // "Amplitude Modulator" listed on the 6581 block diagram on its datasheet. The amplitude
  // modulator is simple enough that it is integrated directly into the voice, rather than
  // having a separate class for it and having Voice combine all three.
  /** @returns {number} */
  get output() {
    return (this.#waveform.output - waveformZero) * this.#envelope.output + voiceOffset
  }

  // Syncs another voice to this voice. This is used by the waveform generator when the
  // SYNC or RING bits are set in the control register.
  /** @param {Voice} value */
  set sync(value) {
    this.#waveform.sync = value.waveform
  }
}
