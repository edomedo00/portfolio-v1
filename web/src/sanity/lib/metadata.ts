import type {Metadata} from 'next'
import type {SeoContent, SiteChromeContent} from '@/content/types'
import {urlFor} from './image'

type MetadataOptions = {
  fallbackTitle: string
  seo?: SeoContent | null
  site: SiteChromeContent['settings']
}

export function buildMetadata({fallbackTitle, seo, site}: MetadataOptions): Metadata {
  const title = seo?.title ?? fallbackTitle ?? site.defaultSeo?.title ?? site.displayName
  const description = seo?.description ?? site.defaultSeo?.description ?? site.role
  const seoImage = seo?.image ?? site.defaultSeo?.image
  const image = seoImage?.asset
    ? {
        url: urlFor(seoImage).width(1200).height(630).fit('crop').url(),
        width: 1200,
        height: 630,
        alt: seoImage.alt ?? title,
      }
    : undefined
  const noIndex = seo?.noIndex === true || site.defaultSeo?.noIndex === true

  return {
    title,
    description,
    openGraph: {title, description, type: 'website', images: image ? [image] : undefined},
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image.url] : undefined,
    },
    robots: noIndex ? {index: false, follow: false} : undefined,
  }
}
