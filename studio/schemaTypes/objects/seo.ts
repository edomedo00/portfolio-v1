import {DocumentIcon} from '@sanity/icons/Document'
import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'SEO title',
      description: 'Optional override for the page title.',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'internationalizedArrayText',
    }),
    defineField({
      name: 'image',
      title: 'Social sharing image',
      description: 'A 1200 × 630 image is recommended.',
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
