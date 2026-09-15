"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContentImage } from "@/components/content-image";
import type { Locale } from "@/content/types";
import { useDesktopWheelScroll } from "@/hooks/use-desktop-wheel-scroll";
import {
  type ScrambleTextPhase,
  ScrambleTransitionText,
} from "@/components/scramble-text";
import type { Project } from "./projects";
import styles from "./page.module.css";

type ProjectsGalleryProps = {
  exitRequested: boolean;
  language: Locale;
  onExitComplete: () => void;
  projects: Project[];
};

// Set to true to restore the preserved hover/focus image preview.
const showProjectPreviews = false;
const rowTransitionDuration = 720;

type ProjectTextProps = {
  className: string;
  exitText: string;
  id: string;
  onAnimationEnd: (id: string, phase: ScrambleTextPhase) => void;
  onAnimationFrame: (id: string, text: string) => void;
  phase: ScrambleTextPhase;
  text: string;
};

function ProjectText({
  className,
  exitText,
  id,
  onAnimationEnd,
  onAnimationFrame,
  phase,
  text,
}: ProjectTextProps) {
  return (
    <ScrambleTransitionText
      accessibleText={text}
      className={className}
      onAnimationEnd={() => {
        onAnimationFrame(id, phase === "exiting" ? "" : text);
        onAnimationEnd(id, phase);
      }}
      onAnimationFrame={(value) => {
        onAnimationFrame(id, value);
      }}
      phase={phase}
      text={phase === "exiting" ? exitText : text}
    />
  );
}

export function ProjectsGallery({
  exitRequested,
  language,
  onExitComplete,
  projects,
}: ProjectsGalleryProps) {
  const pathname = usePathname();
  const [activeSlug, setActiveSlug] = useState<string>();
  const [exitTexts, setExitTexts] = useState<Record<string, string>>({});
  const [copyPhase, setCopyPhase] = useState<ScrambleTextPhase>("empty");
  const [rowsExpanded, setRowsExpanded] = useState(false);
  const copyPhaseRef = useRef<ScrambleTextPhase>("empty");
  const rowsExpandedRef = useRef(false);
  const completedAnimations = useRef(new Set<string>());
  const rowTimer = useRef<number | null>(null);
  const projectListRef = useRef<HTMLElement>(null);
  const visibleTextById = useRef(new Map<string, string>());
  const textAnimationCount = projects.length * 2;

  useDesktopWheelScroll({
    axis: "y",
    enabled: pathname === "/proyectos",
    targetRef: projectListRef,
  });

  const updateCopyPhase = useCallback((nextPhase: ScrambleTextPhase) => {
    copyPhaseRef.current = nextPhase;
    setCopyPhase(nextPhase);
  }, []);

  const updateRowsExpanded = useCallback((expanded: boolean) => {
    rowsExpandedRef.current = expanded;
    setRowsExpanded(expanded);
  }, []);

  const handleTextAnimationFrame = useCallback((id: string, value: string) => {
    visibleTextById.current.set(id, value);
  }, []);

  const finishRowExit = useCallback(() => {
    const rowsWereExpanded = rowsExpandedRef.current;
    updateRowsExpanded(false);

    if (
      !rowsWereExpanded ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      onExitComplete();
      return;
    }

    rowTimer.current = window.setTimeout(() => {
      rowTimer.current = null;
      onExitComplete();
    }, rowTransitionDuration);
  }, [onExitComplete, updateRowsExpanded]);

  const handleTextAnimationEnd = useCallback(
    (id: string, completedPhase: ScrambleTextPhase) => {
      if (completedPhase !== copyPhaseRef.current) return;
      if (completedAnimations.current.has(id)) return;

      completedAnimations.current.add(id);

      if (completedAnimations.current.size !== textAnimationCount) return;

      if (copyPhaseRef.current === "appearing") {
        updateCopyPhase("visible");
      } else if (copyPhaseRef.current === "exiting") {
        finishRowExit();
      }
    },
    [finishRowExit, textAnimationCount, updateCopyPhase],
  );

  const beginExit = useCallback(() => {
    if (rowTimer.current !== null) {
      window.clearTimeout(rowTimer.current);
      rowTimer.current = null;
    }

    if (copyPhaseRef.current === "exiting") return;

    if (copyPhaseRef.current === "empty") {
      finishRowExit();
      return;
    }

    setExitTexts(Object.fromEntries(visibleTextById.current));
    completedAnimations.current.clear();
    updateCopyPhase("exiting");
  }, [finishRowExit, updateCopyPhase]);

  useEffect(() => {
    completedAnimations.current.clear();
    visibleTextById.current.clear();
    const animationFrame = window.requestAnimationFrame(() => {
      updateRowsExpanded(true);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        updateCopyPhase("appearing");
        return;
      }

      rowTimer.current = window.setTimeout(() => {
        rowTimer.current = null;
        completedAnimations.current.clear();
        updateCopyPhase("appearing");
      }, rowTransitionDuration);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);

      if (rowTimer.current !== null) {
        window.clearTimeout(rowTimer.current);
      }
    };
  }, [updateCopyPhase, updateRowsExpanded]);

  useEffect(() => {
    if (!exitRequested) return;

    const animationFrame = window.requestAnimationFrame(beginExit);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [beginExit, exitRequested]);

  return (
    <>
      <div className={styles.projectViewport}>
        <section
          aria-label={language === "es" ? "Lista de proyectos" : "Project list"}
          className={styles.projectList}
          ref={projectListRef}
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
              scroll={false}
            >
              <article className={styles.project}>
                <div
                  className={`${styles.projectTitleSlot} ${
                    rowsExpanded ? styles.projectRowExpanded : ""
                  }`}
                >
                  <div className={styles.projectTitleInner}>
                    <h2
                      className={styles.projectTitle}
                    >
                      {project.title}
                    </h2>
                  </div>
                </div>

                <div
                  className={`${styles.projectCopySlot} ${
                    rowsExpanded ? styles.projectRowExpanded : ""
                  }`}
                >
                  <div className={styles.projectCopySlotInner}>
                    <div className={styles.projectCopySpace}>
                      <ProjectText
                        className={styles.projectMeta}
                        exitText={exitTexts[`${project.slug}-meta`] ?? ""}
                        id={`${project.slug}-meta`}
                        onAnimationEnd={handleTextAnimationEnd}
                        onAnimationFrame={handleTextAnimationFrame}
                        phase={copyPhase}
                        text={[...project.disciplines, String(project.year)].join(" / ")}
                      />
                      <ProjectText
                        className={styles.projectDescription}
                        exitText={
                          exitTexts[`${project.slug}-description`] ?? ""
                        }
                        id={`${project.slug}-description`}
                        onAnimationEnd={handleTextAnimationEnd}
                        onAnimationFrame={handleTextAnimationFrame}
                        phase={copyPhase}
                        text={project.projectType}
                      />
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      </div>

      {showProjectPreviews && <figure className={styles.preview} aria-live="polite">
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
              <ContentImage
                className={styles.placeholderPreviewImage}
                fill
                image={project.gallery[0]}
                priority={project.order === 1}
                sizes="38.5vw"
              />
            </div>
          );
        })}
      </figure>}
    </>
  );
}
