import {ArchiveIcon} from '@sanity/icons/Archive'
import {CircleIcon} from '@sanity/icons/Circle'
import {CogIcon} from '@sanity/icons/Cog'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {HomeIcon} from '@sanity/icons/Home'
import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'
import {ProjectsIcon} from '@sanity/icons/Projects'
import type {StructureResolver} from 'sanity/structure'

export const singletonTypes = new Set([
  'siteSettings',
  'homePage',
  'projectsPage',
  'archivePage',
  'aboutPage',
  'contactPage',
  'cellsPage',
])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Portfolio content')
    .items([
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('Home page')
        .icon(HomeIcon)
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('Projects page')
        .icon(ProjectsIcon)
        .child(S.document().schemaType('projectsPage').documentId('projectsPage')),
      S.listItem()
        .title('Archive page')
        .icon(ArchiveIcon)
        .child(S.document().schemaType('archivePage').documentId('archivePage')),
      S.listItem()
        .title('About page')
        .icon(InfoOutlineIcon)
        .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
      S.listItem()
        .title('Contact page')
        .icon(EnvelopeIcon)
        .child(S.document().schemaType('contactPage').documentId('contactPage')),
      S.listItem()
        .title('Cells page')
        .icon(CircleIcon)
        .child(S.document().schemaType('cellsPage').documentId('cellsPage')),
      S.divider(),
      S.documentTypeListItem('project').title('Projects').icon(ProjectsIcon),
      S.documentTypeListItem('archiveProject').title('Archive projects').icon(ArchiveIcon),
    ])
