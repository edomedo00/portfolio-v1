"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ArchiveCarouselProps = {
  children: ReactNode;
  backdrop?: ReactNode;
  className: string;
  frameClassName: string;
};

export function ArchiveCarousel({
  children,
  backdrop,
  className,
  frameClassName,
}: ArchiveCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    function updateEdgeFades() {
      if (!carousel) return;

      const maximumScrollLeft = carousel.scrollWidth - carousel.clientWidth;
      carousel.parentElement?.style.setProperty("--archive-scroll-x", `${carousel.scrollLeft}px`);

      setCanScrollLeft(carousel.scrollLeft > 1);
      setCanScrollRight(carousel.scrollLeft < maximumScrollLeft - 1);
    }

    function handleWheel(event: WheelEvent) {
      const isDesktop = window.matchMedia("(min-width: 48.0625rem)").matches;
      const isVerticalWheel = Math.abs(event.deltaY) > Math.abs(event.deltaX);

      if (!isDesktop || !isVerticalWheel || !carousel) return;

      const multiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 80
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? carousel.clientWidth
            : 1;

      event.preventDefault();
      carousel.scrollLeft += event.deltaY * multiplier;
    }

    const resizeObserver = new ResizeObserver(updateEdgeFades);

    carousel.addEventListener("wheel", handleWheel, { passive: false });
    carousel.addEventListener("scroll", updateEdgeFades, { passive: true });
    resizeObserver.observe(carousel);

    if (carousel.firstElementChild) {
      resizeObserver.observe(carousel.firstElementChild);
    }

    updateEdgeFades();

    return () => {
      carousel.removeEventListener("wheel", handleWheel);
      carousel.removeEventListener("scroll", updateEdgeFades);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={frameClassName}
      data-can-scroll-left={canScrollLeft || undefined}
      data-can-scroll-right={canScrollRight || undefined}
    >
      {backdrop}
      <div
        aria-label="Carrusel de proyectos del archivo"
        className={className}
        ref={carouselRef}
        role="region"
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
