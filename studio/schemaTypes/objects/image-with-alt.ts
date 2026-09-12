import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'

type ImageParent = {
  isDecorative?: boolean
  asset?: {
    _ref?: string
  }
}

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      name: 'isDecorative',
      title: 'Decorative image',
      description: 'Enable this when assistive technology should ignore the image.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'alt',
      title: 'Alternative text',
      description: 'Describe the image’s meaning, not its visual styling.',
      type: 'internationalizedArrayString',
      hidden: ({parent}) => (parent as ImageParent | undefined)?.isDecorative === true,
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as ImageParent | undefined

          if (!parent?.asset?._ref || parent.isDecorative) {
            return true
          }

          return Array.isArray(value) && value.length >= 2
            ? true
            : 'Alternative text is required in English and Spanish'
        }),
    }),
    defineField({
      name: 'caption',
      type: 'internationalizedArrayString',
    }),
  ],
})
