"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ArchiveCarouselProps = {
  children: ReactNode;
  className: string;
};

export function ArchiveCarousel({
  children,
  className,
}: ArchiveCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    function handleWheel(event: WheelEvent) {
      const isDesktop = window.matchMedia("(min-width: 48.0625rem)").matches;
      const isVerticalWheel = Math.abs(event.deltaY) > Math.abs(event.deltaX);

      if (!isDesktop || !isVerticalWheel || !carousel) return;

      const multiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? carousel.clientWidth
            : 1;

      event.preventDefault();
      carousel.scrollLeft += event.deltaY * multiplier;
    }

    carousel.addEventListener("wheel", handleWheel, { passive: false });

    return () => carousel.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      aria-label="Carrusel de proyectos del archivo"
      className={className}
      ref={carouselRef}
      role="region"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
