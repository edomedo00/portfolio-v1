"use client";

import { usePathname } from "next/navigation";
import { type CSSProperties, type ReactNode } from "react";
import styles from "@/app/page.module.css";
import { LocalTime } from "./local-time";
import {
  NavigationMenu,
  type NavigationItemId,
} from "./navigation-menu";
import {
  descriptionScrambleTargets,
  navigationSubtitle,
  RouteScrambleProvider,
  ScrambleText,
} from "./scramble-text";

const verticalLines = ["25%", "50%", "75%"];
const horizontalLines = ["33.333333%", "66.666667%"];
const compactIdentity = "EDMUNDO MEDEL";

const intersections = verticalLines.flatMap((x) =>
  horizontalLines.map((y) => ({ x, y })),
);

type GridPosition = CSSProperties & {
  "--grid-position"?: string;
  "--grid-x"?: string;
  "--grid-y"?: string;
};

function getNavigationState(pathname: string): {
  activeItem?: NavigationItemId;
  isCompact: boolean;
  showLocalTime: boolean;
} {
  if (pathname.startsWith("/proyectos")) {
    return { activeItem: "projects", isCompact: true, showLocalTime: true };
  }

  if (pathname.startsWith("/archivo")) {
    return { activeItem: "archive", isCompact: true, showLocalTime: true };
  }

  if (pathname.startsWith("/acerca-de")) {
    return { activeItem: "about", isCompact: false, showLocalTime: false };
  }

  if (pathname.startsWith("/contacto")) {
    return { activeItem: "contact", isCompact: false, showLocalTime: false };
  }

  if (pathname === "/") {
    return { activeItem: "home", isCompact: false, showLocalTime: true };
  }

  return { isCompact: false, showLocalTime: false };
}

export function PortfolioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { activeItem, isCompact, showLocalTime } = getNavigationState(pathname);

  return (
    <RouteScrambleProvider targets={descriptionScrambleTargets}>
      <main className={styles.canvas}>
        <div className={styles.grid} aria-hidden="true">
          {verticalLines.map((position) => (
            <span
              className={styles.verticalLine}
              key={`vertical-${position}`}
              style={{ "--grid-position": position } as GridPosition}
            />
          ))}

          {horizontalLines.map((position) => (
            <span
              className={styles.horizontalLine}
              key={`horizontal-${position}`}
              style={{ "--grid-position": position } as GridPosition}
            />
          ))}

          {intersections.map(({ x, y }) => (
            <span
              className={styles.cross}
              key={`${x}-${y}`}
              style={{ "--grid-x": x, "--grid-y": y } as GridPosition}
            />
          ))}
        </div>

        <section
          className={styles.hero}
          aria-label={isCompact ? "Navegación del portafolio" : undefined}
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
                  EDMUNDO MEDEL
                </h1>
              </div>
            </div>

            <ScrambleText
              animateOnMount={false}
              as="p"
              className={`${styles.identity} ${
                isCompact ? styles.compactName : styles.subtitle
              }`}
              from={isCompact ? navigationSubtitle : compactIdentity}
              fromLetterSpacingEm={isCompact ? 0 : 0.5}
              to={isCompact ? compactIdentity : navigationSubtitle}
              toLetterSpacingEm={isCompact ? 0.5 : 0}
            />

            <div className={styles.navigation}>
              <NavigationMenu activeItem={activeItem} />
            </div>
          </header>

          {showLocalTime ? <LocalTime className={styles.localTime} /> : null}
        </section>

        {children}
      </main>
    </RouteScrambleProvider>
  );
}
