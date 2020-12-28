// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Sinon from 'sinon'

import {
  levelDirectUnconnected, levelDirectInput, levelDirectHiOutput,
  levelDirectLoOutput, levelDirectNullOutput, levelPinUnconnected,
  levelPinInput, levelPinOutput, levelPinBidirectional, levelPinHiOutputs,
  levelPinLoOutputs,
} from './trace/level'
import {
  puInitial, puModeInput, puNoOutputs, puHiOutputs, puLoOutputs, puNullOutputs,
  pdInitial, pdModeInput, pdNoOutputs, pdHiOutputs, pdLoOutputs, pdNullOutputs,
  pnInitial, pnModeInput, pnNoOutputs, pnHiOutputs, pnLoOutputs, pnNullOutputs,
} from './trace/float'

import { assert } from 'test/helper'
import Pin from 'components/pin'
import Trace from 'components/trace'

const INPUT = Pin.INPUT

describe('Trace', () => {
  const test = fn => () => fn()

  it('doesn\'t add a pin twice', () => {
    const p = new Pin(1, 'A', INPUT)
    const t = new Trace(p, p)
    const spy = Sinon.spy()
    p.addListener(spy)
    t.level = 1
    assert(spy.calledOnce)
  })

  describe('level', () => {
    describe('from direct setting', () => {
      it(
        'can be set when unconnected',
        test(levelDirectUnconnected),
      )
      it(
        'can be set when connected to inputs',
        test(levelDirectInput),
      )
      it(
        'is set high when connected to high outputs',
        test(levelDirectHiOutput),
      )
      it(
        'is set low when connected to low outputs',
        test(levelDirectLoOutput),
      )
      it(
        'can be set when connected to null outputs',
        test(levelDirectNullOutput),
      )
    })

    describe('from pin setting', () => {
      it(
        'isn\'t set by unconnected pins',
        test(levelPinUnconnected),
      )
      it(
        'isn\'t set by input pins',
        test(levelPinInput),
      )
      it(
        'is set by output pins',
        test(levelPinOutput),
      )
      it(
        'is set by bidi pins, but also sets them',
        test(levelPinBidirectional),
      )
      it(
        'is set by output pins even with competing high output pins',
        test(levelPinHiOutputs),
      )
      it(
        'is set by output pins even with competing low output pins',
        test(levelPinLoOutputs),
      )
    })

    describe('pullUp', () => {
      it(
        'sets intitial level to 1',
        test(puInitial),
      )
      it(
        'pulls up when pin mode changes to input',
        test(puModeInput),
      )
      it(
        'pulls up when no outputs are connected',
        test(puNoOutputs),
      )
      it(
        'does not pull up with connected high outputs',
        test(puHiOutputs),
      )
      it(
        'does not pull up with connected low outputs',
        test(puLoOutputs),
      )
      it(
        'pulls up when all connected outputs are null',
        test(puNullOutputs),
      )
    })

    describe('pullDown', () => {
      it(
        'sets intitial level to 0',
        test(pdInitial),
      )
      it(
        'pulls down when pin mode changes to input',
        test(pdModeInput),
      )
      it(
        'pulls down when no outputs are connected',
        test(pdNoOutputs),
      )
      it(
        'does not pull down with connected high outputs',
        test(pdHiOutputs),
      )
      it(
        'does not pull down with connected low outputs',
        test(pdLoOutputs),
      )
      it(
        'pulls down when all connected outputs are null',
        test(pdNullOutputs),
      )
    })

    describe('float', () => {
      it(
        'sets intitial level to null',
        test(pnInitial),
      )
      it(
        'floats when pin mode changes to input',
        test(pnModeInput),
      )
      it(
        'floats when no outputs are connected',
        test(pnNoOutputs),
      )
      it(
        'does not float with connected high outputs',
        test(pnHiOutputs),
      )
      it(
        'does not float with connected low outputs',
        test(pnLoOutputs),
      )
      it(
        'floats when all connected outputs are null',
        test(pnNullOutputs),
      )
    })
  })
})
