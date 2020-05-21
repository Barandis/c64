/**
 * Copyright (c) 2020 Thomas J. Otterson
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// ROM images
import { basic } from "rom/basic"
import { kernal } from "rom/kernal"
import { character } from "rom/character"

// Processor chips
import { new6510 } from "chips/6510"
import { new6526 } from "chips/6526"
import { new6567 } from "chips/6567"
import { new6581 } from "chips/6581"

// Memory chips
import { new2114 } from "chips/2114"
import { new2332 } from "chips/2332"
import { new2364 } from "chips/2364"
import { new4164 } from "chips/4164"

// Logic chips
import { new4066 } from "chips/4066"
import { new7406 } from "chips/7406"
import { new7408 } from "chips/7408"
import { new74139 } from "chips/74139"
import { new74257 } from "chips/74257"
import { new74258 } from "chips/74258"
import { new74373 } from "chips/74373"
import { new82S100 } from "chips/82S100"

// Ports
import { newCassettePort } from "ports/cassette-port"
import { newControl1Port } from "ports/control-1-port"
import { newControl2Port } from "ports/control-2-port"
import { newExpansionPort } from "ports/expansion-port"
import { newKeyboardPort } from "ports/keyboard-port"
import { newSerialPort } from "ports/serial-port"
import { newUserPort } from "ports/user-port"
import { wireAddressBus } from "./address"

export function newBoard() {
  const chips = {
    U1: new6526(),
    U2: new6526(),
    U3: new2364(basic),
    U4: new2364(kernal),
    U5: new2332(character),
    U6: new2114(),
    U7: new6510(),
    U8: new7406(),
    U9: new4164(),
    U10: new4164(),
    U11: new4164(),
    U12: new4164(),
    U13: new74257(),
    U14: new74258(),
    U15: new74139(),
    U16: new4066(),
    U17: new82S100(),
    U18: new6581(),
    U19: new6567(),
    U21: new4164(),
    U22: new4164(),
    U23: new4164(),
    U24: new4164(),
    U25: new74257(),
    U26: new74373(),
    U27: new7408(),
    U28: new4066(),
  }

  const ports = {
    CN1: newKeyboardPort(),
    CN2: newUserPort(),
    CN3: newCassettePort(),
    CN4: newSerialPort(),
    CN6: newExpansionPort(),
    CN8: newControl1Port(),
    CN9: newControl2Port(),
  }

  const addressLines = wireAddressBus(chips, ports)

  return { ...addressLines }
}
