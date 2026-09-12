import {LinkIcon} from '@sanity/icons/Link'
import {defineField, defineType} from 'sanity'

export const externalLink = defineType({
  name: 'externalLink',
  title: 'External link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https', 'mailto']}),
    }),
  ],
  preview: {
    select: {
      label: 'label.0.value',
      url: 'url',
    },
    prepare({label, url}) {
      return {
        title: label || 'Untitled link',
        subtitle: url,
      }
    },
  },
})
