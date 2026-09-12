import type {Metadata} from 'next'
import type {ReactNode} from 'react'
import {getLocale} from '@/i18n/locale'
import {getArchiveContent, getSiteChrome} from '@/sanity/lib/content'
import {buildMetadata} from '@/sanity/lib/metadata'
import {ArchiveView} from './archive-view'

export async function generateMetadata(): Promise<Metadata> {
  const language = await getLocale()
  const [content, {settings}] = await Promise.all([
    getArchiveContent(language),
    getSiteChrome(language),
  ])
  return buildMetadata({
    fallbackTitle: content.page.heading,
    seo: content.page.seo,
    site: settings,
  })
}

export default async function ArchiveLayout({children}: {children: ReactNode}) {
  const language = await getLocale()
  const content = await getArchiveContent(language)
  return (
    <ArchiveView content={content} language={language}>
      {children}
    </ArchiveView>
  )
}
