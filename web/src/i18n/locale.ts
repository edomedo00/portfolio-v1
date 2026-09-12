import {cookies} from 'next/headers'
import type {Locale} from '@/content/types'

export const languageCookie = 'portfolio-language'

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(languageCookie)?.value
  return value === 'en' ? 'en' : 'es'
}
