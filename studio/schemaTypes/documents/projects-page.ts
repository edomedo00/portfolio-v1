import {ProjectsIcon} from '@sanity/icons/Projects'
import {defineField, defineType} from 'sanity'

export const projectsPage = defineType({
  name: 'projectsPage',
  title: 'Projects page',
  type: 'document',
  icon: ProjectsIcon,
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
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {
    prepare() {
      return {title: 'Projects page'}
    },
  },
})
