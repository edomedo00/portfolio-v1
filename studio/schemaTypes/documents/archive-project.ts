import {ArchiveIcon} from '@sanity/icons/Archive'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const archiveProject = defineType({
  name: 'archiveProject',
  title: 'Archive project',
  type: 'document',
  icon: ArchiveIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Images'},
    {name: 'links', title: 'Links'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'archiveId',
      title: 'Archive number',
      description: 'Displayed as a three-digit value, for example 001.',
      type: 'number',
      group: 'content',
      validation: (rule) => rule.required().integer().min(1).max(999),
    }),
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
      name: 'detailTitle',
      title: 'Detail title',
      type: 'internationalizedArrayString',
      group: 'content',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'body',
      title: 'Description',
      type: 'internationalizedArraySimpleBlockContent',
      group: 'content',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'previewImage',
      title: 'Preview image',
      description:
        'Square cover used in the archive overview. If empty, the first gallery image is used.',
      type: 'imageWithAlt',
      group: 'media',
    }),
    defineField({
      name: 'gallery',
      title: 'Image gallery',
      description: 'Images shown on the project detail page in an 8:5 frame.',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({type: 'imageWithAlt'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Visit URL',
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
      title: 'Archive order',
      name: 'archiveOrder',
      by: [
        {field: 'order', direction: 'asc'},
        {field: 'archiveId', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      archiveId: 'archiveId',
      previewImage: 'previewImage',
      galleryImage: 'gallery.0',
    },
    prepare({title, archiveId, previewImage, galleryImage}) {
      const id = typeof archiveId === 'number' ? String(archiveId).padStart(3, '0') : '---'
      return {
        title: title || 'Untitled archive project',
        subtitle: `[${id}]`,
        media: previewImage ?? galleryImage,
      }
    },
  },
})
