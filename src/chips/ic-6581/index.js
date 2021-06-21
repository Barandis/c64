// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

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
  ENV3,
  FREHI1,
  FREHI2,
  FREHI3,
  FRELO1,
  FRELO2,
  FRELO3,
  MAX_LAST_WRITE_TIME,
  POTX,
  POTY,
  PWHI1,
  PWHI2,
  PWHI3,
  PWLO1,
  PWLO2,
  PWLO3,
  RANDOM,
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
  #resetClock = 0

  // Flag to know whether the chip has reset since the last time _RES went low. This is used
  // to ensure that the chip only resets once, rather than once every 10 cycles as long as
  // _RES is held low.
  #hasReset = false

  // The last value that was written to a write-only register. This is used to emulate the
  // way the SID returns that value if a write-only register is read from.
  #lastWriteValue = 0

  // The number of cycles since the last write to a write-only register. After a certain
  // number of these, reading from a write-only register no longer returns the last written
  // value and instead returns 0.
  #lastWriteTime = 0

  // The number of cycles since the last time the potentiometer pins were read and their
  // values stored in the pot registers. This resets after 512 cycles.
  #lastPotTime = 0

  // The waveform generator, envelope generator, and amplitude modulator for the first
  // voice.
  #voice1

  // The waveform generator, envelope generator, and amplitude modulator for the second
  // voice.
  #voice2

  // The waveform generator, envelope generator, and amplitude modulator for the thid
  // voice.
  #voice3

  // The filter for individual voices, plus the mixer that puts them all together into one
  // signal.
  #filter

  // The external filter. This is actually, as the name suggests, a circuit that is external
  // to the 6581. It is a high-pass RC filter tuned to 16Hz and a low-pass RC filter tuned
  // to 16kHz. In a physical C-64, this is the only thing that exists between the audio out
  // pin of the 6581 and the audio output pin on the audio/video connector, so it makes
  // sense to have it be a part of a 6581 emulation that is intended only for a C-64
  // emulation.
  #extfilter

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
    // Internal components

    this.#voice1 = new Voice()
    this.#voice2 = new Voice()
    this.#voice3 = new Voice()
    this.#filter = new Filter()
    this.#extfilter = new ExternalFilter()

    this.#voice1.sync = this.#voice3
    this.#voice2.sync = this.#voice1
    this.#voice3.sync = this.#voice2

    // -------------------------------------------------------------------
    // Reset

    this._RES.addListener(pin => {
      if (pin.low) {
        this.#resetClock = 0
        this.#voice1.reset(false)
        this.#voice2.reset(false)
        this.#voice3.reset(false)
      } else {
        this.#hasReset = false
      }
    })

    this.φ2.addListener(pin => {
      if (pin.high) {
        // Check to see if _RES has been held low for 10 cycles; if so, perform the reset
        if (this._RES.low && !this.#hasReset) {
          this.#resetClock += 1
          if (this.#resetClock >= 10) {
            this.#reset()
            this.#hasReset = true
          }
        }

        // Check to see if last written value has bled off internal data bus yet
        this.#lastWriteTime += 1
        if (this.#lastWriteTime > MAX_LAST_WRITE_TIME) {
          this.#lastWriteValue = 0
        }

        // Check to see if pots should be read (once every 512 clock cycles); if so, load
        // their registers with values off the pins
        this.#lastPotTime += 1
        if (this.#lastPotTime >= 512) {
          this.#lastPotTime = 0
          this.#registers[POTX] = this.POTX.level & 0xff
          this.#registers[POTY] = this.POTY.level & 0xff
        }

        // Clock sound components and put their output on the AUDIO pin
        this.#voice1.clock()
        this.#voice2.clock()
        this.#voice3.clock()
        this.#filter.clock(
          this.#voice1.output,
          this.#voice2.output,
          this.#voice3.output,
          this.EXT.level,
        )
        this.#extfilter.clock(this.#filter.output)
        this.AUDIO.level = this.#extfilter.output

        this.#registers[RANDOM] = (this.#voice3.waveform.output >> 4) & 0xff
        this.#registers[ENV3] = this.#voice3.envelope.output
      }
    })

    const addrPins = [...range(5)].map(pin => this[`A${pin}`])
    const dataPins = [...range(8)].map(pin => this[`D${pin}`])

    // -------------------------------------------------------------------
    // Register reading and writing

    // Reads and writes between the data bus and the registers only happens on transition of
    // _CS from high to low.
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
  #reset() {
    for (const i of range(32)) {
      this.#registers[i] = i >= UNUSED1 ? 0xff : 0x00
    }
    for (const i of range(8)) {
      const name = `D${i}`
      this[name].mode = OUTPUT
      this[name].level = null
    }
    this.#voice1.reset()
    this.#voice2.reset()
    this.#voice3.reset()
    this.#filter.reset()
    this.#extfilter.reset()
  }

  // Reads a SID register. This only works as expected for the four read-only registers.
  //
  // The three unused registers always return 0xff. The write-only registers return the
  // value of the last write made to *any* SID register. However, in the real chip this
  // last-write value 'fades' over time until, after 2000-4000 clock cycles, it is zero. The
  // model for this fading is unknown and is not properly emulated here; this emulation
  // simply returns the last written value as long as the last write has happened in the
  // last 2000 cycles; otherwise it returns 0.
  #readRegister(index) {
    if (index < POTX) {
      return this.#lastWriteValue
    }
    return this.#registers[index]
  }

  // Writes a value to a register. This does not affect the read-only and unused registers,
  // and the high byte of the pulse-width registers only sees its low 4 bits written (the
  // high 4 bits remain, as always, 0).
  #writeRegister(index, value) {
    if (index === PWHI1 || index === PWHI2 || index === PWHI3) {
      // Strip the upper four bits
      this.#registers[index] = value & 0x0f
    } else if (index === CUTLO) {
      // Strip the upper five bits
      this.#registers[index] = value & 0x07
    } else if (index < POTX) {
      this.#registers[index] = value
    }
    this.#lastWriteTime = 0

    switch (index) {
      case FRELO1:
        this.#voice1.frelo = value
        break
      case FREHI1:
        this.#voice1.frehi = value
        break
      case PWLO1:
        this.#voice1.pwlo = value
        break
      case PWHI1:
        this.#voice1.pwhi = value
        break
      case VCREG1:
        this.#voice1.vcreg = value
        break
      case ATDCY1:
        this.#voice1.atdcy = value
        break
      case SUREL1:
        this.#voice1.surel = value
        break
      case FRELO2:
        this.#voice2.frelo = value
        break
      case FREHI2:
        this.#voice2.frehi = value
        break
      case PWLO2:
        this.#voice2.pwlo = value
        break
      case PWHI2:
        this.#voice2.pwhi = value
        break
      case VCREG2:
        this.#voice2.vcreg = value
        break
      case ATDCY2:
        this.#voice2.atdcy = value
        break
      case SUREL2:
        this.#voice2.surel = value
        break
      case FRELO3:
        this.#voice3.frelo = value
        break
      case FREHI3:
        this.#voice3.frehi = value
        break
      case PWLO3:
        this.#voice3.pwlo = value
        break
      case PWHI3:
        this.#voice3.pwhi = value
        break
      case VCREG3:
        this.#voice3.vcreg = value
        break
      case ATDCY3:
        this.#voice3.atdcy = value
        break
      case SUREL3:
        this.#voice3.surel = value
        break
      case CUTLO:
        this.#filter.cutlo = value
        break
      case CUTHI:
        this.#filter.cuthi = value
        break
      case RESON:
        this.#filter.reson = value
        break
      case SIGVOL:
        this.#filter.sigvol = value
        break
      default:
        break
    }
  }

  dump() {
    return {
      registers: this.#registers,
      pins: [...range(28, true)].map(index => this[index]),
    }
  }
}
