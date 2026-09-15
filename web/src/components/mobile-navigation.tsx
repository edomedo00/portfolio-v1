"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Locale, SiteChromeContent } from "@/content/types";
import { prefersReducedMotion } from "@/motion-preference";
import { LanguageSwitcher } from "./language-switcher";
import { NavigationMenu, type NavigationItemId } from "./navigation-menu";
import {
  type ScrambleTextPhase,
  ScrambleTransitionText,
} from "./scramble-text";
import styles from "./mobile-navigation.module.css";

type MobileNavigationProps = {
  activeItem?: NavigationItemId;
  content: SiteChromeContent;
  language: Locale;
};

function isCompactPath(pathname: string) {
  return (
    pathname === "/projects" ||
    pathname.startsWith("/projects/") ||
    pathname === "/archive" ||
    pathname.startsWith("/archive/")
  );
}

export function MobileNavigation({
  activeItem,
  content,
  language,
}: MobileNavigationProps) {
  const menuId = useId();
  const pathname = usePathname();
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const [identityPhase, setIdentityPhase] =
    useState<ScrambleTextPhase>("appearing");
  const [identityExitText, setIdentityExitText] = useState(
    content.settings.compactTitle,
  );
  const currentIdentity = useRef("");
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

  useEffect(() => {
    const handleNavigation = (event: MouseEvent) => {
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
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === pathname ||
        isCompactPath(destination.pathname) ||
        identityPhase === "exiting" ||
        identityPhase === "empty"
      ) {
        return;
      }

      if (prefersReducedMotion()) {
        currentIdentity.current = "";
        setIdentityPhase("empty");
        return;
      }

      const visibleText =
        currentIdentity.current || content.settings.compactTitle;
      setIdentityExitText(visibleText);
      setIdentityPhase("exiting");
    };

    window.addEventListener("click", handleNavigation, true);
    return () => window.removeEventListener("click", handleNavigation, true);
  }, [content.settings.compactTitle, identityPhase, pathname]);

  const handleIdentityAnimationEnd = () => {
    if (identityPhase === "appearing") {
      currentIdentity.current = content.settings.compactTitle;
      setIdentityPhase("visible");
      return;
    }

    if (identityPhase === "exiting") {
      currentIdentity.current = "";
      setIdentityPhase("empty");
    }
  };

  return (
    <div
      className={styles.root}
      data-identity-exiting={
        identityPhase === "exiting" || identityPhase === "empty" || undefined
      }
      data-open={isOpen || undefined}
    >
      <button
        aria-hidden={isOpen ? undefined : true}
        aria-label={language === "es" ? "Cerrar menú" : "Close menu"}
        className={styles.backdrop}
        onClick={() => setOpenPathname(null)}
        tabIndex={-1}
        type="button"
      />

      <header className={styles.header}>
        <Link className={styles.identityLink} href="/">
          <ScrambleTransitionText
            accessibleText={content.settings.compactTitle}
            className={styles.identity}
            onAnimationEnd={handleIdentityAnimationEnd}
            onAnimationFrame={(value) => {
              currentIdentity.current = value;
            }}
            phase={identityPhase}
            text={
              identityPhase === "exiting"
                ? identityExitText
                : content.settings.compactTitle
            }
          />
        </Link>
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

      <div
        aria-hidden={!isOpen}
        className={styles.menu}
        data-open={isOpen || undefined}
        id={menuId}
      >
        <div className={styles.menuInner}>
          <NavigationMenu
            activeItem={activeItem}
            labels={content.navigation}
            language={language}
            listClassName={styles.menuList}
            onNavigate={() => setOpenPathname(null)}
          />
        </div>
      </div>

      {isOpen ? (
        <LanguageSwitcher
          className={styles.languageSelector}
          dividerClassName={styles.languageDivider}
          initialLanguage={language}
          optionClassName={styles.languageOption}
        />
      ) : null}
    </div>
  );
}
