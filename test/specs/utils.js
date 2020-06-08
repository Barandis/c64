// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { range, enumerate } from "utils"
import { assertArray, assert } from "test/helper"

describe("Utils", () => {
  describe("range", () => {
    it("can produce an exclusive range with a step", () => {
      assertArray([...range(1, 11, 2)], [1, 3, 5, 7, 9])
    })

    it("can produce an inclusive range with a step", () => {
      assertArray([...range(1, 11, 2, true)], [1, 3, 5, 7, 9, 11])
    })

    it("can produce an exclusive range stepping by 1", () => {
      assertArray([...range(1, 6)], [1, 2, 3, 4, 5])
    })

    it("can produce an inclusive range stepping by 1", () => {
      assertArray([...range(1, 6, true)], [1, 2, 3, 4, 5, 6])
    })

    it("can produce an exclusive range starting from 0", () => {
      assertArray([...range(5)], [0, 1, 2, 3, 4])
    })

    it("can produce an inclusive range starting from 0", () => {
      assertArray([...range(5, true)], [0, 1, 2, 3, 4, 5])
    })

    it("can produce an exclusive reverse range with a step", () => {
      assertArray([...range(11, 1, 2)], [11, 9, 7, 5, 3])
    })

    it("can produce an inclusive reverse range with a step", () => {
      assertArray([...range(11, 1, 2, true)], [11, 9, 7, 5, 3, 1])
    })

    it("can produce an exclusive reverse range stepping by 1", () => {
      assertArray([...range(6, 1)], [6, 5, 4, 3, 2])
    })

    it("can produce an inclusive reverse range stepping by 1", () => {
      assertArray([...range(6, 1, true)], [6, 5, 4, 3, 2, 1])
    })

    it("can produce an exclusive reverse range starting from 0", () => {
      assertArray([...range(-5)], [0, -1, -2, -3, -4])
    })

    it("can produce an inclusive reverse range starting from 0", () => {
      assertArray([...range(-5, true)], [0, -1, -2, -3, -4, -5])
    })

    it("changes the step to 1 if you try to make it 0", () => {
      assertArray([...range(1, 6, 0)], [1, 2, 3, 4, 5])
    })
  })

  describe("enumerate", () => {
    it("produces index, element pairs from an array", () => {
      const array = ["one", "two", "three", "four", "five"]
      for (const [index, element] of enumerate(array)) {
        assert(array[index] === element)
      }
    })

    it("produces index, letter pairs from a string", () => {
      const str = "012345"
      for (const [index, letter] of enumerate(str)) {
        assert(letter === index.toString())
      }
    })

    it("produces index, element pairs from other iterables", () => {
      for (const [index, element] of enumerate(range(0, 5, 2))) {
        assert(index * 2 === element)
      }
    })
  })
})
