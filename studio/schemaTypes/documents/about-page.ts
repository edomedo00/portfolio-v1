import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'
import {defineField, defineType} from 'sanity'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'navigationLabel',
      title: 'Navigation label',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'body',
      title: 'Biography',
      type: 'internationalizedArraySimpleBlockContent',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {
    prepare() {
      return {title: 'About page'}
    },
  },
})
