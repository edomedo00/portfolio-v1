import {aboutPage} from './documents/about-page'
import {archivePage} from './documents/archive-page'
import {archiveProject} from './documents/archive-project'
import {cellsPage} from './documents/cells-page'
import {contactPage} from './documents/contact-page'
import {homePage} from './documents/home-page'
import {page} from './documents/page'
import {project} from './documents/project'
import {projectsPage} from './documents/projects-page'
import {externalLink} from './objects/external-link'
import {imageWithAlt} from './objects/image-with-alt'
import {seo} from './objects/seo'
import {simpleBlockContent} from './objects/simple-block-content'
import {siteSettings} from './documents/site-settings'

export const schemaTypes = [
  simpleBlockContent,
  imageWithAlt,
  externalLink,
  seo,
  siteSettings,
  homePage,
  projectsPage,
  archivePage,
  aboutPage,
  contactPage,
  cellsPage,
  project,
  archiveProject,
  page,
]
