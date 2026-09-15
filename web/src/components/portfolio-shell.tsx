"use client";

import { usePathname } from "next/navigation";
import { type CSSProperties, type ReactNode } from "react";
import styles from "@/app/page.module.css";
import { OrganismExperience } from "@/app/organismo/organism-experience";
import type { Locale, SiteChromeContent } from "@/content/types";
import { LanguageSwitcher } from "./language-switcher";
import { MobileHomeNavigation } from "./mobile-home-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { NavigationMenu, type NavigationItemId } from "./navigation-menu";
import { NavigationIdentity } from "./scramble-text";

const verticalLines = [
  { position: "25%", mobilePosition: "33.333333%" },
  { position: "50%", mobilePosition: "66.666667%" },
  { position: "75%", mobilePosition: null },
] as const;
const horizontalLines = ["33.333333%", "66.666667%"];
const intersections = verticalLines.flatMap(({ mobilePosition, position }) =>
  horizontalLines.map((y) => ({ mobileX: mobilePosition, x: position, y })),
);

type GridPosition = CSSProperties & {
  "--grid-position"?: string;
  "--grid-mobile-position"?: string;
  "--grid-x"?: string;
  "--grid-mobile-x"?: string;
  "--grid-y"?: string;
};

function getNavigationState(pathname: string): {
  activeItem?: NavigationItemId;
  isCompact: boolean;
} {
  if (pathname.startsWith("/projects")) {
    return { activeItem: "projects", isCompact: true };
  }

  if (pathname.startsWith("/archive")) {
    return { activeItem: "archive", isCompact: true };
  }

  if (pathname.startsWith("/about")) {
    return { activeItem: "about", isCompact: false };
  }

  if (pathname.startsWith("/contact")) {
    return { activeItem: "contact", isCompact: false };
  }

  if (pathname === "/") {
    return { activeItem: "home", isCompact: false };
  }

  return { isCompact: false };
}

type PortfolioShellProps = {
  backgroundSettingsJson?: string | null;
  children: ReactNode;
  content: SiteChromeContent;
  language: Locale;
};

export function PortfolioShell({
  backgroundSettingsJson,
  children,
  content,
  language,
}: PortfolioShellProps) {
  const pathname = usePathname();
  if (pathname === "/cells" || pathname === "/organismo") return children;

  const { activeItem, isCompact } = getNavigationState(pathname);
  const compactIdentity = content.settings.compactTitle;

  return (
    <main
      className={styles.canvas}
      data-compact={isCompact || undefined}
      data-route={activeItem}
    >
      <OrganismExperience
        background
        key={backgroundSettingsJson ?? "default-background-settings"}
        language={language}
        settingsJson={backgroundSettingsJson}
      />
      <div className={styles.grid} aria-hidden="true">
        {verticalLines.map(({ mobilePosition, position }) => (
          <span
            className={styles.verticalLine}
            data-mobile-hidden={!mobilePosition || undefined}
            key={`vertical-${position}`}
            style={{
              "--grid-mobile-position": mobilePosition ?? undefined,
              "--grid-position": position,
            } as GridPosition}
          />
        ))}

        {horizontalLines.map((position) => (
          <span
            className={styles.horizontalLine}
            key={`horizontal-${position}`}
            style={{ "--grid-position": position } as GridPosition}
          />
        ))}

        {intersections.map(({ mobileX, x, y }) => (
          <span
            className={styles.cross}
            data-mobile-hidden={!mobileX || undefined}
            key={`${x}-${y}`}
            style={{
              "--grid-mobile-x": mobileX ?? undefined,
              "--grid-x": x,
              "--grid-y": y,
            } as GridPosition}
          />
        ))}
      </div>

      {isCompact ? (
        <MobileNavigation
          activeItem={activeItem}
          content={content}
          language={language}
        />
      ) : null}

      {pathname === "/" ? (
        <MobileHomeNavigation content={content} language={language} />
      ) : null}

      <section
        className={`${styles.hero} ${styles.desktopHero}`}
        aria-label={
          isCompact
            ? language === "es"
              ? "Navegación del portafolio"
              : "Portfolio navigation"
            : undefined
        }
        aria-labelledby={!isCompact ? "hero-title" : undefined}
      >
        <header className={styles.intro}>
          <div
            aria-hidden={isCompact || undefined}
            className={`${styles.titleSlot} ${
              isCompact ? styles.titleSlotCompact : ""
            }`}
          >
            <div className={styles.titleSlotInner}>
              <h1 className={styles.title} id="hero-title">
                {content.settings.displayName}
              </h1>
            </div>
          </div>

          <NavigationIdentity
            className={isCompact ? styles.compactName : styles.subtitle}
            text={isCompact ? compactIdentity : content.settings.role}
          />

          <div className={styles.navigation}>
            <NavigationMenu
              activeItem={activeItem}
              labels={content.navigation}
              language={language}
            />
          </div>
        </header>
      </section>

      {children}

      <LanguageSwitcher
        className={styles.languageSelector}
        dividerClassName={styles.languageDivider}
        initialLanguage={language}
        optionClassName={styles.languageOption}
      />
    </main>
  );
}
