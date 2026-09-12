import 'server-only'

import {
  defaultAbout,
  defaultArchive,
  defaultCells,
  defaultContact,
  defaultSiteChrome,
} from '@/content/defaults'
import type {
  AboutContent,
  ArchiveContent,
  ArchiveProject,
  CellsContent,
  ContactContent,
  Locale,
  SiteChromeContent,
} from '@/content/types'
import {sanityFetch} from './live'
import {
  ABOUT_PAGE_QUERY,
  ARCHIVE_BY_SLUG_QUERY,
  ARCHIVE_QUERY,
  ARCHIVE_SLUGS_QUERY,
  CELLS_PAGE_QUERY,
  CONTACT_PAGE_QUERY,
  SITE_CHROME_QUERY,
} from './queries'

async function withFallback<T>(fallback: T, fetcher: () => Promise<T | null>): Promise<T> {
  try {
    return (await fetcher()) ?? fallback
  } catch (error) {
    console.warn('Sanity content could not be loaded; using local fallback content.', error)
    return fallback
  }
}

export async function getSiteChrome(language: Locale): Promise<SiteChromeContent> {
  const fallback = defaultSiteChrome(language)

  return withFallback(fallback, async () => {
    const {data} = await sanityFetch({query: SITE_CHROME_QUERY, params: {language}})
    const value = data as unknown as Partial<SiteChromeContent> | null
    if (!value?.settings) return null

    return {
      settings: {
        ...fallback.settings,
        ...value.settings,
        socialLinks: value.settings.socialLinks ?? fallback.settings.socialLinks,
        defaultSeo: value.settings.defaultSeo ?? fallback.settings.defaultSeo,
      },
      navigation: {...fallback.navigation, ...value.navigation},
    }
  })
}

export async function getArchiveContent(language: Locale): Promise<ArchiveContent> {
  const fallback = defaultArchive(language)

  return withFallback(fallback, async () => {
    const {data} = await sanityFetch({query: ARCHIVE_QUERY, params: {language}})
    const value = data as unknown as ArchiveContent | null
    return value?.page && value.projects?.length ? value : null
  })
}

export async function getArchiveProjectBySlug(
  slug: string,
  language: Locale,
): Promise<ArchiveProject | undefined> {
  const fallback = defaultArchive(language).projects.find((project) => project.slug === slug)

  return withFallback(fallback, async () => {
    const {data} = await sanityFetch({
      query: ARCHIVE_BY_SLUG_QUERY,
      params: {language, slug},
    })
    return (data as unknown as ArchiveProject | null) ?? null
  })
}

export async function getAboutContent(language: Locale): Promise<AboutContent> {
  const fallback = defaultAbout(language)

  return withFallback(fallback, async () => {
    const {data} = await sanityFetch({query: ABOUT_PAGE_QUERY, params: {language}})
    const value = data as unknown as AboutContent | null
    return value?.heading && value.body?.length ? value : null
  })
}

export async function getContactContent(language: Locale): Promise<ContactContent> {
  const fallback = defaultContact(language)

  return withFallback(fallback, async () => {
    const {data} = await sanityFetch({query: CONTACT_PAGE_QUERY, params: {language}})
    const value = data as unknown as ContactContent | null
    return value?.heading && value.email ? value : null
  })
}

export async function getCellsContent(language: Locale): Promise<CellsContent> {
  const fallback = defaultCells(language)

  return withFallback(fallback, async () => {
    const {data} = await sanityFetch({query: CELLS_PAGE_QUERY, params: {language}})
    const value = data as unknown as CellsContent | null
    return value?.title && value.description ? value : null
  })
}

export async function getArchiveSlugs(): Promise<string[]> {
  const fallback = defaultArchive('es').projects.map(({slug}) => slug)

  return withFallback(fallback, async () => {
    const {data} = await sanityFetch({
      query: ARCHIVE_SLUGS_QUERY,
      perspective: 'published',
      stega: false,
    })
    const entries = data as unknown as Array<{slug?: string | null}>
    const slugs = entries.flatMap(({slug}) => (slug ? [slug] : []))
    return slugs.length ? slugs : null
  })
}
