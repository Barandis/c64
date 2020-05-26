/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expect } from "test/helper"
import { valueToPins, pinsToValue, setMode } from "utils"
import { newBoard } from "circuits/board"
import { INPUT } from "components/pin"

describe("Memory reading/writing", () => {
  let board

  beforeEach(() => {
    board = newBoard()

    // Set normal values for PLA inputs
    const { U7, U19 } = board
    U19._CAS.value = 1
    U7.P0.value = 1
    U7.P1.value = 1
    U7.P2.value = 1
    U19.BA.value = 1
    U19.AEC.value = 1
  })

  describe("CIA 1, address $DC00...$DCFF", () => {
    it("reads a value out of the correct register", () => {
      const { A0, A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11, A12, A13, A14, A15 } = board.U7
      const { D0, D1, D2, D3, D4, D5, D6, D7, R__W } = board.U7

      const addressPins = [A0, A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11, A12, A13, A14, A15]
      const dataPins = [D0, D1, D2, D3, D4, D5, D6, D7]

      // manually load the CIA 1 DDRA register with a value to read
      valueToPins(0x2f, ...dataPins)
      valueToPins(0x2, A0, A1, A2, A3)
      R__W.clear()
      board.U15._Y20.clear()

      // Value is written, reset everything
      board.U15._Y20.set()
      R__W.set()
      valueToPins(0, A0, A1, A2, A3)
      valueToPins(0, ...dataPins)

      // Try to read value from register
      setMode(INPUT, ...dataPins)
      valueToPins(0xdc02, ...addressPins)
      expect(pinsToValue(...dataPins)).to.equal(0x2f)
    })
  })
})
