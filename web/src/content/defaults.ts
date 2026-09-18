import type {PortableTextBlock} from '@portabletext/react'
import type {
  AboutContent,
  ArchiveContent,
  CellsContent,
  ContactContent,
  Locale,
  SiteChromeContent,
} from './types'

function paragraph(key: string, text: string): PortableTextBlock {
  return {
    _key: key,
    _type: 'block',
    children: [{_key: `${key}-span`, _type: 'span', marks: [], text}],
    markDefs: [],
    style: 'normal',
  }
}

const copy = {
  es: {
    role: 'DESARROLLADOR WEB Y PROGRAMADOR CREATIVO',
    archiveIntro:
      'UN ESPACIO PARA MOSTRAR CONCEPTOS, PROYECTOS SECUNDARIOS, EXPERIMENTOS, COLABORACIONES',
    about:
      'SOY UN DESARROLLADOR WEB Y PROGRAMADOR CREATIVO. TRABAJO EN LA INTERSECCIÓN ENTRE TECNOLOGÍA, DISEÑO Y EXPERIMENTACIÓN VISUAL PARA CREAR EXPERIENCIAS DIGITALES QUE NO SOLO FUNCIONAN BIEN, SINO QUE TAMBIÉN DESPIERTAN CURIOSIDAD.',
    contact: 'HABLEMOS SOBRE TU PRÓXIMO PROYECTO, COLABORACIÓN O EXPERIMENTO DIGITAL.',
    cellsDescription:
      'UNA PROYECCIÓN INTERACTIVA DE CÉLULAS CON RASTROS DE MOVIMIENTO Y RESPUESTA AL CURSOR.',
  },
  en: {
    role: 'WEB DEVELOPER AND CREATIVE CODER',
    archiveIntro: 'A SPACE FOR CONCEPTS, SIDE PROJECTS, EXPERIMENTS, AND COLLABORATIONS',
    about:
      'I AM A WEB DEVELOPER AND CREATIVE CODER WORKING AT THE INTERSECTION OF TECHNOLOGY, DESIGN, AND VISUAL EXPERIMENTATION TO CREATE DIGITAL EXPERIENCES THAT WORK WELL AND SPARK CURIOSITY.',
    contact: 'LET’S TALK ABOUT YOUR NEXT PROJECT, COLLABORATION, OR DIGITAL EXPERIMENT.',
    cellsDescription:
      'AN INTERACTIVE PROJECTION OF CELLS WITH MOTION TRAILS AND CURSOR RESPONSE.',
  },
} as const

export function defaultSiteChrome(language: Locale): SiteChromeContent {
  return {
    settings: {
      displayName: 'EDMUNDO MEDEL',
      compactTitle: 'EDMUNDO MEDEL',
      role: copy[language].role,
      timeZone: 'America/Mexico_City',
      socialLinks: [
        {_key: 'linkedin', label: 'LINKEDIN', url: 'https://www.linkedin.com/'},
        {_key: 'x', label: 'X (TWITTER)', url: 'https://x.com/'},
      ],
      defaultSeo: {
        title: 'Edmundo Medel — Portfolio',
        description: copy[language].role,
      },
    },
    navigation:
      language === 'es'
        ? {
            home: 'INICIO',
            projects: 'PROYECTOS',
            archive: 'ARCHIVO',
            cells: 'CELLS',
            about: 'ACERCA DE',
            contact: 'CONTACTO',
          }
        : {
            home: 'HOME',
            projects: 'PROJECTS',
            archive: 'ARCHIVE',
            cells: 'CELLS',
            about: 'ABOUT',
            contact: 'CONTACT',
          },
  }
}

export function defaultArchive(language: Locale): ArchiveContent {
  const isSpanish = language === 'es'
  const body = [
    paragraph(
      'archive-1',
      isSpanish
        ? 'UNA EXPLORACIÓN DE LAS FLORES COMO PORTADORAS DE BELLEZA, CONSTRUIDA ÚNICAMENTE CON CARACTERES DE TEXTO.'
        : 'AN EXPLORATION OF FLOWERS AS CARRIERS OF BEAUTY, BUILT ENTIRELY FROM TEXT CHARACTERS.',
    ),
    paragraph(
      'archive-2',
      isSpanish
        ? 'UN ALGORITMO PROCEDURAL GENERA CADA FIGURA PARA FORMAR UN JARDÍN DE TEXTO EN CONSTANTE VARIACIÓN.'
        : 'A PROCEDURAL ALGORITHM GENERATES EACH FIGURE TO FORM A CONSTANTLY CHANGING TEXT GARDEN.',
    ),
  ]
  const images = [
    '/projects/kaomaxi/preview.png',
    '/projects/kaomaxi/hero.png',
    '/projects/kaomaxi/hero.png',
    '/projects/kaomaxi/preview.png',
  ]

  return {
    page: {
      heading: isSpanish ? 'Archivo' : 'Archive',
      introduction: copy[language].archiveIntro,
      comingSoonLabel: isSpanish ? 'PRÓXIMAMENTE...' : 'COMING SOON...',
    },
    projects: images.map((src, index) => ({
      _id: `fallback-archive-${index + 1}`,
      archiveId: index + 1,
      title: 'ASCII GARDEN',
      slug: index === 0 ? 'ascii-flowers' : `ascii-flowers-${String(index + 1).padStart(3, '0')}`,
      order: index + 1,
      detailTitle: 'ASCII FLOWERS',
      body,
      websiteUrl: 'https://github.com/edomedo00/portfolio-v1',
      codeUrl: 'https://github.com/edomedo00/portfolio-v1',
      previewImage: {_key: `archive-preview-${index + 1}`, src, alt: 'ASCII Garden'},
      gallery: [{_key: `archive-${index + 1}`, src, alt: 'ASCII Garden'}],
    })),
  }
}

export function defaultAbout(language: Locale): AboutContent {
  return {
    heading: language === 'es' ? 'ACERCA DE' : 'ABOUT',
    browserTitle: language === 'es' ? 'Acerca de — Edmundo Medel' : 'About — Edmundo Medel',
    body: [paragraph('about', copy[language].about)],
  }
}

export function defaultContact(language: Locale): ContactContent {
  return {
    heading: language === 'es' ? 'CONTACTO' : 'CONTACT',
    introduction: copy[language].contact,
    email: 'hello@edmundomedel.com',
    emailLabel: language === 'es' ? 'ESCRÍBEME' : 'EMAIL ME',
  }
}

export function defaultCells(language: Locale): CellsContent {
  return {
    title: 'CELLS',
    description: copy[language].cellsDescription,
    backgroundSettingsJson: null,
  }
}
