import {createReadStream} from 'node:fs'
import {basename, dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-08-17'})
const publicDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../../web/public')

function localized(type: 'String' | 'Text', es: string, en: string) {
  return [
    {
      _key: 'language-es',
      _type: `internationalizedArray${type}Value`,
      language: 'es',
      value: es,
    },
    {
      _key: 'language-en',
      _type: `internationalizedArray${type}Value`,
      language: 'en',
      value: en,
    },
  ]
}

function blocks(paragraphs: string[], language: 'es' | 'en') {
  return paragraphs.map((text, index) => ({
    _key: `${language}-paragraph-${index + 1}`,
    _type: 'block',
    children: [
      {
        _key: `${language}-span-${index + 1}`,
        _type: 'span',
        marks: [],
        text,
      },
    ],
    markDefs: [],
    style: 'normal',
  }))
}

function localizedBlocks(es: string[], en: string[]) {
  return [
    {
      _key: 'language-es',
      _type: 'internationalizedArraySimpleBlockContentValue',
      language: 'es',
      value: blocks(es, 'es'),
    },
    {
      _key: 'language-en',
      _type: 'internationalizedArraySimpleBlockContentValue',
      language: 'en',
      value: blocks(en, 'en'),
    },
  ]
}

async function uploadImage(relativePath: string, altEs: string, altEn: string) {
  const absolutePath = resolve(publicDirectory, relativePath.replace(/^\//, ''))
  const asset = await client.assets.upload('image', createReadStream(absolutePath), {
    filename: basename(absolutePath),
  })

  return {
    _key: `image-${asset._id}`,
    _type: 'imageWithAlt',
    asset: {_ref: asset._id, _type: 'reference'},
    isDecorative: false,
    alt: localized('String', altEs, altEn),
  }
}

type SeedDocument = {_type: string; [key: string]: unknown}

async function upsertBySlug(document: SeedDocument) {
  const slug = (document.slug as {current: string}).current
  const existing = await client.fetch<{_id: string} | null>(
    '*[_type == $type && slug.current == $slug][0]{_id}',
    {type: document._type, slug},
  )

  if (existing?._id) {
    const {_type, ...fields} = document
    await client.patch(existing._id).set(fields).commit()
    return existing._id
  }

  return (await client.create(document))._id
}

const spanishProjectBody = (title: string) => [
  `DISEÑO Y DESARROLLO DEL SITIO WEB DE ${title}, CREADO PARA TRASLADAR SU IDENTIDAD A UNA EXPERIENCIA DIGITAL CLARA, DINÁMICA Y VISUALMENTE ATRACTIVA.`,
  'EL PROYECTO COMBINA UNA INTERFAZ CONTEMPORÁNEA, NAVEGACIÓN INTUITIVA Y DISEÑO RESPONSIVO PARA OFRECER UNA EXPERIENCIA FLUIDA EN CUALQUIER DISPOSITIVO.',
]

const englishProjectBody = (title: string) => [
  `DESIGN AND DEVELOPMENT OF THE ${title} WEBSITE, TRANSLATING ITS IDENTITY INTO A CLEAR, DYNAMIC, AND VISUALLY ENGAGING DIGITAL EXPERIENCE.`,
  'THE PROJECT COMBINES A CONTEMPORARY INTERFACE, INTUITIVE NAVIGATION, AND RESPONSIVE DESIGN FOR A FLUID EXPERIENCE ON EVERY DEVICE.',
]

async function seed() {
  console.log('Uploading portfolio images…')

  const kaomaxiPreview = await uploadImage(
    '/projects/kaomaxi/preview.png',
    'Vista previa del proyecto Kaomaxi',
    'Kaomaxi project preview',
  )
  const kaomaxiHero = await uploadImage(
    '/projects/kaomaxi/hero.png',
    'Vista amplia del proyecto Kaomaxi',
    'Wide view of the Kaomaxi project',
  )

  console.log('Creating singleton content…')

  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    displayName: 'EDMUNDO MEDEL',
    compactTitle: 'EDMUNDO MEDEL',
    role: localized(
      'String',
      'DESARROLLADOR WEB Y PROGRAMADOR CREATIVO',
      'WEB DEVELOPER AND CREATIVE CODER',
    ),
    siteUrl: 'https://example.com',
    timeZone: 'America/Mexico_City',
    socialLinks: [
      {
        _key: 'linkedin',
        _type: 'externalLink',
        label: localized('String', 'LINKEDIN', 'LINKEDIN'),
        url: 'https://www.linkedin.com/',
      },
      {
        _key: 'x',
        _type: 'externalLink',
        label: localized('String', 'X (TWITTER)', 'X (TWITTER)'),
        url: 'https://x.com/',
      },
    ],
    defaultSeo: {
      _type: 'seo',
      title: localized('String', 'Edmundo Medel — Portafolio', 'Edmundo Medel — Portfolio'),
      description: localized(
        'Text',
        'Portafolio de diseño, desarrollo web y programación creativa.',
        'Portfolio of design, web development, and creative coding.',
      ),
      noIndex: false,
    },
  })

  const singletonDocuments: Array<{_id: string; _type: string; [key: string]: unknown}> = [
    {
      _id: 'homePage',
      _type: 'homePage',
      navigationLabel: localized('String', 'INICIO', 'HOME'),
    },
    {
      _id: 'projectsPage',
      _type: 'projectsPage',
      navigationLabel: localized('String', 'PROYECTOS', 'PROJECTS'),
      heading: localized('String', 'PROYECTOS', 'PROJECTS'),
      introduction: localized(
        'Text',
        'UNA COLECCIÓN DE PROYECTOS DE DISEÑO Y DESARROLLO WEB',
        'A COLLECTION OF WEB DESIGN AND DEVELOPMENT PROJECTS',
      ),
    },
    {
      _id: 'archivePage',
      _type: 'archivePage',
      navigationLabel: localized('String', 'ARCHIVO', 'ARCHIVE'),
      heading: localized('String', 'ARCHIVO', 'ARCHIVE'),
      introduction: localized(
        'Text',
        'UN ESPACIO PARA MOSTRAR CONCEPTOS, PROYECTOS SECUNDARIOS, EXPERIMENTOS, COLABORACIONES',
        'A SPACE FOR CONCEPTS, SIDE PROJECTS, EXPERIMENTS, AND COLLABORATIONS',
      ),
      comingSoonLabel: localized('String', 'PRÓXIMAMENTE...', 'COMING SOON...'),
    },
  ]

  for (const document of singletonDocuments) await client.createOrReplace(document)

  await seedRemainingSingletons()
  await seedProjects(kaomaxiPreview, kaomaxiHero)
  await seedArchive(kaomaxiPreview, kaomaxiHero)

  console.log('Portfolio content is ready.')
}

async function seedRemainingSingletons() {
  await client.createOrReplace({
    _id: 'aboutPage',
    _type: 'aboutPage',
    navigationLabel: localized('String', 'ACERCA DE MÍ', 'ABOUT'),
    heading: localized('String', 'ACERCA DE', 'ABOUT'),
    body: localizedBlocks(
      [
        'SOY UN DESARROLLADOR WEB Y PROGRAMADOR CREATIVO. TRABAJO EN LA INTERSECCIÓN ENTRE TECNOLOGÍA, DISEÑO Y EXPERIMENTACIÓN VISUAL PARA CREAR EXPERIENCIAS DIGITALES QUE NO SOLO FUNCIONAN BIEN, SINO QUE TAMBIÉN DESPIERTAN CURIOSIDAD.',
      ],
      [
        'I AM A WEB DEVELOPER AND CREATIVE CODER WORKING AT THE INTERSECTION OF TECHNOLOGY, DESIGN, AND VISUAL EXPERIMENTATION TO CREATE DIGITAL EXPERIENCES THAT WORK WELL AND SPARK CURIOSITY.',
      ],
    ),
  })

  await client.createOrReplace({
    _id: 'contactPage',
    _type: 'contactPage',
    navigationLabel: localized('String', 'CONTACTO', 'CONTACT'),
    heading: localized('String', 'CONTACTO', 'CONTACT'),
    introduction: localized(
      'Text',
      'HABLEMOS SOBRE TU PRÓXIMO PROYECTO, COLABORACIÓN O EXPERIMENTO DIGITAL.',
      'LET’S TALK ABOUT YOUR NEXT PROJECT, COLLABORATION, OR DIGITAL EXPERIMENT.',
    ),
    email: 'hello@edmundomedel.com',
    emailLabel: localized('String', 'ESCRÍBEME', 'EMAIL ME'),
  })

  await client.createOrReplace({
    _id: 'cellsPage',
    _type: 'cellsPage',
    navigationLabel: localized('String', 'CELLS', 'CELLS'),
    title: localized('String', 'CELLS', 'CELLS'),
    description: localized(
      'Text',
      'UNA PROYECCIÓN INTERACTIVA DE CÉLULAS CON RASTROS DE MOVIMIENTO Y RESPUESTA AL CURSOR.',
      'AN INTERACTIVE PROJECTION OF CELLS WITH MOTION TRAILS AND CURSOR RESPONSE.',
    ),
  })
}

async function seedProjects(kaomaxiPreview: Record<string, unknown>, kaomaxiHero: Record<string, unknown>) {
  const definitions = [
    {
      slug: 'kaomaxi',
      title: 'KAOMAXI',
      year: 2026,
      disciplines: ['DISEÑO', 'DESARROLLO'],
      typeEs: 'SITIO WEB',
      typeEn: 'WEBSITE',
      websiteUrl: 'https://kaomaxi.com',
      gallery: [kaomaxiPreview, kaomaxiHero],
    },
    {
      slug: 'studio-test',
      title: 'STUDIO TEST',
      year: 2026,
      disciplines: ['DESARROLLO'],
      typeEs: 'PLAYGROUND INTERACTIVO',
      typeEn: 'INTERACTIVE PLAYGROUND',
      image: '/projects/placeholders/studio-test.svg',
    },
    {
      slug: 'periques',
      title: 'PERIQUES',
      year: 2026,
      disciplines: ['DESARROLLO', 'DISEÑO'],
      typeEs: 'SITIO WEB',
      typeEn: 'WEBSITE',
      image: '/projects/placeholders/periques.svg',
    },
    {
      slug: 'paulo-ramirez',
      title: 'PAULO RAMIREZ',
      year: 2026,
      disciplines: ['DESARROLLO', 'DISEÑO'],
      typeEs: 'PORTAFOLIO',
      typeEn: 'PORTFOLIO',
      image: '/projects/placeholders/paulo-ramirez.svg',
    },
    {
      slug: 'proyecto-05',
      title: 'PROYECTO 05',
      year: 2026,
      disciplines: ['DISEÑO', 'DESARROLLO'],
      typeEs: 'SITIO WEB',
      typeEn: 'WEBSITE',
      image: '/projects/placeholders/proyecto-05.svg',
    },
  ]

  for (const [index, definition] of definitions.entries()) {
    const gallery = definition.gallery ?? [
      await uploadImage(
        definition.image!,
        `Imagen del proyecto ${definition.title}`,
        `${definition.title} project image`,
      ),
    ]

    await upsertBySlug({
      _type: 'project',
      title: definition.title,
      slug: {_type: 'slug', current: definition.slug},
      order: index + 1,
      year: definition.year,
      disciplines: definition.disciplines,
      projectType: localized('String', definition.typeEs, definition.typeEn),
      body: localizedBlocks(
        spanishProjectBody(definition.title),
        englishProjectBody(definition.title),
      ),
      gallery,
      websiteUrl: definition.websiteUrl,
    })
  }
}

async function seedArchive(
  kaomaxiPreview: Record<string, unknown>,
  kaomaxiHero: Record<string, unknown>,
) {
  const images = [kaomaxiPreview, kaomaxiHero, kaomaxiHero, kaomaxiPreview]
  const slugs = ['ascii-flowers', 'ascii-flowers-002', 'ascii-flowers-004', 'ascii-flowers-archive']

  for (const [index, slug] of slugs.entries()) {
    await upsertBySlug({
      _type: 'archiveProject',
      archiveId: index + 1,
      title: 'ASCII GARDEN',
      slug: {_type: 'slug', current: slug},
      order: index + 1,
      detailTitle: localized('String', 'ASCII FLOWERS', 'ASCII FLOWERS'),
      body: localizedBlocks(
        [
          'UNA EXPLORACIÓN DE LAS FLORES COMO PORTADORAS DE BELLEZA, CONSTRUIDA ÚNICAMENTE CON CARACTERES DE TEXTO.',
          'UN ALGORITMO PROCEDURAL GENERA CADA FIGURA PARA FORMAR UN JARDÍN DE TEXTO EN CONSTANTE VARIACIÓN.',
        ],
        [
          'AN EXPLORATION OF FLOWERS AS CARRIERS OF BEAUTY, BUILT ENTIRELY FROM TEXT CHARACTERS.',
          'A PROCEDURAL ALGORITHM GENERATES EACH FIGURE TO FORM A CONSTANTLY CHANGING TEXT GARDEN.',
        ],
      ),
      websiteUrl: 'https://github.com/edomedo00/portfolio-v1',
      codeUrl: 'https://github.com/edomedo00/portfolio-v1',
      gallery: [images[index]],
    })
  }
}

seed().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
