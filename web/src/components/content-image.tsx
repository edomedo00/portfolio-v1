import Image, {type ImageProps} from 'next/image'
import type {ContentImageData} from '@/content/project-types'
import {urlFor} from '@/sanity/lib/image'

type ContentImageProps = Omit<ImageProps, 'alt' | 'src'> & {
  image: ContentImageData
  heightHint?: number
  widthHint?: number
}

export function ContentImage({
  image,
  heightHint,
  widthHint = 1600,
  ...props
}: ContentImageProps) {
  const source = image.src
    ? image.src
    : image.asset
      ? urlFor(image)
          .width(widthHint)
          .height(heightHint ?? Math.round(widthHint * 0.75))
          .fit('crop')
          .auto('format')
          .url()
      : '/projects/placeholders/proyecto-05.svg'

  return <Image {...props} alt={image.isDecorative ? '' : (image.alt ?? '')} src={source} />
}
