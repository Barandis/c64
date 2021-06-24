// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// An emulation of the 6581 Sound Interface Device.
//
// The 6581 was designed and as an advanced (for 1982) synthesizer, something that would set
// the new Commodore 64 apart from similar home computers. It has three individual
// oscillators that are each controlled with their own envelope generators and amplitude
// modulators. The outputs from these "voices" can optionally then be sent through a
// programmable audio filter (analog in the physical 6581, simulated digitally here), and
// then they are mixed for output.

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
  MAX_LAST_WRITE_TIME,
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
      if (lastWriteTime > MAX_LAST_WRITE_TIME) {
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
