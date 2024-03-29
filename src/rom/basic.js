// Copyright (c) 2020 Thomas J. Otterson
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { decode } from 'utils'

const base64 =
  'lON740NCTUJBU0lDMKhBpx2t96ikq76rgLAFrKSpn6hwqCepHKiCqNGoOqkuqEqpLLhn4VXhZOGysyO4f6qfqlaom6ZdpoWq\
  KeG94cbheqtBpjm8zLxYvBADfbOes3G/l+Dque2/ZOJr4rTiDuMNuHy3ZbStt4u37LYAtyy3N7d5abh5Urh7Krp7Ebt/er9Q6\
  K9G5a99s79a065kFbBFTsRGT9JORVjUREFUwUlOUFVUo0lOUFXUREnNUkVBxExF1EdPVM9SVc5JxlJFU1RPUsVHT1NVwlJFVF\
  VSzlJFzVNUT9BPzldBSdRMT0HEU0FWxVZFUklG2URFxlBPS8VQUklOVKNQUklO1ENPTtRMSVPUQ0zSQ03EU1nTT1BFzkNMT1P\
  FR0XUTkXXVEFCqFTPRs5TUEOoVEhFzk5P1FNURdCrraqv3kFOxE/Svr28U0fOSU7UQULTVVPSRlLFUE/TU1HSUk7ETE/HRVjQ\
  Q0/TU0nOVEHOQVTOUEVFy0xFzlNUUqRWQcxBU8NDSFKkTEVGVKRSSUdIVKRNSUSkR88AVE9PIE1BTlkgRklMRdNGSUxFIE9QR\
  c5GSUxFIE5PVCBPUEXORklMRSBOT1QgRk9VTsRERVZJQ0UgTk9UIFBSRVNFTtROT1QgSU5QVVQgRklMxU5PVCBPVVRQVVQgRk\
  lMxU1JU1NJTkcgRklMRSBOQU3FSUxMRUdBTCBERVZJQ0UgTlVNQkXSTkVYVCBXSVRIT1VUIEZP0lNZTlRB2FJFVFVSTiBXSVR\
  IT1VUIEdPU1XCT1VUIE9GIERBVMFJTExFR0FMIFFVQU5USVTZT1ZFUkZMT9dPVVQgT0YgTUVNT1LZVU5ERUYnRCBTVEFURU1F\
  TtRCQUQgU1VCU0NSSVDUUkVESU0nRCBBUlJB2URJVklTSU9OIEJZIFpFUs9JTExFR0FMIERJUkVD1FRZUEUgTUlTTUFUQ8hTV\
  FJJTkcgVE9PIExPTsdGSUxFIERBVMFGT1JNVUxBIFRPTyBDT01QTEXYQ0FOJ1QgQ09OVElOVcVVTkRFRidEIEZVTkNUSU/OVk\
  VSSUbZTE9BxJ6hrKG1ocKh0KHiofCh/6EQoiWiNaI7ok+iWqJqonKif6KQop2iqqK6osii1aLkou2iAKMOox6jJKODow1PSw0\
  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\
  gAJEkpnGkcoZ6hHtgIIqtIPe3IP2uTJ63pWYwnaVhyZGwlyCbvKVkpGWEFIUVYKUVSKUUSCD3t6AAsRSoaIUUaIUVTKKzIOu3\
  iqAAkRRgIOu3hkmiACB5APADIPG3hkqgALEURUolSfD4YKkRoL9MZ7ggjLqlZkn/hWZFboVvpWFMarggmbmQPCCMutADTPy7p\
  nCGVqJppWmo8M445WHwJJAShGGkboRmSf9pAKAAhFaiYdAEoACEcMn5MMeopXBWASCwuSRvEFegYeBp8AKgaThJ/2VWhXC5BA\
  D1BIVluQMA9QOFZLkCAPUChWO5AQD1AYVisAMgR7mgAJgYpmLQSqZjhmKmZIZjpmWGZKZwhmWEcGkIySDQ5KkAhWGFZmBlVoV\
  wpWVlbYVlpWRlbIVkpWNla4VjpWJlaoViTDa5aQEGcCZlJmQmYyZiEPI45WGwx0n/aQGFYZAO5mHwQmZiZmNmZGZlZnBgpWZJ\
  /4VmpWJJ/4VipWNJ/4VjpWRJ/4VkpWVJ/4VlpXBJ/4Vw5nDQDuZl0ArmZNAG5mPQAuZiYKIPTDekoiW0BIRwtAOUBLQClAO0A\
  ZQCpGiUAWkIMOjw5ukIqKVwsBQWAZAC9gF2AXYBdgJ2A3YEasjQ7BhggQAAAAADf15Wy3mAE5sLZIB2OJMWgjiqOyCANQTzNI\
  E1BPM0gIAAAACAMXIX+CArvPACEANMSLKlYel/SKmAhWGp1qC5IGe4qduguSAPu6m8oLkgULipwaC5IEPgqeCguSBnuGggfr2\
  p5aC5IIy60ANMi7ogt7qpAIUmhSeFKIUppXAgWbqlZSBZuqVkIFm6pWMgWbqlYiBeukyPu9ADTIO5SgmAqJAZGKUpZW2FKaUo\
  ZWyFKKUnZWuFJ6UmZWqFJmYmZidmKGYpZnCYStDWYIUihCOgBLEihW2IsSKFbIixIoVriLEihW5FZoVvpW4JgIVqiLEihWmlY\
  WClafAfGGVhkAQwHRgsEBRpgIVh0ANM+7ilb4VmYKVmSf8wBWhoTPe4TH65IAy8qvAQGGkCsPKiAIZvIHe45mHw52CEIAAAAC\
  AMvKn5oLqiAIZvIKK7TBK7IIy68HYgG7ypADjlYYVhILe65mHwuqL8qQGkasRi0BCka8Rj0AqkbMRk0ASkbcRlCCqQCeiVKfA\
  yEDSpASiwDgZtJmwmayZqsOYwzhDiqKVt5WWFbaVs5WSFbKVr5WOFa6Vq5WKFaphMT7upQNDOCgoKCgoKhXAoTI+7ohRMN6Sl\
  JoVipSeFY6UohWSlKYVlTNe4hSKEI6AEsSKFZYixIoVkiLEihWOIsSKFZgmAhWKIsSKFYYRwYKJcLKJXoADwBKZJpEogG7yGI\
  oQjoASlZZEiiKVkkSKIpWORIoilZgl/JWKRIoilYZEihHBgpW6FZqIFtWiVYMrQ+YZwYCAbvKIGtWCVaMrQ+YZwYKVh8PsGcJ\
  D3IG+50PJMOLmlYfAJpWYqqf+wAqkBYCArvIViqQCFY6KIpWJJ/yqpAIVlhWSGYYVwhWZM0rhGZmCFJIQloACxJMiq8MSxJEV\
  mMMLkYdAhsSQJgMVi0BnIsSTFY9ASyLEkxWTQC8ipf8VwsSTlZfAopWaQAkn/TDG8pWHwSjjpoCRmEAmqqf+FaCBNuYqiYcn5\
  EAYgmbmEaGCopWYpgEZiBWKFYiCwuYRoYKVhyaCwICCbvIRwpWaEZkmAKqmghWGlZYUHTNK4hWKFY4VkhWWoYKAAogqUXcoQ+\
  5APyS3QBIZn8ATJK9AFIHMAkFvJLvAuyUXQMCBzAJAXyavwDskt8ArJqvAIySvwBNAHZmAgcwCQXCRgEA6pADjlXkxJvWZfJF\
  9Qw6VeOOVdhV7wEhAJIP665l7Q+fAHIOK6xl7Q+aVnMAFgTLS/SCRfEALmXSDiumg46TAgfr1MCr1IIAy8aCA8vKVuRWaFb6Z\
  hTGq4pV7JCpAJqWQkYDARTH65CgoYZV4KGKAAcXo46TCFXkwwvZs+vB/9nm5rJ/2ebmsoAKlxoKMg2r2lOqY5hWKGY6KQOCBJ\
  vCDfvUweq6ABqSAkZhACqS2Z/wCFZoRxyKkwpmHQA0wEv6kA4IDwArAJqb2gvSAouqn3hV2puKC9IFu88B4QEqmzoL0gW7zwA\
  hAOIOK6xl3Q7iD+uuZd0NwgSbggm7yiAaVdGGkKMAnJC7AGaf+qqQI46QKFXoZdivACEBOkcakuyJn/AIrwBqkwyJn/AIRxoA\
  CigKVlGHkZv4VlpWR5GL+FZKVjeRe/hWOlYnkWv4Vi6LAEEN4wAjDaipAESf9pCmkvyMjIyIRHpHHIqil/mf8Axl3QBqkuyJn\
  /AIRxpEeKSf8pgKrAJPAEwDzQpqRxuf8AiMkw8PjJLvAByKkrpl7wLhAIqQA45V6qqS2ZAQGpRZkAAYqiLzjo6Qqw+2k6mQMB\
  ipkCAakAmQQB8AiZ/wCpAJkAAakAoAFggAAAAAD6Ch8AAJiWgP/wvcAAAYag///Y8AAAA+j///+cAAAACv//////3wqAAANLw\
  P//c2AAAA4Q///9qAAAADzsqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqIAy8qRGgvyCiu/BwpWnQA0z5uKJOoAAg1L\
  ulbhAPIMy8qU6gACBbvNADmKQHIP67mEgg6rmpTqAAICi6IO2/aEqQCqVh8AalZkn/hWZggTiqOykHcTRYPlZ0Fn6zG3cv7uO\
  Feh2EHCp8Y1lYCn51/efGgDFyGBCBAAAAAKm/oL8gKLqlcGlQkAMgI7xMAOA='

const basic = decode(base64)

export default basic
