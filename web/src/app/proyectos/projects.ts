import type {PortableTextBlock} from '@portabletext/react'
import type {Project, ProjectsPageContent} from '@/content/project-types'

export type {Project} from '@/content/project-types'

function paragraph(key: string, text: string): PortableTextBlock {
  return {
    _key: key,
    _type: 'block',
    children: [{_key: `${key}-span`, _type: 'span', marks: [], text}],
    markDefs: [],
    style: 'normal',
  }
}

const fallbackDescription = (title: string) => [
  paragraph(
    `${title}-introduction`,
    `DISEÑO Y DESARROLLO DEL SITIO WEB DE ${title}, CREADO PARA TRASLADAR SU IDENTIDAD A UNA EXPERIENCIA DIGITAL CLARA, DINÁMICA Y VISUALMENTE ATRACTIVA.`,
  ),
  paragraph(
    `${title}-experience`,
    'EL PROYECTO COMBINA UNA INTERFAZ CONTEMPORÁNEA, NAVEGACIÓN INTUITIVA Y DISEÑO RESPONSIVO PARA OFRECER UNA EXPERIENCIA FLUIDA EN CUALQUIER DISPOSITIVO.',
  ),
]

export const projectsPageFallback: ProjectsPageContent = {
  heading: 'Proyectos',
  introduction: 'UNA COLECCIÓN DE PROYECTOS DE DISEÑO Y DESARROLLO WEB',
}

export const projects: Project[] = [
  {
    _id: 'fallback-project-kaomaxi',
    slug: 'kaomaxi',
    title: 'KAOMAXI',
    order: 1,
    year: 2026,
    disciplines: ['DISEÑO', 'DESARROLLO'],
    projectType: 'SITIO WEB',
    body: fallbackDescription('KAOMAXI'),
    websiteUrl: 'https://kaomaxi.com',
    gallery: [
      {
        _key: 'kaomaxi-preview',
        src: '/projects/kaomaxi/preview.png',
        alt: 'Vista previa del proyecto Kaomaxi',
      },
      {
        _key: 'kaomaxi-hero',
        src: '/projects/kaomaxi/hero.png',
        alt: 'Vista amplia del proyecto Kaomaxi',
      },
    ],
  },
  {
    _id: 'fallback-project-studio-test',
    slug: 'studio-test',
    title: 'STUDIO TEST',
    order: 2,
    year: 2026,
    disciplines: ['DESARROLLO'],
    projectType: 'PLAYGROUND INTERACTIVO',
    body: fallbackDescription('STUDIO TEST'),
    gallery: [
      {
        _key: 'studio-test-image',
        src: '/projects/placeholders/studio-test.svg',
        alt: 'Imagen pendiente para Studio Test',
      },
    ],
  },
  {
    _id: 'fallback-project-periques',
    slug: 'periques',
    title: 'PERIQUES',
    order: 3,
    year: 2026,
    disciplines: ['DESARROLLO', 'DISEÑO'],
    projectType: 'SITIO WEB',
    body: fallbackDescription('PERIQUES'),
    gallery: [
      {
        _key: 'periques-image',
        src: '/projects/placeholders/periques.svg',
        alt: 'Imagen pendiente para Periques',
      },
    ],
  },
  {
    _id: 'fallback-project-paulo-ramirez',
    slug: 'paulo-ramirez',
    title: 'PAULO RAMIREZ',
    order: 4,
    year: 2026,
    disciplines: ['DESARROLLO', 'DISEÑO'],
    projectType: 'PORTAFOLIO',
    body: fallbackDescription('PAULO RAMIREZ'),
    gallery: [
      {
        _key: 'paulo-ramirez-image',
        src: '/projects/placeholders/paulo-ramirez.svg',
        alt: 'Imagen pendiente para Paulo Ramirez',
      },
    ],
  },
  {
    _id: 'fallback-project-proyecto-05',
    slug: 'proyecto-05',
    title: 'PROYECTO 05',
    order: 5,
    year: 2026,
    disciplines: ['DISEÑO', 'DESARROLLO'],
    projectType: 'SITIO WEB',
    body: fallbackDescription('PROYECTO 05'),
    gallery: [
      {
        _key: 'proyecto-05-image',
        src: '/projects/placeholders/proyecto-05.svg',
        alt: 'Imagen pendiente para Proyecto 05',
      },
    ],
  },
]

export function getFallbackProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}
