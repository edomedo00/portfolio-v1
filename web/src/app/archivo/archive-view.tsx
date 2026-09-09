import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  archiveDescription,
  navigationSubtitle,
  RouteScrambleText,
} from "@/components/scramble-text";
import { ArchiveCarousel } from "./archive-carousel";
import {
  archiveProjects,
  getNextArchiveId,
  type ArchiveProject,
} from "./archive-projects";
import styles from "./page.module.css";

type ArchiveViewProps = {
  children: ReactNode;
};

export function ArchiveView({ children }: ArchiveViewProps) {
  const nextArchiveId = getNextArchiveId();

  return (
    <>
      <h1 className={styles.visuallyHidden}>Archivo</h1>

      <RouteScrambleText
        className={styles.archiveIntro}
        routePrefix="/archivo"
        showCursor
        sourceText={navigationSubtitle}
        text={archiveDescription}
      />

      <ArchiveCarousel
        className={styles.archiveViewport}
        frameClassName={styles.archiveFrame}
      >
        <section
          aria-label="Proyectos del archivo"
          className={styles.archiveTrack}
        >
          {archiveProjects.map((project, index) => (
            <Link
              className={styles.project}
              href={`/archivo/${project.slug}`}
              key={project.slug}
              scroll={false}
            >
              <article>
                <p className={styles.projectId}>[{project.id}]</p>

                <figure className={styles.projectFigure}>
                  <div className={styles.projectMedia}>
                    <Image
                      alt={`Vista previa de ${project.title}`}
                      className={styles.projectImage}
                      fill
                      loading={index === 0 ? "eager" : "lazy"}
                      sizes="(max-width: 48rem) calc(100vw - 2.5rem), calc(25vw - 2.1875rem)"
                      src={project.image}
                      style={{ objectPosition: project.imagePosition }}
                    />

                    {project.kind === "video" ? (
                      <span className={styles.playIcon} aria-hidden="true">
                        <span className={styles.playTriangle} />
                      </span>
                    ) : null}
                  </div>

                  <figcaption className={styles.projectCaption}>
                    <span>{project.title}</span>
                    <Image
                      alt=""
                      className={styles.projectArrow}
                      height={17}
                      src="/icons/up-right-arrow.svg"
                      width={17}
                    />
                  </figcaption>
                </figure>
              </article>
            </Link>
          ))}

          <article
            aria-label={`Próximo proyecto del archivo, número ${nextArchiveId}`}
            className={styles.project}
          >
            <p className={styles.projectId}>[{nextArchiveId}]</p>

            <figure className={styles.projectFigure}>
              <div className={styles.projectMedia}>
                <Image
                  alt="Vista previa pendiente"
                  className={styles.projectImage}
                  fill
                  sizes="(max-width: 48rem) calc(100vw - 2.5rem), calc(25vw - 2.1875rem)"
                  src="/projects/placeholders/proyecto-05.svg"
                />
              </div>

              <figcaption className={styles.projectCaption}>
                <span>PRÓXIMAMENTE...</span>
              </figcaption>
            </figure>
          </article>
        </section>
      </ArchiveCarousel>

      {children}
    </>
  );
}

export function ArchiveProjectDetail({ project }: { project: ArchiveProject }) {
  return (
    <div className={styles.modalLayer}>
      <Link
        aria-hidden="true"
        className={styles.modalBackdrop}
        href="/archivo"
        scroll={false}
        tabIndex={-1}
      />
      <section
        aria-labelledby="archive-detail-title"
        aria-modal="true"
        className={styles.detailPanel}
        role="dialog"
      >
        <div className={styles.detailContent}>
          <Link
            aria-label="Cerrar proyecto de archivo"
            className={styles.detailClose}
            href="/archivo"
            scroll={false}
          >
            <Image alt="" height={14} src="/icons/cross.svg" width={14} />
          </Link>

          <h2 className={styles.detailHeading} id="archive-detail-title">
            {project.detail.title}
          </h2>

          <div className={styles.detailCopy}>
            {project.detail.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div
            className={styles.detailActions}
            aria-label="Enlaces del proyecto"
          >
            <a
              aria-label="Visitar proyecto en GitHub"
              className={styles.detailAction}
              href={project.detail.visitUrl}
              rel="noreferrer"
              target="_blank"
            >
              VISIT
              <span aria-hidden="true" className={styles.detailActionIcon} />
            </a>
            <a
              aria-label="Ver código del proyecto en GitHub"
              className={styles.detailAction}
              href={project.detail.codeUrl}
              rel="noreferrer"
              target="_blank"
            >
              CODE
              <span aria-hidden="true" className={styles.detailActionIcon} />
            </a>
          </div>

          <div className={styles.detailGalleryViewport}>
            <div
              aria-label={`Galería del proyecto ${project.detail.title}`}
              className={styles.detailGallery}
              id="archive-gallery"
              role="region"
              tabIndex={0}
            >
              {project.detail.gallery.map((image, index) => (
                <figure className={styles.detailMedia} key={image.src}>
                  <Image
                    alt={image.alt}
                    className={styles.detailImage}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="36vw"
                    src={image.src}
                    style={{ objectPosition: image.objectPosition }}
                  />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
