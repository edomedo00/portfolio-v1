import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getLocale} from '@/i18n/locale'
import {
  getArchiveProjectBySlug,
  getArchiveSlugs,
  getSiteChrome,
} from '@/sanity/lib/content'
import {buildMetadata} from '@/sanity/lib/metadata'
import {ArchiveProjectDetail} from '../archive-view'

type ArchiveProjectPageProps = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  return (await getArchiveSlugs()).map((slug) => ({slug}))
}

export async function generateMetadata({
  params,
}: ArchiveProjectPageProps): Promise<Metadata> {
  const [{slug}, language] = await Promise.all([params, getLocale()])
  const [project, {settings}] = await Promise.all([
    getArchiveProjectBySlug(slug, language),
    getSiteChrome(language),
  ])
  return project
    ? buildMetadata({fallbackTitle: project.detailTitle, seo: project.seo, site: settings})
    : {}
}

export default async function ArchiveProjectPage({params}: ArchiveProjectPageProps) {
  const [{slug}, language] = await Promise.all([params, getLocale()])
  const project = await getArchiveProjectBySlug(slug, language)

  if (!project) notFound()

  return <ArchiveProjectDetail language={language} project={project} />
}
