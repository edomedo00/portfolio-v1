"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type AnimationEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type ScrambleTextPhase,
  ScrambleTransitionText,
} from "@/components/scramble-text";
import { ContentImage } from "@/components/content-image";
import type { ArchiveProject, Locale } from "@/content/types";
import { prefersReducedMotion } from "@/motion-preference";
import styles from "./page.module.css";

export type ArchiveProjectPreview = Pick<
  ArchiveProject,
  "archiveId" | "gallery" | "previewImage" | "slug" | "title"
>;

type ArchiveProjectsGalleryProps = {
  comingSoonLabel: string;
  exitRequested: boolean;
  language: Locale;
  nextArchiveId: string;
  onExitComplete: () => void;
  projects: ArchiveProjectPreview[];
};

type ArchiveProjectTextProps = {
  className: string;
  exitText: string;
  id: string;
  onAnimationEnd: (id: string, phase: ScrambleTextPhase) => void;
  onAnimationFrame: (id: string, text: string) => void;
  phase: ScrambleTextPhase;
  text: string;
};

type ArchiveMediaPhase = "entering" | "visible" | "exiting" | "empty";

const mediaTransitionDuration = 900;

function ArchiveProjectText({
  className,
  exitText,
  id,
  onAnimationEnd,
  onAnimationFrame,
  phase,
  text,
}: ArchiveProjectTextProps) {
  return (
    <ScrambleTransitionText
      accessibleText={text}
      className={className}
      onAnimationEnd={() => {
        onAnimationFrame(id, phase === "exiting" ? "" : text);
        onAnimationEnd(id, phase);
      }}
      onAnimationFrame={(value) => onAnimationFrame(id, value)}
      phase={phase}
      text={phase === "exiting" ? exitText : text}
    />
  );
}

export function ArchiveProjectsGallery({
  comingSoonLabel,
  exitRequested,
  language,
  nextArchiveId,
  onExitComplete,
  projects,
}: ArchiveProjectsGalleryProps) {
  const [copyPhase, setCopyPhase] = useState<ScrambleTextPhase>("empty");
  const [exitTexts, setExitTexts] = useState<Record<string, string>>({});
  const [mediaPhase, setMediaPhase] = useState<ArchiveMediaPhase>("empty");
  const copyPhaseRef = useRef<ScrambleTextPhase>("empty");
  const mediaPhaseRef = useRef<ArchiveMediaPhase>("empty");
  const completedTextAnimations = useRef(new Set<string>());
  const copyExitComplete = useRef(false);
  const mediaExitComplete = useRef(false);
  const exitReported = useRef(false);
  const mediaTimer = useRef<number | null>(null);
  const visibleTextById = useRef(new Map<string, string>());
  const textAnimationCount = (projects.length + 1) * 2;

  const clearMediaTimer = useCallback(() => {
    if (mediaTimer.current !== null) {
      window.clearTimeout(mediaTimer.current);
      mediaTimer.current = null;
    }
  }, []);

  const updateCopyPhase = useCallback((nextPhase: ScrambleTextPhase) => {
    copyPhaseRef.current = nextPhase;
    setCopyPhase(nextPhase);
  }, []);

  const updateMediaPhase = useCallback((nextPhase: ArchiveMediaPhase) => {
    mediaPhaseRef.current = nextPhase;
    setMediaPhase(nextPhase);
  }, []);

  const finishMediaEntrance = useCallback(() => {
    if (mediaPhaseRef.current !== "entering") return;

    clearMediaTimer();
    updateMediaPhase("visible");
  }, [clearMediaTimer, updateMediaPhase]);

  const finishCoordinatedExit = useCallback(() => {
    if (
      !copyExitComplete.current ||
      !mediaExitComplete.current ||
      exitReported.current
    ) {
      return;
    }

    exitReported.current = true;
    onExitComplete();
  }, [onExitComplete]);

  const finishMediaExit = useCallback(() => {
    if (mediaPhaseRef.current !== "exiting") return;

    clearMediaTimer();
    updateMediaPhase("empty");
    mediaExitComplete.current = true;
    finishCoordinatedExit();
  }, [clearMediaTimer, finishCoordinatedExit, updateMediaPhase]);

  const beginMediaExit = useCallback(() => {
    clearMediaTimer();

    if (mediaPhaseRef.current === "empty") {
      mediaExitComplete.current = true;
      finishCoordinatedExit();
      return;
    }

    if (prefersReducedMotion()) {
      updateMediaPhase("empty");
      mediaExitComplete.current = true;
      finishCoordinatedExit();
      return;
    }

    updateMediaPhase("exiting");
    mediaTimer.current = window.setTimeout(
      finishMediaExit,
      mediaTransitionDuration,
    );
  }, [
    clearMediaTimer,
    finishCoordinatedExit,
    finishMediaExit,
    updateMediaPhase,
  ]);

  const handleTextAnimationFrame = useCallback((id: string, value: string) => {
    visibleTextById.current.set(id, value);
  }, []);

  const handleTextAnimationEnd = useCallback(
    (id: string, completedPhase: ScrambleTextPhase) => {
      if (completedPhase !== copyPhaseRef.current) return;
      if (completedTextAnimations.current.has(id)) return;

      completedTextAnimations.current.add(id);

      if (completedTextAnimations.current.size !== textAnimationCount) return;

      if (copyPhaseRef.current === "appearing") {
        updateCopyPhase("visible");
      } else if (copyPhaseRef.current === "exiting") {
        updateCopyPhase("empty");
        copyExitComplete.current = true;
        finishCoordinatedExit();
      }
    },
    [finishCoordinatedExit, textAnimationCount, updateCopyPhase],
  );

  const beginExit = useCallback(() => {
    clearMediaTimer();

    if (copyPhaseRef.current === "exiting") return;

    exitReported.current = false;
    copyExitComplete.current = copyPhaseRef.current === "empty";
    mediaExitComplete.current = mediaPhaseRef.current === "empty";

    if (prefersReducedMotion()) {
      updateCopyPhase("empty");
      updateMediaPhase("empty");
      copyExitComplete.current = true;
      mediaExitComplete.current = true;
      finishCoordinatedExit();
      return;
    }

    if (copyPhaseRef.current !== "empty") {
      setExitTexts(Object.fromEntries(visibleTextById.current));
      completedTextAnimations.current.clear();
      updateCopyPhase("exiting");
    }

    beginMediaExit();
    finishCoordinatedExit();
  }, [
    beginMediaExit,
    clearMediaTimer,
    finishCoordinatedExit,
    updateCopyPhase,
    updateMediaPhase,
  ]);

  const handleMediaAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      if (event.currentTarget !== event.target) return;

      if (mediaPhaseRef.current === "entering") {
        finishMediaEntrance();
      } else if (mediaPhaseRef.current === "exiting") {
        finishMediaExit();
      }
    },
    [finishMediaEntrance, finishMediaExit],
  );

  useEffect(() => {
    visibleTextById.current.clear();

    const animationFrame = window.requestAnimationFrame(() => {
      if (prefersReducedMotion()) {
        updateMediaPhase("visible");
        updateCopyPhase("visible");
        return;
      }

      completedTextAnimations.current.clear();
      updateMediaPhase("entering");
      updateCopyPhase("appearing");
      mediaTimer.current = window.setTimeout(
        finishMediaEntrance,
        mediaTransitionDuration,
      );
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      clearMediaTimer();
    };
  }, [
    clearMediaTimer,
    finishMediaEntrance,
    updateCopyPhase,
    updateMediaPhase,
  ]);

  useEffect(() => {
    if (!exitRequested) return;

    const animationFrame = window.requestAnimationFrame(beginExit);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [beginExit, exitRequested]);

  const mediaAnimationClass =
    mediaPhase === "entering"
      ? styles.projectMediaEntering
      : mediaPhase === "exiting"
        ? styles.projectMediaExiting
        : mediaPhase === "empty"
          ? styles.projectMediaEmpty
          : "";
  const arrowAnimationClass =
    copyPhase === "appearing"
      ? styles.projectArrowEntering
      : copyPhase === "visible"
        ? styles.projectArrowVisible
        : copyPhase === "exiting"
          ? styles.projectArrowExiting
          : "";
  const accessibility =
    language === "es"
      ? {
          gallery: "Proyectos del archivo",
          next: "Próximo proyecto del archivo",
          pending: "Vista previa pendiente",
          preview: "Vista previa de",
        }
      : {
          gallery: "Archive projects",
          next: "Next archive project",
          pending: "Preview pending",
          preview: "Preview of",
        };

  return (
    <section aria-label={accessibility.gallery} className={styles.archiveTrack}>
      {projects.map((project, index) => (
        <Link
          className={styles.project}
          href={`/archive/${project.slug}`}
          key={project.slug}
          scroll={false}
        >
          <article>
            <ArchiveProjectText
              className={styles.projectId}
              exitText={exitTexts[`${project.slug}-id`] ?? ""}
              id={`${project.slug}-id`}
              onAnimationEnd={handleTextAnimationEnd}
              onAnimationFrame={handleTextAnimationFrame}
              phase={copyPhase}
              text={`[${String(project.archiveId).padStart(3, "0")}]`}
            />

            <figure className={styles.projectFigure}>
              <div
                className={`${styles.projectMedia} ${mediaAnimationClass}`}
                onAnimationEnd={handleMediaAnimationEnd}
              >
                <ContentImage
                  aria-label={`${accessibility.preview} ${project.title}`}
                  className={styles.projectImage}
                  fill
                  image={project.previewImage ?? project.gallery[0] ?? {
                    _key: `${project.slug}-fallback`,
                    alt: project.title,
                    src: "/projects/placeholders/proyecto-05.svg",
                  }}
                  loading={index === 0 ? "eager" : "lazy"}
                  quality={90}
                  sizes="(max-width: 47.999rem) calc(100vw - 2rem), (max-width: 74.999rem) calc(37.5vw - 2.65625rem), calc(25vw - 2.1875rem)"
                />
              </div>

              <figcaption className={styles.projectCaption}>
                <ArchiveProjectText
                  className={styles.projectTitle}
                  exitText={exitTexts[`${project.slug}-title`] ?? ""}
                  id={`${project.slug}-title`}
                  onAnimationEnd={handleTextAnimationEnd}
                  onAnimationFrame={handleTextAnimationFrame}
                  phase={copyPhase}
                  text={project.title}
                />
                <Image
                  alt=""
                  aria-hidden="true"
                  className={`${styles.projectArrow} ${arrowAnimationClass}`}
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
        aria-label={`${accessibility.next}, ${nextArchiveId}`}
        className={styles.project}
      >
        <ArchiveProjectText
          className={styles.projectId}
          exitText={exitTexts["next-project-id"] ?? ""}
          id="next-project-id"
          onAnimationEnd={handleTextAnimationEnd}
          onAnimationFrame={handleTextAnimationFrame}
          phase={copyPhase}
          text={`[${nextArchiveId}]`}
        />

        <figure className={styles.projectFigure}>
          <div
            className={`${styles.projectMedia} ${mediaAnimationClass}`}
            onAnimationEnd={handleMediaAnimationEnd}
          >
            <ContentImage
              className={styles.projectImage}
              fill
              image={{
                _key: "next-project-placeholder",
                alt: accessibility.pending,
                src: "/projects/placeholders/proyecto-05.svg",
              }}
              sizes="(max-width: 47.999rem) calc(100vw - 2rem), (max-width: 74.999rem) calc(37.5vw - 2.65625rem), calc(25vw - 2.1875rem)"
            />
          </div>

          <figcaption className={styles.projectCaption}>
            <ArchiveProjectText
              className={styles.projectTitle}
              exitText={exitTexts["next-project-title"] ?? ""}
              id="next-project-title"
              onAnimationEnd={handleTextAnimationEnd}
              onAnimationFrame={handleTextAnimationFrame}
              phase={copyPhase}
              text={comingSoonLabel}
            />
          </figcaption>
        </figure>
      </article>
    </section>
  );
}
