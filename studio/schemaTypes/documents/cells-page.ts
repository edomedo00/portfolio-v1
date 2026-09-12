import {CircleIcon} from '@sanity/icons/Circle'
import {defineField, defineType} from 'sanity'

export const cellsPage = defineType({
  name: 'cellsPage',
  title: 'Cells page',
  type: 'document',
  icon: CircleIcon,
  fields: [
    defineField({
      name: 'navigationLabel',
      title: 'Navigation label',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'title',
      title: 'Accessible title',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'description',
      title: 'Accessible description',
      type: 'internationalizedArrayText',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {
    prepare() {
      return {title: 'Cells page'}
    },
  },
})
