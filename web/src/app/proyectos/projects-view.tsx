"use client";

import { type ReactNode, useCallback, useState } from "react";
import { RouteScrambleText } from "@/components/scramble-text";
import { SectionHeading } from "@/components/section-heading";
import type { Locale } from "@/content/types";
import { ProjectsGallery } from "./projects-gallery";
import type { Project } from "./projects";
import styles from "./page.module.css";

type ProjectsViewProps = {
  children: ReactNode;
  introduction: string;
  language: Locale;
  navigationLabel: string;
  projects: Project[];
};

export function ProjectsView({
  children,
  introduction,
  language,
  navigationLabel,
  projects,
}: ProjectsViewProps) {
  const [listExitReady, setListExitReady] = useState(true);
  const handleExitStart = useCallback(() => setListExitReady(false), []);
  const handleExitComplete = useCallback(() => setListExitReady(true), []);

  return (
    <>
      <SectionHeading>{navigationLabel}</SectionHeading>

      <RouteScrambleText
        className={styles.collectionIntro}
        navigationReady={listExitReady}
        onExitStart={handleExitStart}
        routePrefix="/projects"
        showCursor
        text={introduction}
      />

      <ProjectsGallery
        exitRequested={!listExitReady}
        language={language}
        onExitComplete={handleExitComplete}
        projects={projects}
      />

      {children}
    </>
  );
}
