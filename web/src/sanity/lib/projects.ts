import 'server-only'

import type {Project, ProjectsContent} from '@/content/project-types'
import {
  getFallbackProject,
  projects as fallbackProjects,
  projectsPageFallback,
} from '@/app/proyectos/projects'
import {sanityFetch} from './live'
import {
  PROJECT_BY_SLUG_QUERY,
  PROJECT_SLUGS_QUERY,
  PROJECTS_CONTENT_QUERY,
} from './queries'

export type ProjectLanguage = 'en' | 'es'

function isProject(value: Project | null | undefined): value is Project {
  return Boolean(
    value?._id &&
      value.title &&
      value.slug &&
      Number.isFinite(value.order) &&
      Number.isFinite(value.year) &&
      value.disciplines?.length &&
      value.projectType &&
      value.body?.length &&
      value.gallery?.length,
  )
}

export async function getProjectsContent(
  language: ProjectLanguage = 'es',
): Promise<ProjectsContent> {
  try {
    const {data} = await sanityFetch({
      query: PROJECTS_CONTENT_QUERY,
      params: {language},
    })
    const value = data as unknown as Partial<ProjectsContent> | null
    const sanityProjects = value?.projects?.filter(isProject) ?? []

    return {
      page: {
        ...projectsPageFallback,
        ...value?.page,
      },
      projects: sanityProjects.length ? sanityProjects : fallbackProjects,
    }
  } catch (error) {
    console.warn('Sanity projects could not be loaded; using local fallback projects.', error)
    return {page: projectsPageFallback, projects: fallbackProjects}
  }
}

export async function getProjectBySlug(
  slug: string,
  language: ProjectLanguage = 'es',
): Promise<Project | undefined> {
  try {
    const {data} = await sanityFetch({
      query: PROJECT_BY_SLUG_QUERY,
      params: {language, slug},
    })
    const project = data as unknown as Project | null
    return isProject(project) ? project : getFallbackProject(slug)
  } catch (error) {
    console.warn(`Sanity project "${slug}" could not be loaded; using local fallback.`, error)
    return getFallbackProject(slug)
  }
}

export async function getProjectSlugs(): Promise<string[]> {
  try {
    const {data} = await sanityFetch({
      query: PROJECT_SLUGS_QUERY,
      perspective: 'published',
      stega: false,
    })
    const entries = data as unknown as Array<{slug?: string | null}>
    const slugs = entries.flatMap(({slug}) => (slug ? [slug] : []))
    return slugs.length ? slugs : fallbackProjects.map(({slug}) => slug)
  } catch (error) {
    console.warn('Sanity project slugs could not be loaded; using local fallback slugs.', error)
    return fallbackProjects.map(({slug}) => slug)
  }
}
