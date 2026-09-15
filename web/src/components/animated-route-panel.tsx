"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/motion-preference";

const closeSequenceDuration = 1060;

type AnimatedRoutePanelProps = {
  children: ReactNode;
  className: string;
  contentClassName?: string;
  dialog?: boolean;
  labelledBy: string;
};

export function AnimatedRoutePanel({
  children,
  className,
  contentClassName,
  dialog = false,
  labelledBy,
}: AnimatedRoutePanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const closing = useRef(false);
  const closeTimer = useRef<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

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
        destination.pathname === pathname
      ) {
        return;
      }

      const navigationIsManaged = event.defaultPrevented;

      if (!navigationIsManaged) {
        event.preventDefault();
      }

      if (closing.current) return;

      const nextRoute = `${destination.pathname}${destination.search}${destination.hash}`;
      if (prefersReducedMotion()) {
        if (!navigationIsManaged) {
          router.push(nextRoute);
        }
        return;
      }

      closing.current = true;
      setIsClosing(true);

      if (!navigationIsManaged) {
        closeTimer.current = window.setTimeout(() => {
          closeTimer.current = null;
          router.push(nextRoute);
        }, closeSequenceDuration);
      }
    };

    document.addEventListener("click", handleNavigation, true);

    return () => {
      document.removeEventListener("click", handleNavigation, true);

      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, [pathname, router]);

  return (
    <section
      aria-hidden={isClosing || undefined}
      aria-labelledby={labelledBy}
      aria-modal={dialog || undefined}
      className={`${className} routePanelGrow ${
        isClosing ? "routePanelClosing" : ""
      }`}
      role={dialog ? "dialog" : undefined}
    >
      <div
        className={`routePanelContent${
          contentClassName ? ` ${contentClassName}` : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}
