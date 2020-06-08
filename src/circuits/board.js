// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// ROM images
import { AddressCircuit } from "./address"
import { DataCircuit } from "./data"
import { ControlCircuit } from "./control"
import { IoCircuit } from "./io"

import { basic } from "rom/basic"
import { kernal } from "rom/kernal"
import { character } from "rom/character"

// Processor chips
import { Ic6510 } from "chips/ic-6510"
import { Ic6526 } from "chips/ic-6526"
import { Ic6567 } from "chips/ic-6567"
import { Ic6581 } from "chips/ic-6581"

// Memory chips
import { Ic2114 } from "chips/ic-2114"
import { Ic2332 } from "chips/ic-2332"
import { Ic2364 } from "chips/ic-2364"
import { Ic4164 } from "chips/ic-4164"

// Logic chips
import { Ic4066 } from "chips/ic-4066"
import { Ic7406 } from "chips/ic-7406"
import { Ic7408 } from "chips/ic-7408"
import { Ic74139 } from "chips/ic-74139"
import { Ic74257 } from "chips/ic-74257"
import { Ic74258 } from "chips/ic-74258"
import { Ic74373 } from "chips/ic-74373"
import { Ic82S100 } from "chips/ic-82S100"

// Ports
import { CassettePort } from "ports/cassette-port"
import { Control1Port } from "ports/control-1-port"
import { Control2Port } from "ports/control-2-port"
import { ExpansionPort } from "ports/expansion-port"
import { KeyboardPort } from "ports/keyboard-port"
import { SerialPort } from "ports/serial-port"
import { UserPort } from "ports/user-port"

export function newBoard() {
  const chips = {
    U1: Ic6526(),
    U2: Ic6526(),
    U3: Ic2364(basic),
    U4: Ic2364(kernal),
    U5: Ic2332(character),
    U6: Ic2114(),
    U7: Ic6510(),
    U8: Ic7406(),
    U9: Ic4164(),
    U10: Ic4164(),
    U11: Ic4164(),
    U12: Ic4164(),
    U13: Ic74257(),
    U14: Ic74258(),
    U15: Ic74139(),
    U16: Ic4066(),
    U17: Ic82S100(),
    U18: Ic6581(),
    U19: Ic6567(),
    U21: Ic4164(),
    U22: Ic4164(),
    U23: Ic4164(),
    U24: Ic4164(),
    U25: Ic74257(),
    U26: Ic74373(),
    U27: Ic7408(),
    U28: Ic4066(),
  }

  const ports = {
    CN1: KeyboardPort(),
    CN2: UserPort(),
    CN3: CassettePort(),
    CN4: SerialPort(),
    CN6: ExpansionPort(),
    CN8: Control2Port(),
    CN9: Control1Port(),
  }

  const address = AddressCircuit(chips, ports)
  const data = DataCircuit(chips, ports)
  const control = ControlCircuit(chips, ports)
  const io = IoCircuit(chips, ports)

  return { ...chips, ...ports, ...address, ...data, ...control, ...io }
}
