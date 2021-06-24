// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Sinon from 'sinon'

import { assert } from 'test/helper'
import Pin from 'components/pin'
import Trace from 'components/trace'

const { UNCONNECTED, INPUT, OUTPUT, BIDIRECTIONAL } = Pin

export function listenerUnconnected() {
  const p = Pin(1, 'A', UNCONNECTED)
  const t = Trace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  assert(spy.notCalled)
}

export function listenerInput() {
  const p = Pin(1, 'A', INPUT)
  const t = Trace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  assert(spy.calledOnceWith(p))
}

export function listenerOutput() {
  const p = Pin(1, 'A', OUTPUT)
  const t = Trace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  assert(spy.notCalled)
}

export function listenerBidirectional() {
  const p = Pin(1, 'A', BIDIRECTIONAL)
  const t = Trace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  assert(spy.calledOnceWith(p))
}

export function listenerDirect() {
  const p = Pin(1, 'A', INPUT)

  const spy = Sinon.spy()
  p.addListener(spy)

  assert(spy.notCalled)
}

export function listenerRemove() {
  const p = Pin(1, 'A', INPUT)
  const t = Trace(p)

  const spy1 = Sinon.spy()
  const spy2 = Sinon.spy()

  p.addListener(spy1)
  p.addListener(spy2)

  t.set()
  assert(spy1.calledOnce)
  assert(spy2.calledOnce)

  p.removeListener(spy1)

  t.clear()
  assert(spy1.calledOnce)
  assert(spy2.calledTwice)
}

export function listenerNonexistent() {
  const p = Pin(1, 'A', INPUT)
  const t = Trace(p)

  const spy1 = Sinon.spy()
  const spy2 = Sinon.spy()

  p.addListener(spy2)

  t.set()
  assert(spy1.notCalled)
  assert(spy2.calledOnce)

  p.removeListener(spy1)

  t.clear()
  assert(spy1.notCalled)
  assert(spy2.calledTwice)
}

export function listenerDouble() {
  const p = Pin(1, 'A', INPUT)
  const t = Trace(p)

  const spy = Sinon.spy()
  p.addListener(spy)
  p.addListener(spy)

  t.set()
  assert(spy.calledOnce)
}
