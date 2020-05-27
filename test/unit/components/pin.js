// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "test/helper"
import { newPin } from "components/new-pin"
import {
  modeInitial,
  modeChange,
  modeOutToIn,
  modeUncToOut,
  modeBidiToIn,
  modeUncToIn,
  modeBidiToOut,
  modeInToUnc,
} from "./pin/mode"
import {
  levelNoTrace,
  levelUnconnected,
  levelInput,
  levelOutput,
  levelBidirectional,
  levelOptions,
  levelToggleHigh,
  levelToggleLow,
  levelToggleNone,
  levelUpdateNoTrace,
} from "./pin/level"
import {
  puInitial,
  puUnconnected,
  puInput,
  puOutput,
  puBidirectional,
  puAfter,
  pdInitial,
  pdUnconnected,
  pdInput,
  pdOutput,
  pdBidirectional,
  pdAfter,
  fltInitial,
  fltPullUp,
  fltPullDown,
} from "./pin/float"
import {
  listenerInput,
  listenerOutput,
  listenerBidirectional,
  listenerUnconnected,
  listenerDirect,
  listenerRemove,
  listenerNonexistent,
  listenerDouble,
} from "./pin/listener"
import { arrayContains, arrayByNumber, arrayByName } from "./pin/array"

describe("Pin", () => {
  const test = fn => () => fn()

  it("has a number", () => {
    const p = newPin(1, "A")
    expect(p.number).to.equal(1)
  })

  it("has a name", () => {
    const p = newPin(1, "A")
    expect(p.name).to.equal("A")
  })

  describe("mode", () => {
    it("sets the initial mode in the factory function", test(modeInitial))
    it("can be changed after creation", test(modeChange))
    it("causes its trace to update after mode change from out to in", test(modeOutToIn))
    it("causes its trace to update after mode change from bidi to in", test(modeBidiToIn))
    it("does not change trace after mode change from unc to in", test(modeUncToIn))
    it("does not change trace after mode change from bidi to out", test(modeBidiToOut))
    it("causes its trace to update after mode change from unc to out", test(modeUncToOut))
    it("does not change trace after mode change from in to unc", test(modeInToUnc))
  })

  describe("level", () => {
    it("can be set arbitrarily for pins without a trace", test(levelNoTrace))
    it("cannot update level if no trace", test(levelUpdateNoTrace))
    it("can be set for unconnected pins and does not affect its trace", test(levelUnconnected))
    it("can only be set by its trace for input pins", test(levelInput))
    it("sets its trace's value for output pins", test(levelOutput))
    it("sets and accepts values from its trace for bidirectional pins", test(levelBidirectional))
    it("has optional methods for setting 1, 0, and null", test(levelOptions))

    describe("toggle", () => {
      it("changes a low to a high", test(levelToggleHigh))
      it("changes a high to a low", test(levelToggleLow))
      it("does not change a none", test(levelToggleNone))
    })

    describe("pullUp", () => {
      it("sets a pin's initial value to 1", test(puInitial))
      it("sets a pin's level if it is otherwise set to null", test(puUnconnected))
      it("sets a pin's level if a trace sets it to null", test(puInput))
      it("will set a trace's level if an output pin goes null", test(puOutput))
      it("will set a trace's level if a bidirectional pin goes null", test(puBidirectional))
      it("will set a null pin to 1 if applied after the fact", test(puAfter))
    })

    describe("pullDown", () => {
      it("sets a pin's initial value to 0", test(pdInitial))
      it("sets a pin's level if it is otherwise set to null", test(pdUnconnected))
      it("sets a pin's level if a trace sets it to null", test(pdInput))
      it("will set a trace's level if an output pin goes null", test(pdOutput))
      it("will set a trace's level if a bidirectional pin goes null", test(pdBidirectional))
      it("will set a null pin to 0 if applied after the fact", test(pdAfter))
    })

    describe("float", () => {
      it("sets a pin's initial value to null", test(fltInitial))
      it("removes a pin's pull up effect", test(fltPullUp))
      it("removes a pin's pull down effect", test(fltPullDown))
    })
  })

  describe("listeners", () => {
    it("will not call a listener on an unconnected pin", test(listenerUnconnected))
    it("will call a listener on an input pin", test(listenerInput))
    it("will not call a listener on an output pin", test(listenerOutput))
    it("will call a listener on a bidirectional pin", test(listenerBidirectional))
    it("will not call a listener if the pin is changed directly", test(listenerDirect))
    it("will not call a removed listener", test(listenerRemove))
    it("will do nothing when removing an unadded listener", test(listenerNonexistent))
    it("will not call a listener twice if it's added twice", test(listenerDouble))
  })

  describe("pin arrays", () => {
    it("will contain any pins passed in the factory function", test(arrayContains))
    it("can look up included pins by number", test(arrayByNumber))
    it("can look up included pins by name", test(arrayByName))
  })
})
