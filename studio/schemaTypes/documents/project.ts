import {ProjectsIcon} from '@sanity/icons/Projects'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ProjectsIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Images'},
    {name: 'links', title: 'Links'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers appear first.',
      type: 'number',
      group: 'content',
      initialValue: 100,
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      group: 'content',
      validation: (rule) => rule.required().integer().min(1900).max(2200),
    }),
    defineField({
      name: 'disciplines',
      title: 'Disciplines',
      description: 'Simple display labels, not categories.',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: 'projectType',
      title: 'Project type',
      type: 'internationalizedArrayString',
      group: 'content',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'body',
      title: 'Project description',
      type: 'internationalizedArraySimpleBlockContent',
      group: 'content',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'gallery',
      title: 'Image gallery',
      description: 'The first image is used in project listings and hover previews.',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({type: 'imageWithAlt'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
      group: 'links',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'codeUrl',
      title: 'Code URL',
      type: 'url',
      group: 'links',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  orderings: [
    {
      title: 'Portfolio order',
      name: 'portfolioOrder',
      by: [
        {field: 'order', direction: 'asc'},
        {field: 'year', direction: 'desc'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      media: 'gallery.0',
    },
    prepare({title, year, media}) {
      return {
        title: title || 'Untitled project',
        subtitle: year ? String(year) : 'Missing year',
        media,
      }
    },
  },
})
