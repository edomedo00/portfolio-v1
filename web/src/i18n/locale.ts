import {cookies} from 'next/headers'
import type {Locale} from '@/content/types'

import {languageCookie} from './config'

export {languageCookie} from './config'

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(languageCookie)?.value
  return value === 'en' ? 'en' : 'es'
}
