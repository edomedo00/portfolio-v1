"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { Locale, SiteChromeContent } from "@/content/types";
import { LanguageSwitcher } from "./language-switcher";
import { NavigationMenu, type NavigationItemId } from "./navigation-menu";
import { NavigationIdentity } from "./scramble-text";
import styles from "./mobile-navigation.module.css";

type MobileNavigationProps = {
  activeItem?: NavigationItemId;
  content: SiteChromeContent;
  language: Locale;
};

export function MobileNavigation({
  activeItem,
  content,
  language,
}: MobileNavigationProps) {
  const menuId = useId();
  const pathname = usePathname();
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const isOpen = openPathname === pathname;
  const menuLabel =
    language === "es"
      ? isOpen
        ? "Cerrar menú"
        : "Abrir menú"
      : isOpen
        ? "Close menu"
        : "Open menu";

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPathname(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={styles.root} data-open={isOpen || undefined}>
      {isOpen ? (
        <button
          aria-hidden="true"
          aria-label={language === "es" ? "Cerrar menú" : "Close menu"}
          className={styles.backdrop}
          onClick={() => setOpenPathname(null)}
          tabIndex={-1}
          type="button"
        />
      ) : null}

      <header className={styles.header}>
        <NavigationIdentity
          className={styles.identity}
          text={content.settings.displayName}
        />
        <button
          aria-controls={menuId}
          aria-expanded={isOpen}
          aria-label={menuLabel}
          className={styles.menuButton}
          onClick={() => setOpenPathname(isOpen ? null : pathname)}
          type="button"
        >
          MENU
        </button>
      </header>

      {isOpen ? (
        <>
          <div className={styles.menu} id={menuId}>
            <NavigationMenu
              activeItem={activeItem}
              labels={content.navigation}
              language={language}
              listClassName={styles.menuList}
              onNavigate={() => setOpenPathname(null)}
            />
          </div>

          <LanguageSwitcher
            className={styles.languageSelector}
            dividerClassName={styles.languageDivider}
            initialLanguage={language}
            optionClassName={styles.languageOption}
          />
        </>
      ) : null}
    </div>
  );
}
