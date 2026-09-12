"use client";

import { type ReactNode, useCallback, useState } from "react";
import { RouteScrambleText } from "@/components/scramble-text";
import type { Locale } from "@/content/types";
import { ProjectsGallery } from "./projects-gallery";
import type { Project } from "./projects";
import styles from "./page.module.css";

type ProjectsViewProps = {
  children: ReactNode;
  heading: string;
  introduction: string;
  language: Locale;
  projects: Project[];
};

export function ProjectsView({
  children,
  heading,
  introduction,
  language,
  projects,
}: ProjectsViewProps) {
  const [listExitReady, setListExitReady] = useState(true);
  const handleExitStart = useCallback(() => setListExitReady(false), []);
  const handleExitComplete = useCallback(() => setListExitReady(true), []);

  return (
    <>
      <h1 className={styles.visuallyHidden}>{heading}</h1>

      <RouteScrambleText
        className={styles.collectionIntro}
        navigationReady={listExitReady}
        onExitStart={handleExitStart}
        routePrefix="/proyectos"
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
