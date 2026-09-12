import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'
import {structure, singletonTypes} from './structure'

import {dataset, previewOrigin, projectId, studioTitle} from './environment'
import {schemaTypes} from './schemaTypes'
import {locations} from './presentation'

export default defineConfig({
  name: 'default',
  title: studioTitle,
  projectId,
  dataset,
  plugins: [
    structureTool({structure}),
    presentationTool({
      previewUrl: {
        initial: previewOrigin,
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {locations},
    }),
    internationalizedArray({
      languages: [
        {id: 'es', title: 'Español'},
        {id: 'en', title: 'English'},
      ],
      defaultLanguages: ['es', 'en'],
      fieldTypes: ['string', 'text', 'simpleBlockContent'],
      languageDisplay: 'titleAndCode',
      buttonLocations: ['field', 'document'],
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (previous, context) =>
      singletonTypes.has(context.schemaType)
        ? previous.filter(({action}) => action !== 'delete' && action !== 'duplicate')
        : previous,
    newDocumentOptions: (previous) =>
      previous.filter(({templateId}) => !singletonTypes.has(templateId)),
  },
})
