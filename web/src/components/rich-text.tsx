import {PortableText, type PortableTextBlock, type PortableTextComponents} from '@portabletext/react'

const components: PortableTextComponents = {
  marks: {
    link: ({children, value}) => (
      <a href={value?.href} rel="noreferrer" target="_blank">
        {children}
      </a>
    ),
  },
}

export function RichText({value}: {value: PortableTextBlock[]}) {
  return <PortableText components={components} value={value} />
}
