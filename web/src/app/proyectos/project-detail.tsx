import Image from "next/image";
import Link from "next/link";
import { AnimatedRoutePanel } from "@/components/animated-route-panel";
import { ContentImage } from "@/components/content-image";
import { RichText } from "@/components/rich-text";
import type { Locale } from "@/content/types";
import type { Project } from "./projects";
import styles from "./page.module.css";

type ProjectDetailProps = {
  language: Locale;
  project: Project;
};

export function ProjectDetail({ language, project }: ProjectDetailProps) {
  const disciplines = project.disciplines.join(" / ");
  const copy =
    language === "es"
      ? {
          close: "Cerrar proyecto",
          code: "CÓDIGO",
          gallery: "Imágenes del proyecto",
          visit: "VISITAR",
          visitLabel: "Visitar el sitio web de",
          codeLabel: "Ver el código de",
        }
      : {
          close: "Close project",
          code: "CODE",
          gallery: "Project images",
          visit: "VISIT",
          visitLabel: "Visit the website for",
          codeLabel: "View the code for",
        };

  return (
    <div className={styles.modalLayer}>
      <Link
        aria-hidden="true"
        className={styles.modalBackdrop}
        href="/projects"
        scroll={false}
        tabIndex={-1}
      />

      <AnimatedRoutePanel
        className={styles.projectModal}
        contentClassName={styles.projectModalContent}
        dialog
        labelledBy="project-detail-title"
      >
        <div className={styles.projectDetail}>
          <header className={styles.projectDetailHeader}>
            <Link
              aria-label={copy.close}
              className={styles.modalClose}
              href="/projects"
              scroll={false}
            >
              <Image
                alt=""
                className={styles.modalCloseIcon}
                height={14}
                src="/icons/cross.svg"
                width={14}
              />
            </Link>

            <h2 className={styles.projectDetailTitle} id="project-detail-title">
              {project.title}
            </h2>
          </header>

          <div className={styles.projectDetailMeta}>
            <span>{disciplines}</span>
            <span>{project.year}</span>
          </div>

          <div className={styles.projectDetailCopy}>
            <RichText value={project.body} />
          </div>

          {project.websiteUrl ? (
            <a
              aria-label={`${copy.visitLabel} ${project.title}`}
              className={styles.projectDetailAction}
              href={project.websiteUrl}
              rel="noreferrer"
              target="_blank"
            >
              {copy.visit}
              <Image
                alt=""
                height={17}
                src="/icons/up-right-arrow.svg"
                width={17}
              />
            </a>
          ) : null}

          {project.codeUrl ? (
            <a
              aria-label={`${copy.codeLabel} ${project.title}`}
              className={styles.projectDetailAction}
              href={project.codeUrl}
              rel="noreferrer"
              target="_blank"
            >
              {copy.code}
              <Image
                alt=""
                height={17}
                src="/icons/up-right-arrow.svg"
                width={17}
              />
            </a>
          ) : null}
        </div>

        <div className={styles.projectMediaViewport}>
          <div
            aria-label={`${copy.gallery} ${project.title}`}
            className={styles.projectMediaCarousel}
            role="region"
            tabIndex={0}
          >
            {project.gallery.map((image, index) => (
              <figure
                className={styles.projectDetailMedia}
                key={image._key ?? `${project.slug}-${index}`}
              >
                <ContentImage
                  className={styles.projectDetailImage}
                  fill
                  image={image}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="45vw"
                />
              </figure>
            ))}
          </div>
        </div>
      </AnimatedRoutePanel>
    </div>
  );
}
