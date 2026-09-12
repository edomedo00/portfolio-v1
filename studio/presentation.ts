import {defineLocations} from 'sanity/presentation'

export const locations = {
  siteSettings: {locations: [{title: 'Home', href: '/'}]},
  homePage: {locations: [{title: 'Home', href: '/'}]},
  projectsPage: {locations: [{title: 'Projects', href: '/proyectos'}]},
  archivePage: {locations: [{title: 'Archive', href: '/archivo'}]},
  aboutPage: {locations: [{title: 'About', href: '/acerca-de'}]},
  contactPage: {locations: [{title: 'Contact', href: '/contacto'}]},
  cellsPage: {locations: [{title: 'Cells', href: '/cells'}]},
  project: defineLocations({
    select: {title: 'title', slug: 'slug.current'},
    resolve(document) {
      if (!document?.slug) return {message: 'Add a slug to preview this project.', tone: 'caution'}
      return {
        locations: [
          {title: document.title || 'Project', href: `/proyectos/${document.slug}`},
          {title: 'Projects', href: '/proyectos'},
        ],
      }
    },
  }),
  archiveProject: defineLocations({
    select: {title: 'title', slug: 'slug.current'},
    resolve(document) {
      if (!document?.slug) return {message: 'Add a slug to preview this archive project.', tone: 'caution'}
      return {
        locations: [
          {title: document.title || 'Archive project', href: `/archivo/${document.slug}`},
          {title: 'Archive', href: '/archivo'},
        ],
      }
    },
  }),
}
