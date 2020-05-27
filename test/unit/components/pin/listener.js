// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import Sinon from "sinon"
import { newPin, INPUT, OUTPUT, UNCONNECTED, BIDIRECTIONAL } from "components/pin"
import { newTrace } from "components/trace"

export function listenerUnconnected() {
  const p = newPin(1, "A", UNCONNECTED)
  const t = newTrace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  expect(spy).not.to.be.called
}

export function listenerInput() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  expect(spy).to.be.calledOnce
  expect(spy).to.be.calledWith(p)
}

export function listenerOutput() {
  const p = newPin(1, "A", OUTPUT)
  const t = newTrace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  expect(spy).not.to.be.called
}

export function listenerBidirectional() {
  const p = newPin(1, "A", BIDIRECTIONAL)
  const t = newTrace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  expect(spy).to.be.calledOnce
  expect(spy).to.be.calledWith(p)
}

export function listenerDirect() {
  const p = newPin(1, "A", INPUT)

  const spy = Sinon.spy()
  p.addListener(spy)

  expect(spy).not.to.be.called
}

export function listenerRemove() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p)

  const spy1 = Sinon.spy()
  const spy2 = Sinon.spy()

  p.addListener(spy1)
  p.addListener(spy2)

  t.set()
  expect(spy1).to.be.calledOnce
  expect(spy2).to.be.calledOnce

  p.removeListener(spy1)

  t.clear()
  expect(spy1).to.be.calledOnce
  expect(spy2).to.be.calledTwice
}

export function listenerNonexistent() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p)

  const spy1 = Sinon.spy()
  const spy2 = Sinon.spy()

  p.addListener(spy2)

  t.set()
  expect(spy1).not.to.be.called
  expect(spy2).to.be.calledOnce

  p.removeListener(spy1)

  t.clear()
  expect(spy1).not.to.be.called
  expect(spy2).to.be.calledTwice
}

export function listenerDouble() {
  const p = newPin(1, "A", INPUT)
  const t = newTrace(p)

  const spy = Sinon.spy()
  p.addListener(spy)
  p.addListener(spy)

  t.set()
  expect(spy).to.be.calledOnce
}
