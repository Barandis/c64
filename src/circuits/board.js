// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// ROM images
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
  ControlPort1,
  ControlPort2,
  ExpansionPort,
  KeyboardPort,
  SerialPort,
  UserPort,
} from 'ports'
import AddressCircuit from './address'
import DataCircuit from './data'
import ControlCircuit from './control'
import IoCircuit from './io'

export default function Board() {
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
    CN8: ControlPort2(),
    CN9: ControlPort1(),
  }

  const address = AddressCircuit(chips, ports)
  const data = DataCircuit(chips, ports)
  const control = ControlCircuit(chips, ports)
  const io = IoCircuit(chips, ports)

  return { ...chips, ...ports, ...address, ...data, ...control, ...io }
}
