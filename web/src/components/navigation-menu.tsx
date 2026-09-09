import Link from "next/link";
import styles from "./navigation-menu.module.css";

const navigationItems = [
  { href: "/", id: "home", label: "INICIO" },
  { href: "/proyectos", id: "projects", label: "PROYECTOS" },
  { href: "/archivo", id: "archive", label: "ARCHIVO" },
  { href: "/acerca-de", id: "about", label: "ACERCA DE" },
  { href: "/contacto", id: "contact", label: "CONTACTO" },
] as const;

export type NavigationItemId = (typeof navigationItems)[number]["id"];

type NavigationMenuProps = {
  activeItem?: NavigationItemId;
};

export function NavigationMenu({ activeItem }: NavigationMenuProps) {
  return (
    <nav aria-label="Navegación principal">
      <ul className={styles.list}>
        {navigationItems.map(({ href, id, label }) => (
          <li key={href}>
            <Link
              className={styles.link}
              data-current={id === activeItem || undefined}
              href={href}
              aria-current={id === activeItem ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
