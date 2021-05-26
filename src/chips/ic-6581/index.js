// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Chip from 'components/chip'
import Pin from 'components/pin'
import Registers from 'components/registers'
import { setMode, valueToPins, pinsToValue, range } from 'utils'
import { UNUSED1, POTX, PWHI1, PWHI2, PWHI3, MAX_LAST_WRITE_TIME } from './constants'

const { INPUT, OUTPUT } = Pin

export default class Ic6581 extends Chip {
  // The 32 addressable registers on the 6581. Only 29 of these are actually used; reading
  // the others will always return 0xff and writing them will have no effect.
  #registers = new Registers(
    'FRELO1',
    'FREHI1',
    'PWLO1',
    'PWHI1',
    'VCREG1',
    'ATDCY1',
    'SUREL1',
    'FRELO2',
    'FREHI2',
    'PWLO2',
    'PWHI2',
    'VCREG2',
    'ATDCY2',
    'SUREL2',
    'FRELO3',
    'FREHI3',
    'PWLO3',
    'PWHI3',
    'VCREG3',
    'ATDCY3',
    'SUREL3',
    'CUTLO',
    'CUTHI',
    'RESON',
    'SIGVOL',
    'POTX',
    'POTY',
    'RANDOM',
    'ENV3',
    'UNUSED1',
    'UNUSED2',
    'UNUSED3',
  )

  // The spec says that _RES must be low for at least 10 cycles before a reset will occur.
  // This variable is set to 0 when _RES first goes low, and each φ2 cycle increments it.
  // When it gets to 10, `reset()` will be called.
  /** @type {number} */
  #resetClock = 0

  // Flag to know whether the chip has reset since the last time _RES went low. This is used
  // to ensure that the chip only resets once, rather than once every 10 cycles as long as
  // _RES is held low.
  /** @type {boolean} */
  #hasReset = false

  // The last value that was written to a write-only register. This is used to emulate the
  // way the SID returns that value if a write-only register is read from.
  /** @type {number} */
  #lastWriteValue = 0

  // The number of cycles since the last write to a write-only register. After a certain
  // number of these, reading from a write-only register no longer returns the last written
  // value and instead returns 0.
  /** @type {number} */
  #lastWriteTime = 0

  constructor() {
    super(
      // Address pins to access internal registers
      new Pin(9, 'A0', INPUT),
      new Pin(10, 'A1', INPUT),
      new Pin(11, 'A2', INPUT),
      new Pin(12, 'A3', INPUT),
      new Pin(13, 'A4', INPUT),

      // Data bus pins D0...D7. These are bidirectional but the direction is set by the R__W
      // pin.
      new Pin(15, 'D0', INPUT),
      new Pin(16, 'D1', INPUT),
      new Pin(17, 'D2', INPUT),
      new Pin(18, 'D3', INPUT),
      new Pin(19, 'D4', INPUT),
      new Pin(20, 'D5', INPUT),
      new Pin(21, 'D6', INPUT),
      new Pin(22, 'D7', INPUT),

      // Potentiometer pins. These are analog inputs that are fed to the A/D converters.
      new Pin(24, 'POTX', INPUT),
      new Pin(23, 'POTY', INPUT),

      // Audio input and output. These are obviously analog and are mostly given names that
      // have spaces in them such as "AUDIO OUT" and "EXT IN"; since that is more difficult
      // to work with the names here are without spaces.
      new Pin(27, 'AUDIO', OUTPUT),
      new Pin(26, 'EXT', INPUT),

      // Clock input.
      new Pin(6, 'φ2', INPUT),

      // Read/write control pin. If this is high then data is being read from the SID, else
      // data is being written to it.
      new Pin(7, 'R__W', INPUT),

      // Chip select pin. If this is high then the data bus is hi-Z stated and no response
      // is made to address pins.
      new Pin(8, '_CS', INPUT),

      // Resets the chip when it goes low.
      new Pin(5, '_RES', INPUT),

      // Filter capacitor connections. Larger capacitors, necessary for the proper operation
      // of the on-board filters, are connected across these pairs of pins. There is no need
      // to emulate them here.
      new Pin(1, 'CAP1A'),
      new Pin(2, 'CAP1B'),
      new Pin(3, 'CAP2A'),
      new Pin(4, 'CAP2B'),

      // Power supply and ground pins. These are not emulated.
      new Pin(25, 'Vcc'),
      new Pin(28, 'Vdd'),
      new Pin(14, 'GND'),
    )

    // -------------------------------------------------------------------
    // Reset

    this._RES.addListener(pin => {
      if (pin.low) {
        this.#resetClock = 0
      } else {
        this.#hasReset = false
      }
    })

    this.φ2.addListener(pin => {
      if (pin.high && this._RES.low && !this.#hasReset) {
        this.#resetClock += 1
        if (this.#resetClock >= 10) {
          this.#reset()
          this.#hasReset = true
        }
      }
    })

    // Keeps track of how many cycles have passed since the last write to
    // a write-only register. If it has exceeded max, then lastWriteValue
    // becomes 0.
    this.φ2.addListener(pin => {
      if (pin.high) {
        this.#lastWriteTime += 1
        if (this.#lastWriteTime > MAX_LAST_WRITE_TIME) {
          this.#lastWriteValue = 0
        }
      }
    })

    const addrPins = [...range(5)].map(pin => this[`A${pin}`])
    const dataPins = [...range(8)].map(pin => this[`D${pin}`])

    // -------------------------------------------------------------------
    // Register reading and writing

    // Reads and writes between the data bus and the registers only
    // happens on translation of _CS from high to low.
    this._CS.addListener(pin => {
      if (pin.high) {
        setMode(OUTPUT, ...dataPins)
        valueToPins(null, ...dataPins)
      } else {
        const index = pinsToValue(...addrPins)
        if (this.R__W.high) {
          valueToPins(this.#readRegister(index), ...dataPins)
        } else {
          setMode(INPUT, ...dataPins)
          this.#writeRegister(index, pinsToValue(...dataPins))
        }
      }
    })
  }

  // This is the result of a reset according to the specs of the device. This is pretty
  // simple since the only outputs are the data lines and the audio out; all registers are
  // set to zero, audio output is silenced, and data lines are set back to their normal
  // unconnected state.
  //
  // Since the three unused registers always return 0xff, we just set that here and keep it
  // from changing.
  //
  // TODO: For now, we're simply setting the registers directly rather than using the
  // `writeRegister` function to do it because there are no side effects in writing them;
  // when sound is implemented this may or may not change.
  #reset() {
    for (const i of range(32)) {
      this.#registers[i] = i >= UNUSED1 ? 0xff : 0x00
    }
    for (const i of range(8)) {
      const name = `D${i}`
      this[name].mode = OUTPUT
      this[name].level = null
    }
  }

  // Reads a SID register. This only works as expected for the four
  // read-only registers.
  //
  // The three unused registers always return 0xff. The write-only
  // registers return the value of the last write made to *any* SID
  // register. However, in the real chip this last-write value 'fades'
  // over time until, after 2000-4000 clock cycles, it is zero. The
  // model for this fading is unknown and is not properly emulated here;
  // this emulation simply returns the last written value as long as the
  // last write has happened in the last 2000 cycles; otherwise it
  // returns 0.
  #readRegister(index) {
    if (index < POTX) {
      return this.#lastWriteValue
    }
    return this.#registers[index]
  }

  // Writes a value to a register. This does not affect the read-only
  // and unused registers, and the high byte of the pulse-width
  // registers only sees its low 4 bits written (the high 4 bits remain,
  // as always, 0).
  #writeRegister(index, value) {
    if (index === PWHI1 || index === PWHI2 || index === PWHI3) {
      // Strip the upper four bits so that the register always has 0's
      // there
      this.#registers[index] = value & 0x0f
      this.#lastWriteTime = 0
    } else if (index < POTX) {
      this.#registers[index] = value
      this.#lastWriteTime = 0
    }
  }
}
