import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {dataset, projectId, studioTitle} from './environment'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: studioTitle,
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
