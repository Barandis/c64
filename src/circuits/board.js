// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// ROM images
import { AddressCircuit } from './address'
import { DataCircuit } from './data'
import { ControlCircuit } from './control'
import { IoCircuit } from './io'

import { basic, kernal, character } from 'rom'
import {
  Ic6510,
  Ic6526,
  Ic6567,
  Ic6581,
  Ic2114,
  Ic2332,
  Ic2364,
  Ic4164,
  Ic4066,
  Ic7406,
  Ic7408,
  Ic74139,
  Ic74257,
  Ic74258,
  Ic74373,
  Ic82S100,
} from 'chips'
import {
  CassettePort,
  Control1Port,
  Control2Port,
  ExpansionPort,
  KeyboardPort,
  SerialPort,
  UserPort,
} from 'ports'

export function Board() {
  const chips = {
    U1: Ic6526(),
    U2: Ic6526(),
    U3: new Ic2364(basic),
    U4: new Ic2364(kernal),
    U5: new Ic2332(character),
    U6: new Ic2114(),
    U7: new Ic6510(),
    U8: new Ic7406(),
    U9: new Ic4164(),
    U10: new Ic4164(),
    U11: new Ic4164(),
    U12: new Ic4164(),
    U13: new Ic74257(),
    U14: new Ic74258(),
    U15: new Ic74139(),
    U16: new Ic4066(),
    U17: new Ic82S100(),
    U18: Ic6581(),
    U19: new Ic6567(),
    U21: new Ic4164(),
    U22: new Ic4164(),
    U23: new Ic4164(),
    U24: new Ic4164(),
    U25: new Ic74257(),
    U26: new Ic74373(),
    U27: new Ic7408(),
    U28: new Ic4066(),
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
