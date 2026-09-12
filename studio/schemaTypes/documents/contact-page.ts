import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {defineField, defineType} from 'sanity'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact page',
  type: 'document',
  icon: EnvelopeIcon,
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
      name: 'introduction',
      title: 'Introduction',
      type: 'internationalizedArrayText',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'email',
      title: 'Email address',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'emailLabel',
      title: 'Email link label',
      type: 'internationalizedArrayString',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {
    prepare() {
      return {title: 'Contact page'}
    },
  },
})
