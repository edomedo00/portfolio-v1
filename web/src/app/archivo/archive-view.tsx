import Image from 'next/image'
import Link from 'next/link'
import type {ReactNode} from 'react'
import {AnimatedRoutePanel} from '@/components/animated-route-panel'
import {ContentImage} from '@/components/content-image'
import {SectionHeading} from '@/components/section-heading'
import {RichText} from '@/components/rich-text'
import type {ArchiveContent, ArchiveProject, Locale} from '@/content/types'
import {ArchiveExperience} from './archive-experience'
import styles from './page.module.css'

type ArchiveViewProps = {
  children: ReactNode
  content: ArchiveContent
  language: Locale
}

export function ArchiveView({children, content, language}: ArchiveViewProps) {
  const highestProjectId = Math.max(
    0,
    ...content.projects.map((project) => project.archiveId || 0),
  )
  const nextArchiveId = String(highestProjectId + 1).padStart(3, '0')

  return (
    <>
      <SectionHeading>{content.page.heading}</SectionHeading>

      <ArchiveExperience
        comingSoonLabel={content.page.comingSoonLabel}
        introduction={content.page.introduction}
        language={language}
        nextArchiveId={nextArchiveId}
        projects={content.projects}
      />

      {children}
    </>
  )
}

export function ArchiveProjectDetail({
  language,
  project,
}: {
  language: Locale
  project: ArchiveProject
}) {
  const copy =
    language === 'es'
      ? {
          close: 'Cerrar proyecto de archivo',
          gallery: 'Galería del proyecto',
          links: 'Enlaces del proyecto',
          visit: 'VISITAR',
          code: 'CÓDIGO',
        }
      : {
          close: 'Close archive project',
          gallery: 'Project gallery',
          links: 'Project links',
          visit: 'VISIT',
          code: 'CODE',
        }

  return (
    <div className={styles.modalLayer}>
      <Link
        aria-hidden="true"
        className={styles.modalBackdrop}
        href="/archive"
        scroll={false}
        tabIndex={-1}
      />
      <AnimatedRoutePanel
        className={styles.detailPanel}
        dialog
        labelledBy="archive-detail-title"
      >
        <div className={styles.detailContent}>
          <header className={styles.detailHeader}>
            <Link
              aria-label={copy.close}
              className={styles.detailClose}
              href="/archive"
              scroll={false}
            >
              <Image alt="" height={14} src="/icons/cross.svg" width={14} />
            </Link>

            <h2 className={styles.detailHeading} id="archive-detail-title">
              {project.detailTitle}
            </h2>
          </header>

          <div className={styles.detailCopy}>
            <RichText value={project.body} />
          </div>

          {project.websiteUrl || project.codeUrl ? (
            <div className={styles.detailActions} aria-label={copy.links}>
              {project.websiteUrl ? (
                <a
                  className={styles.detailAction}
                  href={project.websiteUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {copy.visit}
                  <Image
                    alt=""
                    className={styles.detailActionIcon}
                    height={17}
                    src="/icons/up-right-arrow.svg"
                    width={17}
                  />
                </a>
              ) : null}
              {project.codeUrl ? (
                <a
                  className={styles.detailAction}
                  href={project.codeUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {copy.code}
                  <Image
                    alt=""
                    className={styles.detailActionIcon}
                    height={17}
                    src="/icons/up-right-arrow.svg"
                    width={17}
                  />
                </a>
              ) : null}
            </div>
          ) : null}

          <div className={styles.detailGalleryViewport}>
            <div
              aria-label={`${copy.gallery}: ${project.detailTitle}`}
              className={styles.detailGallery}
              id="archive-gallery"
              role="region"
              tabIndex={0}
            >
              {project.gallery.map((image, index) => (
                <figure
                  className={styles.detailMedia}
                  key={image._key}
                >
                  <ContentImage
                    className={styles.detailImage}
                    fill
                    image={image}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    quality={90}
                    sizes="(max-width: 47.999rem) calc(100vw - 2rem), (max-width: 74.999rem) and (orientation: portrait) calc(100vw - 7.5rem), (max-width: 74.999rem) calc(62.5vw - 6.09375rem), calc(41.666667vw - 5.3125rem)"
                  />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </AnimatedRoutePanel>
    </div>
  )
}
