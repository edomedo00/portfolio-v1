import {HomeIcon} from '@sanity/icons/Home'
import {defineField, defineType} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'navigationLabel',
      title: 'Navigation label',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Home page'}
    },
  },
})
