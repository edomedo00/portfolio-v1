import type {PortableTextBlock} from '@portabletext/react'

export type ContentImageData = {
  _key?: string
  _type?: 'imageWithAlt'
  asset?: {_ref: string; _type: 'reference'}
  crop?: {top: number; bottom: number; left: number; right: number}
  hotspot?: {x: number; y: number; height: number; width: number}
  isDecorative?: boolean | null
  alt?: string | null
  caption?: string | null
  src?: string
}

export type ProjectSeo = {
  title?: string | null
  description?: string | null
  image?: ContentImageData | null
  noIndex?: boolean | null
}

export type Project = {
  _id: string
  title: string
  slug: string
  order: number
  year: number
  disciplines: string[]
  projectType: string
  body: PortableTextBlock[]
  websiteUrl?: string | null
  codeUrl?: string | null
  gallery: ContentImageData[]
  seo?: ProjectSeo | null
}

export type ProjectsPageContent = {
  navigationLabel: string
  heading: string
  introduction: string
  seo?: ProjectSeo | null
}

export type ProjectsContent = {
  page: ProjectsPageContent
  projects: Project[]
}
