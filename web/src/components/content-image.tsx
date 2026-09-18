'use client'

import Image, {type ImageLoaderProps, type ImageProps} from 'next/image'
import type {ContentImageData} from '@/content/project-types'
import {sanityImageLoader} from '@/content/image-presentation'
import {urlFor} from '@/sanity/lib/image'

type ContentImageProps = Omit<ImageProps, 'alt' | 'src' | 'loader'> & {
  image: ContentImageData
  resolutionScale?: number
}

export function ContentImage({
  image,
  quality = 85,
  resolutionScale = 1,
  ...props
}: ContentImageProps) {
  const source = image.src
    ? image.src
    : image.asset
      ? urlFor(image).url()
      : '/projects/placeholders/proyecto-05.svg'

  return (
    <Image
      {...props}
      alt={image.isDecorative ? '' : (image.alt ?? '')}
      src={source}
      quality={quality}
      loader={
        !image.src && image.asset
          ? (loaderProps: ImageLoaderProps) =>
              sanityImageLoader({
                ...loaderProps,
                width: Math.min(3840, Math.ceil(loaderProps.width * resolutionScale)),
              })
          : undefined
      }
    />
  )
}
