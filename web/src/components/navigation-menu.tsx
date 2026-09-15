import Link from "next/link";
import type { Locale, SiteChromeContent } from "@/content/types";
import styles from "./navigation-menu.module.css";

const navigationItems = [
  { href: "/", id: "home" },
  { href: "/projects", id: "projects" },
  { href: "/archive", id: "archive" },
  { href: "/about", id: "about" },
  { href: "/contact", id: "contact" },
] as const;

export type NavigationItemId = (typeof navigationItems)[number]["id"];

type NavigationMenuProps = {
  activeItem?: NavigationItemId;
  labels: SiteChromeContent["navigation"];
  language: Locale;
  listClassName?: string;
  onNavigate?: () => void;
};

export function NavigationMenu({
  activeItem,
  labels,
  language,
  listClassName,
  onNavigate,
}: NavigationMenuProps) {
  return (
    <nav aria-label={language === "es" ? "Navegación principal" : "Primary navigation"}>
      <ul className={`${styles.list} ${listClassName ?? ""}`}>
        {navigationItems.map(({ href, id }) => (
          <li key={href}>
            <Link
              className={styles.link}
              data-current={id === activeItem || undefined}
              href={href}
              onClick={onNavigate}
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
