"use client";

import { useCallback, useState } from "react";
import type { Locale } from "@/content/types";
import { RouteScrambleText } from "@/components/scramble-text";
import { SectionHeading } from "@/components/section-heading";
import { ArchiveCarousel } from "./archive-carousel";
import {
  type ArchiveProjectPreview,
  ArchiveProjectsGallery,
} from "./archive-projects-gallery";
import styles from "./page.module.css";

type ArchiveExperienceProps = {
  comingSoonLabel: string;
  heading: string;
  introduction: string;
  language: Locale;
  nextArchiveId: string;
  projects: ArchiveProjectPreview[];
};

export function ArchiveExperience({
  comingSoonLabel,
  heading,
  introduction,
  language,
  nextArchiveId,
  projects,
}: ArchiveExperienceProps) {
  const [galleryExitReady, setGalleryExitReady] = useState(true);
  const [headingExitReady, setHeadingExitReady] = useState(true);
  const [headingExiting, setHeadingExiting] = useState(false);
  const handleExitStart = useCallback(() => {
    setGalleryExitReady(false);
    setHeadingExitReady(false);
    setHeadingExiting(true);
  }, []);
  const handleExitComplete = useCallback(() => setGalleryExitReady(true), []);
  const handleHeadingExitComplete = useCallback(() => setHeadingExitReady(true), []);

  return (
    <>
      <SectionHeading exiting={headingExiting} onExitComplete={handleHeadingExitComplete}>
        {heading}
      </SectionHeading>
      <RouteScrambleText
        className={styles.archiveIntro}
        navigationReady={galleryExitReady && headingExitReady}
        onExitStart={handleExitStart}
        routePrefix="/archive"
        showCursor
        text={introduction}
      />

      <ArchiveCarousel
        backdrop={
          <div className={styles.archiveTextBackdrop} aria-hidden="true">
            <div className={styles.archiveBackdropTrack}>
              {projects.map((project) => <span className={styles.archiveCardBackdrop} key={project.slug} />)}
              {/* Restore the extra backdrop when the Coming soon card is enabled again. */}
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
