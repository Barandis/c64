// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import Sinon from "sinon"

import { expect } from "test/helper"
import {
  Pin, INPUT, OUTPUT, UNCONNECTED, BIDIRECTIONAL,
} from "components/pin"
import { Trace } from "components/trace"

export function listenerUnconnected() {
  const p = Pin(1, "A", UNCONNECTED)
  const t = Trace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  expect(spy).not.to.be.called
}

export function listenerInput() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  expect(spy).to.be.calledOnce
  expect(spy).to.be.calledWith(p)
}

export function listenerOutput() {
  const p = Pin(1, "A", OUTPUT)
  const t = Trace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  expect(spy).not.to.be.called
}

export function listenerBidirectional() {
  const p = Pin(1, "A", BIDIRECTIONAL)
  const t = Trace(p)

  const spy = Sinon.spy()
  p.addListener(spy)

  t.set()
  expect(spy).to.be.calledOnce
  expect(spy).to.be.calledWith(p)
}

export function listenerDirect() {
  const p = Pin(1, "A", INPUT)

  const spy = Sinon.spy()
  p.addListener(spy)

  expect(spy).not.to.be.called
}

export function listenerRemove() {
  const p = Pin(1, "A", INPUT)
  const t = Trace(p)

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
  const p = Pin(1, "A", INPUT)
  const t = Trace(p)

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
  const p = Pin(1, "A", INPUT)
  const t = Trace(p)

  const spy = Sinon.spy()
  p.addListener(spy)
  p.addListener(spy)

  t.set()
  expect(spy).to.be.calledOnce
}
