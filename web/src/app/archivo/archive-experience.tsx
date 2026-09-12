"use client";

import { useCallback, useState } from "react";
import type { Locale } from "@/content/types";
import { RouteScrambleText } from "@/components/scramble-text";
import { ArchiveCarousel } from "./archive-carousel";
import {
  type ArchiveProjectPreview,
  ArchiveProjectsGallery,
} from "./archive-projects-gallery";
import styles from "./page.module.css";

type ArchiveExperienceProps = {
  comingSoonLabel: string;
  introduction: string;
  language: Locale;
  nextArchiveId: string;
  projects: ArchiveProjectPreview[];
};

export function ArchiveExperience({
  comingSoonLabel,
  introduction,
  language,
  nextArchiveId,
  projects,
}: ArchiveExperienceProps) {
  const [galleryExitReady, setGalleryExitReady] = useState(true);
  const handleExitStart = useCallback(() => setGalleryExitReady(false), []);
  const handleExitComplete = useCallback(() => setGalleryExitReady(true), []);

  return (
    <>
      <RouteScrambleText
        className={styles.archiveIntro}
        navigationReady={galleryExitReady}
        onExitStart={handleExitStart}
        routePrefix="/archivo"
        showCursor
        text={introduction}
      />

      <ArchiveCarousel
        backdrop={
          <div className={styles.archiveTextBackdrop} aria-hidden="true">
            <div className={styles.archiveBackdropTrack}>
              {projects.map((project) => <span className={styles.archiveCardBackdrop} key={project.slug} />)}
              <span className={styles.archiveCardBackdrop} />
            </div>
          </div>
        }
        className={styles.archiveViewport}
        frameClassName={styles.archiveFrame}
      >
        <ArchiveProjectsGallery
          comingSoonLabel={comingSoonLabel}
          exitRequested={!galleryExitReady}
          language={language}
          nextArchiveId={nextArchiveId}
          onExitComplete={handleExitComplete}
          projects={projects}
        />
      </ArchiveCarousel>
    </>
  );
}
