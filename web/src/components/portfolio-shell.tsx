import type { CSSProperties, ReactNode } from "react";
import styles from "@/app/page.module.css";
import { LocalTime } from "./local-time";
import {
  NavigationMenu,
  type NavigationItemId,
} from "./navigation-menu";

const verticalLines = ["25%", "50%", "75%"];
const horizontalLines = ["33.333333%", "66.666667%"];

const intersections = verticalLines.flatMap((x) =>
  horizontalLines.map((y) => ({ x, y })),
);

type GridPosition = CSSProperties & {
  "--grid-position"?: string;
  "--grid-x"?: string;
  "--grid-y"?: string;
};

type PortfolioShellProps = {
  activeItem: NavigationItemId;
  children?: ReactNode;
  headerVariant?: "hero" | "compact";
  showLocalTime?: boolean;
};

export function PortfolioShell({
  activeItem,
  children,
  headerVariant = "hero",
  showLocalTime = false,
}: PortfolioShellProps) {
  const navigationClassName =
    headerVariant === "compact"
      ? `${styles.navigation} ${styles.navigationCompact}`
      : styles.navigation;

  return (
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
        aria-label={
          headerVariant === "compact" ? "Navegación del portafolio" : undefined
        }
        aria-labelledby={headerVariant === "hero" ? "hero-title" : undefined}
      >
        <header className={styles.intro}>
          {headerVariant === "hero" ? (
            <>
              <h1 className={styles.title} id="hero-title">
                EDMUNDO MEDEL
              </h1>
              <p className={styles.subtitle}>
                DESARROLLADOR WEB Y PROGRAMADOR CREATIVO
              </p>
            </>
          ) : (
            <p className={styles.compactName}>EDMUNDO MEDEL</p>
          )}

          <div className={navigationClassName}>
            <NavigationMenu activeItem={activeItem} />
          </div>
        </header>

        {showLocalTime ? <LocalTime className={styles.localTime} /> : null}
      </section>

      {children}
    </main>
  );
}
