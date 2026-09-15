"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDesktopWheelScroll } from "@/hooks/use-desktop-wheel-scroll";

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
  const pathname = usePathname();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useDesktopWheelScroll({
    axis: "x",
    enabled: pathname === "/archivo",
    targetRef: carouselRef,
  });

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

    const resizeObserver = new ResizeObserver(updateEdgeFades);

    carousel.addEventListener("scroll", updateEdgeFades, { passive: true });
    resizeObserver.observe(carousel);

    if (carousel.firstElementChild) {
      resizeObserver.observe(carousel.firstElementChild);
    }

    updateEdgeFades();

    return () => {
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
