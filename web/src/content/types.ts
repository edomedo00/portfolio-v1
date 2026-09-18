import type {PortableTextBlock} from '@portabletext/react'
import type {
  ContentImageData,
  Project,
  ProjectSeo,
  ProjectsContent,
  ProjectsPageContent,
} from './project-types'

export type {ContentImageData, Project, ProjectSeo, ProjectsContent, ProjectsPageContent}
export type SeoContent = ProjectSeo

export type Locale = 'en' | 'es'

export type SocialLink = {
  _key: string
  label: string
  url: string
}

export type SiteChromeContent = {
  settings: {
    displayName: string
    compactTitle: string
    role: string
    siteUrl?: string | null
    timeZone: string
    socialLinks: SocialLink[]
    defaultSeo?: ProjectSeo | null
  }
  navigation: {
    home: string
    projects: string
    archive: string
    cells: string
    about: string
    contact: string
  }
}

export type ArchiveProject = {
  _id: string
  archiveId: number
  title: string
  slug: string
  order: number
  detailTitle: string
  body: PortableTextBlock[]
  websiteUrl?: string | null
  codeUrl?: string | null
  previewImage?: ContentImageData | null
  gallery: ContentImageData[]
  seo?: ProjectSeo | null
}

export type ArchiveContent = {
  page: {
    navigationLabel: string
    heading: string
    introduction: string
    comingSoonLabel: string
    seo?: ProjectSeo | null
  }
  projects: ArchiveProject[]
}

export type AboutContent = {
  heading: string
  browserTitle: string
  body: PortableTextBlock[]
  seo?: ProjectSeo | null
}

export type ContactContent = {
  heading: string
  introduction: string
  email: string
  emailLabel: string
  seo?: ProjectSeo | null
}

export type CellsContent = {
  title: string
  description: string
  backgroundSettingsJson?: string | null
  seo?: ProjectSeo | null
}
