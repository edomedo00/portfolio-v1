"use client";

import { useRouter } from "next/navigation";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Locale, SiteChromeContent } from "@/content/types";
import { prefersReducedMotion } from "@/motion-preference";
import { LanguageSwitcher } from "./language-switcher";
import { NavigationMenu } from "./navigation-menu";
import {
  type ScrambleTextPhase,
  ScrambleTransitionText,
} from "./scramble-text";
import styles from "./mobile-home-navigation.module.css";

const titleTransitionDuration = 720;

type MobileHomeNavigationProps = {
  content: SiteChromeContent;
  language: Locale;
};

export function MobileHomeNavigation({
  content,
  language,
}: MobileHomeNavigationProps) {
  const router = useRouter();
  const [titleExpanded, setTitleExpanded] = useState(false);
  const [subtitlePhase, setSubtitlePhase] =
    useState<ScrambleTextPhase>("empty");
  const [subtitleExitText, setSubtitleExitText] = useState(
    content.settings.role,
  );
  const [menuExpanded, setMenuExpanded] = useState(false);
  const currentSubtitle = useRef("");
  const pendingRoute = useRef<string | null>(null);
  const entranceTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (entranceTimer.current !== null) {
      window.clearTimeout(entranceTimer.current);
      entranceTimer.current = null;
    }

    if (exitTimer.current !== null) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setTitleExpanded(true);

      if (prefersReducedMotion()) {
        currentSubtitle.current = content.settings.role;
        setSubtitlePhase("visible");
        setMenuExpanded(true);
        return;
      }

      entranceTimer.current = window.setTimeout(() => {
        entranceTimer.current = null;
        setSubtitlePhase("appearing");
        setMenuExpanded(true);
      }, titleTransitionDuration);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      clearTimers();
    };
  }, [clearTimers, content.settings.role]);

  const finishExit = useCallback(() => {
    setTitleExpanded(false);
    exitTimer.current = window.setTimeout(() => {
      exitTimer.current = null;
      const nextRoute = pendingRoute.current;
      pendingRoute.current = null;

      if (nextRoute) router.push(nextRoute);
    }, titleTransitionDuration);
  }, [router]);

  const handleSubtitleAnimationEnd = useCallback(() => {
    if (subtitlePhase === "appearing") {
      currentSubtitle.current = content.settings.role;
      setSubtitlePhase("visible");
      return;
    }

    if (subtitlePhase === "exiting") {
      currentSubtitle.current = "";
      setSubtitlePhase("empty");
      finishExit();
    }
  }, [content.settings.role, finishExit, subtitlePhase]);

  const handleNavigation = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname
      ) {
        return;
      }

      if (prefersReducedMotion()) {
        return;
      }

      event.preventDefault();
      if (pendingRoute.current) return;

      pendingRoute.current = `${destination.pathname}${destination.search}${destination.hash}`;
      clearTimers();
      setMenuExpanded(false);
      setSubtitleExitText(
        currentSubtitle.current || content.settings.role,
      );
      setSubtitlePhase("exiting");
    },
    [clearTimers, content.settings.role],
  );

  return (
    <section
      aria-labelledby="mobile-hero-title"
      className={styles.hero}
      onClickCapture={handleNavigation}
    >
      <header className={styles.intro}>
        <div
          className={`${styles.titleSlot} ${
            titleExpanded ? styles.titleSlotExpanded : ""
          }`}
        >
          <div className={styles.titleSlotInner}>
            <h1 className={styles.title} id="mobile-hero-title">
              {content.settings.displayName}
            </h1>
          </div>
        </div>

        <div className={styles.subtitleSlot}>
          <p
            aria-hidden="true"
            className={`${styles.subtitle} ${styles.subtitleMeasure}`}
          >
            {content.settings.role}
          </p>
          <div className={styles.subtitleAnimation}>
            <ScrambleTransitionText
              accessibleText={content.settings.role}
              className={styles.subtitle}
              onAnimationEnd={handleSubtitleAnimationEnd}
              onAnimationFrame={(value) => {
                currentSubtitle.current = value;
              }}
              phase={subtitlePhase}
              text={
                subtitlePhase === "exiting"
                  ? subtitleExitText
                  : content.settings.role
              }
            />
          </div>
        </div>

        <div
          className={styles.menuSlot}
          data-expanded={menuExpanded || undefined}
        >
          <div className={styles.menuSlotInner}>
            <NavigationMenu
              activeItem="home"
              labels={content.navigation}
              language={language}
            />
          </div>
        </div>
      </header>

      <div
        aria-hidden={!menuExpanded}
        className={styles.languageSlot}
        data-expanded={menuExpanded || undefined}
      >
        <LanguageSwitcher
          className={styles.languageSelector}
          dividerClassName={styles.languageDivider}
          initialLanguage={language}
          optionClassName={styles.languageOption}
        />
      </div>
    </section>
  );
}
