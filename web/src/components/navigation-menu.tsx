import Link from "next/link";
import type { Locale, SiteChromeContent } from "@/content/types";
import styles from "./navigation-menu.module.css";

const navigationItems = [
  { href: "/", id: "home" },
  { href: "/proyectos", id: "projects" },
  { href: "/archivo", id: "archive" },
  { href: "/acerca-de", id: "about" },
  { href: "/contacto", id: "contact" },
] as const;

export type NavigationItemId = (typeof navigationItems)[number]["id"];

type NavigationMenuProps = {
  activeItem?: NavigationItemId;
  labels: SiteChromeContent["navigation"];
  language: Locale;
};

export function NavigationMenu({ activeItem, labels, language }: NavigationMenuProps) {
  return (
    <nav aria-label={language === "es" ? "Navegación principal" : "Primary navigation"}>
      <ul className={styles.list}>
        {navigationItems.map(({ href, id }) => (
          <li key={href}>
            <Link
              className={styles.link}
              data-current={id === activeItem || undefined}
              href={href}
              aria-current={id === activeItem ? "page" : undefined}
            >
              {labels[id]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
