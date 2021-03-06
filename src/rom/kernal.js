// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { decode } from 'utils'

const base64
  = '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'
  + '/xhgySLQCKXUSQGF1KkiYAlApsfwAgmAptjwAsbYroYCIBPqILbmaKil2PACRtRoqmgYWGAgs+'
  + 'jm06XVxdOwP8lP8DKtkgLwA0xn6abW4BmQByDq6MbWptYW2VbZ6LXZCYCV2cql1RhpKIXVtdkw'
  + 'A8rQ+Uzw6cbWIHzoqQCF02Cm1tAGhtNoaNCdyobWIGzlpNWE02BIhdeKSJhIqQCF0KTTpdcQA0'
  + 'zU58kN0ANMkejJIJAQyWCQBCnf0AIpPyCE5kyT5qbY8ANMl+bJFNAumNAGIAHnTHPnIKHoiITT'
  + 'ICTqyLHRiJHRyLHziJHzyMTV0O+pIJHRrYYCkfMQTabU8ANMl+bJEtAChcfJE9ADIGblyR3QF8'
  + 'ggs+iE04jE1ZAJxtYgfOigAITTTKjmyRHQHRiYaSio5tbF1ZDs8OrG1ukokASF09D4IHzoTKjm'
  + 'IMvoTETsKX/Jf9ACqV7JIJADTJHmyQ3QA0yR6KbU0D/JFNA3pNWx0ckg0ATE09AHwE/wJCBl6a'
  + 'TVICTqiLHRyJHRiLHzyJHziMTT0O+pIJHRrYYCkfPm2Eyo5qbY8AUJQEyX5skR0Bam1vA3xtal'
  + '0zjpKJAEhdMQKiBs5dAlyRLQBKkAhcfJHdASmPAJIKHoiITTTKjmIAHnTKjmyRPQBiBE5Uyo5g'
  + 'mAIMvoTE/sRsmm1ujgGdADIOrotdkQ9IbWTGzlogCG2IbHhtSG0yB86Eyo5qICqQDF0/AHGGko'
  + 'ytD2YMbWYKICqSfF0/AHGGkoytD2YKbW4BnwAubWYKIP3dro8ATKEPhgjoYCYJAFHJ+cHh+egZ'
  + 'WWl5iZmpulrEilrUilrkilr0ii/8bWxsnOpQLoIPDp4BiwDL3x7IWstdogyOkw7CD/6aIAtdkp'
  + 'f7TaEAIJgJXZ6OAY0O+l8QmAhfGl2RDD5tbupQKpf40A3K0B3Mn7CKl/jQDcKNALoADqytD8iN'
  + 'D5hMam1miFr2iFrmiFrWiFrGCm1ui12RD7jqUC4BjwDpAMIOrorqUCysbWTNrmpaxIpa1Ipa5I'
  + 'pa9IohnKIPDp7KUCkA7wDL3v7IWstdggyOkw6SD/6aIX7KUCkA+12il/tNkQAgmAldrK0OyupQ'
  + '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'

export const kernal = decode(base64)
