import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'siteUrl',
      title: 'Site URL',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seo',
    }),
  ],
})
