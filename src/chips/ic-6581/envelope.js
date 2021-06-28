// Copyright (c) 2021 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { bitSet, hi4, lo4 } from 'utils'
import { GATE } from './constants'

// Constants representing the envelope generator's current phase. These are the possible
// values of the `#phase` property.
const ATTACK = 0
const DECAY_SUSTAIN = 1
const RELEASE = 2

// The number of clock cycles between increments of the envelope counter during attack,
// based on the attack value. These values are determined by experiment and don't always
// match up with what would be calculated given the time values.
//
// For example, the lowest setting (2ms attack) can be calculated by multiplying the 2ms by
// 1MHz (the clock speed) and then dividing that by 256 (the number of envelope counter
// increments to go from 0 to full volume); that value would be 7.81, but experiment shows
// this setting actually increments the envelope counter every 9 cycles.
//
// This table is also used by decay and release for envelope counter decrements; however,
// the addition of the exponential counter during these phases triples the time that the
// phase actually takes with the given value (the fastest value for decay/release is
// actually 6ms).
const RATE_TARGETS = [
  9, //      2ms =     7.81 periods
  32, //     8ms =    31.25 periods
  63, //    16ms =    62.50 periods
  95, //    24ms =    93.75 periods
  149, //   38ms =   148.44 periods
  220, //   56ms =   218.75 periods
  267, //   68ms =   265.63 periods
  313, //   80ms =   312.50 periods
  392, //  100ms =   390.63 periods
  977, //  250ms =   976.56 periods
  1954, // 500ms =  1953.13 periods
  3126, // 800ms =  3125.00 periods
  3907, //    1s =  3906.25 periods
  11720, //   3s = 11718.75 periods
  19532, //   5s = 19531.25 periods
  31251, //   8s = 31250.00 periods
]

// These are easily generatable, but putting them in an array is a bit faster.
const SUSTAIN_LEVELS = [
  0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff,
]

// A single envelope generator, one of three that appears on a 6581 SID.
//
// The envelope generator is used to modify the amplitude of the sound that comes from one
// of the oscillator/waveform generators. It takes the flat, single-amplitude sound that the
// oscillator generates and adds dynamics depending on parameters in the ATDCY and SUREL
// registers that are associated with that envelope generator (there are three envelope
// generators, so there is an ATDCY1 register, an ATDCY2 register, and so on).
//
// Each envelope generator is in one of four phases: attack, decay, sustain, or release. The
// attack phase begins when the GATE bit of the VCREG register is set to 1. The envelope
// counter then increases linearly at a rate determined by the value of the high 4 bits of
// the ATDCY register until it reaches the maximum value of 0xff, and that's when the decay
// phase begins. The envelope counter then decreases, this time at the rate determined by
// the value of the *low* four bits of the ATDCY register. When it reaches the level
// determined by the high 4 bits of the SUREL register, the envelope counter stops
// decreasing and holds steady (the sustain phase) until the GATE bit of the VCREG register
// is set to 0. At that point the release phase begins, and the envelope counter again
// descencds (this time at a rate determined by the bottom 4 bits of SUREL) until it reaches
// 0x00.
//
// Unlike in the attack phase, the envelope counter does not change linearly in the decay or
// release phases. Instead, the rate falls off step by step to simulate a smooth exponential
// curve.
//
// The actual 6581 uses a pair of shift register/PLA combos to provide the logic to control
// how quickly the envelope counter is incremented or decremented. While we do actually
// implement a shift register for oscillator noise production, the shift registers here
// require neither tapping nor feedback, so they are much more simply implemented as a
// counter and a set of tables to provide targets.
export default function EnvelopeGenerator() {
  // The envelope counter. The purpose of the envelope generator is to calculate this
  // number, which is then readable via the `output` method.
  let envelope = 0

  // The 4-bit attack value. Each value corresponds to an attack of a certain length, which
  // is given in the `RATE_TARGETS` array above.
  let attack = 0

  // The 4-bit decay value. Each value corresponds to a decay of a certain length, assuming
  // a sustain level of 0x00 (the decay will be cut short if a higher sustain level is
  // reached first). This is given in the `RATE_TARGETS` table, except that exponentiation
  // causes the true decay value to be three times that listed.
  let decay = 0

  // The 4-bit sustain value. This value represents the volume at which decay will cease and
  // the note will be held until the GATE bit clears and release begins.
  let sustain = 0

  // The 4-bit release value. Each value corresponds to a release of a certain length,
  // assuming a sustain level of 0xff (the release will be shorter with any lower sustain
  // level).T his is given in the `RATE_TARGETS` table, except that exponentiation causes
  // the true release value to be three times that listed.
  let release = 0

  // The value of the GATE bit of this envelope generator's VCREG register. When this
  // changes from `false` to `true`, a new attack begins; when it changes from `true` to
  // `false`, release begins.
  let gate = false

  // The internal counter that determines when the envelope counter changes. Each time this
  // value reaches its target, the envelope counter is increased (on attach) or decreased by
  // 1.
  let rateCounter = 0

  // A separate counter that can cause the envelope counter to take multiple rate counter
  // periods before it decrements (between 1 period and 30). This is used to gradually slow
  // the decay/release into a simulated exponential curve.
  let falloffCounter = 0

  // The target value for the rate counter to reach before the envelope counter can be
  // incremented. This will always be one of the values in the `RATE_TARGETS` table above.
  let rateTarget = RATE_TARGETS[0]

  // The number of rate counter periods that must elapse before the envelope counter
  // decrements. This is increased from 1 to 2, 4, 8, 16, and finally 30 at certain envelope
  // counter values.
  let falloffTarget = 1

  // Tracks the phase of the envelope generator. This is either ATTACK, DECAY_SUSTAIN, or
  // RELEASE.
  let phase = RELEASE

  // Determines whether the envelope counter is capable of changing any further. Once the
  // counter reaches 0, it cannot move until the next attack. This is used to skip logic
  // that wouldn't run anyway becuase the envelope counter value is 0 and to implement the
  // "bug" that causes the envelope counter to wrap to $0xff when setting GATE high and then
  // immediately setting it low.
  let zeroFreeze = true

  return {
    // Processes changes to the appropriate VCREG register. The envelope generator is only
    // concerned with the GATE bit of this register; when it is set, the
    // attack/decay/sustain sequence begins, and when it is cleared, the release begins.
    vcreg(value) {
      const nextGate = bitSet(value, GATE)

      if (!gate && nextGate) {
        // If the GATE bit has just been set, then start the attack. Starting the attack
        // automatically unfreezes the zero falloff counter.
        phase = ATTACK
        rateTarget = RATE_TARGETS[attack]
        zeroFreeze = false
      } else if (gate && !nextGate) {
        // If the GATE bit has just been cleared, then start the release.
        phase = RELEASE
        rateTarget = RATE_TARGETS[release]
      }

      gate = nextGate
    },

    // Processes changes to the appropriate ATDCY register. This sets 4-bit values for
    // attack and decay. If the voice is currently in the phase corresponding to an
    // attack/decay value that has changed, a new rate target will be chosen. This can cause
    // the ADSR delay bug detailed in the `clock` method below.
    atdcy(value) {
      attack = hi4(value)
      decay = lo4(value)
      if (phase === ATTACK) {
        rateTarget = RATE_TARGETS[attack]
      } else if (phase === DECAY_SUSTAIN) {
        rateTarget = RATE_TARGETS[decay]
      }
    },

    // Processes changes to the appropriate SUREL register. This sets 4-bit values for
    // sustain and release. If the sustain changes to a higher value during sustain itself,
    // then the envelope counter will simply start decrementing again as though back in
    // decay. If the release changes to a value that the rate counter has already passed,
    // then the ADSR delay bug will manifest and the next attack may be delayed.
    surel(value) {
      sustain = hi4(value)
      release = lo4(value)
      if (phase === RELEASE) {
        rateTarget = RATE_TARGETS[release]
      }
    },

    reset(value = true) {
      if (value) {
        envelope = 0

        attack = 0
        decay = 0
        sustain = 0
        release = 0

        gate = false

        rateCounter = 0
        falloffCounter = 0
        // eslint-disable-next-line prefer-destructuring
        rateTarget = RATE_TARGETS[0]
        falloffTarget = 1

        phase = RELEASE
        zeroFreeze = true
      }
    },

    // Called when the SID's clock pin goes high. This manipulates three separate counters
    // that control the envelope generator output.
    //
    // 1. The rate counter increments by 1 with every clock. If it has not reached its target
    //    (which is determined by the settings in the attack, decay, and release registers),
    //    then this method does nothing until called again on the next clock.
    // 2. Once the rate counter reaches its target, the envelope counter is either incremented
    //    (on attack) or decremented (on decay or release). The envelope counter changes
    //    counting directions after reaching 0xff on attack (it changes to decay/sustain phase
    //    at that point) and stops descending when it reaches the sustain level and, after the
    //    release phase is entered, at 0x00.
    // 3. The falloff counter changes at certain breakpoints of the envelope counter as it
    //    descends. This counter acts in much the same way as the rate counter; the envelope
    //    counter doesn't change until the falloff counter reaches its target. The breakpoints
    //    and targets are chosen to make a smooth exponential decay/release curve, which
    //    sounds more natural.
    //
    //    This exponential curve also happens to take three times longer to complete than a
    //    linear curve; hence all of the SID documentation giving values for decay/release as
    //    three times the length of attack.
    clock() {
      // If we reach 0x8000 on the rate counter, we wrap it back around to 0 and keep going.
      // This is the implementation of the ADSR delay bug...if a parameter is changed so that
      // the rate target changes, and the rate counter has not yet reached the original
      // target, and the new target is *lower* than the current value of the rate counter,
      // then the rate counter will have to count to 0x8000, wrap around to 0, and then count
      // up to the new target. This will likely cause a delay in the next phase starting.
      rateCounter = (rateCounter + 1) & 0x7fff

      // If the incremented rate counter hasn't reached its target, do nothing. Check again on
      // the next clock cycle.
      if (rateCounter === rateTarget) {
        rateCounter = 0
        falloffCounter += 1

        if (phase === ATTACK || falloffCounter === falloffTarget) {
          // The falloff counter resets on attack or when it reaches its target value.
          falloffCounter = 0

          // If the envelope counter is frozen at zero, it is just that...it no longer changes
          // (until the next attack), so we return skip everything else and just return.
          if (!zeroFreeze) {
            switch (phase) {
              case ATTACK:
                // Increment the envelope counter by one until it reaches 0xff, at which time
                // the phase changes to the decay/sustain phase.
                envelope = (envelope + 1) & 0xff
                if (envelope === 0xff) {
                  phase = DECAY_SUSTAIN
                  rateTarget = RATE_TARGETS[decay]
                }
                break

              case DECAY_SUSTAIN:
                // Decrement the envelope counter by one unless it's already reached the
                // sustain level.
                if (envelope !== SUSTAIN_LEVELS[sustain]) {
                  envelope -= 1
                }
                break

              case RELEASE:
                // Decrement the envelope counter until it reaches zero (the stop at zero is
                // enforced by the next switch block). The bitwise AND is here because if the
                // phase is shifted to ATTACK and then immediately to RELEASE, the envelope
                // counter will set to 0xff and begin counting from there.
                envelope = (envelope - 1) & 0xff
                break

              default:
                break
            }

            // Change the value of the exponential target each time the envelope counter
            // reaches a certain breakpoint. There is not a separate curve for decay and
            // release; they both share the same set of breakpoints. This breakpoint/target
            // combination is engineered to simulate a smooth exponential curve.
            switch (envelope) {
              case 0xff:
                falloffTarget = 1
                break
              case 0x5d:
                falloffTarget = 2
                break
              case 0x36:
                falloffTarget = 4
                break
              case 0x1a:
                falloffTarget = 8
                break
              case 0x0e:
                falloffTarget = 16
                break
              case 0x06:
                falloffTarget = 30
                break
              case 0x00:
                falloffTarget = 1
                // Lock the envelope counter at zero. This zero freeze is removed the next
                // time an attack phase is started.
                zeroFreeze = true
                break
              default:
                break
            }
          }
        }
      }
    },

    get output() {
      return envelope
    },
  }
}
