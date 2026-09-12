import {ArchiveIcon} from '@sanity/icons/Archive'
import {defineField, defineType} from 'sanity'

export const archivePage = defineType({
  name: 'archivePage',
  title: 'Archive page',
  type: 'document',
  icon: ArchiveIcon,
  fields: [
    defineField({
      name: 'navigationLabel',
      title: 'Navigation label',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'heading',
      title: 'Accessible heading',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'introduction',
      title: 'Introduction',
      type: 'internationalizedArrayText',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'comingSoonLabel',
      title: 'Coming soon label',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {
    prepare() {
      return {title: 'Archive page'}
    },
  },
})
