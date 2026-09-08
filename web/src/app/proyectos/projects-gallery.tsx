"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "./projects";
import styles from "./page.module.css";

type ProjectsGalleryProps = {
  projects: Project[];
};

export function ProjectsGallery({ projects }: ProjectsGalleryProps) {
  const [activeSlug, setActiveSlug] = useState<string>();

  return (
    <>
      <div className={styles.projectViewport}>
        <section
          aria-label="Lista de proyectos"
          className={styles.projectList}
          tabIndex={0}
        >
          {projects.map((project) => (
            <Link
              className={styles.projectLink}
              href={`/proyectos/${project.slug}`}
              key={project.slug}
              onBlur={() => setActiveSlug(undefined)}
              onFocus={() => setActiveSlug(project.slug)}
              onPointerEnter={() => setActiveSlug(project.slug)}
              onPointerLeave={() => setActiveSlug(undefined)}
            >
              <article className={styles.project}>
                <h2 className={styles.projectTitle}>{project.title}</h2>
                <p className={styles.projectMeta}>{project.meta}</p>
                <p className={styles.projectDescription}>
                  {project.description}
                </p>
              </article>
            </Link>
          ))}
        </section>
      </div>

      <figure className={styles.preview} aria-live="polite">
        {projects.map((project) => {
          const isActive = project.slug === activeSlug;

          return (
            <div
              aria-hidden={!isActive}
              className={`${styles.previewLayer} ${
                isActive ? styles.previewLayerActive : ""
              }`}
              key={project.slug}
            >
              {project.preview.kind === "kaomaxi-crop" ? (
                <Image
                  alt={project.preview.alt}
                  className={styles.kaomaxiPreviewImage}
                  height={900}
                  priority
                  src={project.preview.src}
                  unoptimized
                  width={1440}
                />
              ) : (
                <Image
                  alt={project.preview.alt}
                  className={styles.placeholderPreviewImage}
                  fill
                  sizes="38.5vw"
                  src={project.preview.src}
                  unoptimized
                />
              )}
            </div>
          );
        })}
      </figure>
    </>
  );
}
