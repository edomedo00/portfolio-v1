import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'displayName',
      title: 'Display name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'compactTitle',
      title: 'Compact menu title',
      description: 'Shown in the compact navigation on Projects and Archive.',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Professional role',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
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
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      of: [{type: 'externalLink'}],
    }),
    defineField({
      name: 'timeZone',
      title: 'Local time zone',
      description: 'IANA time zone used by the local-time display.',
      type: 'string',
      initialValue: 'America/Mexico_City',
      validation: (rule) => rule.required(),
    }),
  ],
})
