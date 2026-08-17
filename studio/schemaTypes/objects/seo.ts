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
      type: 'string',
      validation: (rule) =>
        rule.max(60).warning('Titles longer than 60 characters may be truncated.'),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (rule) =>
        rule.max(160).warning('Descriptions longer than 160 characters may be truncated.'),
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
