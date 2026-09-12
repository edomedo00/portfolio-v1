import type { Metadata } from 'next'
import type { ProjectSeo } from '@/content/project-types'
import { urlFor } from './image'

export function buildProjectMetadata(fallbackTitle: string, seo?: ProjectSeo | null): Metadata {
  const title = seo?.title ?? fallbackTitle
  const image = seo?.image?.asset
    ? urlFor(seo.image).width(1200).height(630).fit('crop').auto('format').url()
    : undefined

  return {
    title,
    description: seo?.description ?? undefined,
    openGraph: {
      title,
      description: seo?.description ?? undefined,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description: seo?.description ?? undefined,
      images: image ? [image] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}
