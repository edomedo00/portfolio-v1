import type {ContentImageData} from './project-types'

// Sanity asset references include the original dimensions; no extra query is needed.
export function getContentImageAspectRatio(image?: ContentImageData): number {
  const dimensions = !image?.src && image?.asset?._ref.match(/-(\d+)x(\d+)-[^-]+$/)
  if (!dimensions) return 8 / 5

  const width = Number(dimensions[1])
  const height = Number(dimensions[2])
  const crop = image?.crop
  const croppedWidth = Math.round(width - width * (crop?.right ?? 0) - Math.round(width * (crop?.left ?? 0)))
  const croppedHeight = Math.round(height - height * (crop?.bottom ?? 0) - Math.round(height * (crop?.top ?? 0)))

  return croppedWidth > 0 && croppedHeight > 0 ? croppedWidth / croppedHeight : 8 / 5
}

export function sanityImageLoader({src, width, quality}: {
  src: string
  width: number
  quality?: number
}) {
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('fit', 'max')
  url.searchParams.set('auto', 'format')
  url.searchParams.set('q', String(quality ?? 85))
  return url.toString()
}
