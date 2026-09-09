import type { ReactNode } from "react";
import {
  navigationSubtitle,
  projectsDescription,
  RouteScrambleText,
} from "@/components/scramble-text";
import { ProjectsGallery } from "./projects-gallery";
import { projects } from "./projects";
import styles from "./page.module.css";

type ProjectsViewProps = {
  children: ReactNode;
};

export function ProjectsView({ children }: ProjectsViewProps) {
  return (
    <>
      <h1 className={styles.visuallyHidden}>Proyectos</h1>

      <RouteScrambleText
        className={styles.collectionIntro}
        routePrefix="/proyectos"
        showCursor
        sourceText={navigationSubtitle}
        text={projectsDescription}
      />

      <ProjectsGallery projects={projects} />

      {children}
    </>
  );
}
