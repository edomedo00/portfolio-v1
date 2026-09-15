"use client";

import { useEffect, type RefObject } from "react";

type ScrollAxis = "x" | "y";

type DesktopWheelScrollOptions = {
  axis: ScrollAxis;
  enabled: boolean;
  targetRef: RefObject<HTMLElement | null>;
};

const desktopMediaQuery = "(min-width: 48.0625rem)";

function getPixelDelta(event: WheelEvent, axis: ScrollAxis, viewportSize: number) {
  const delta =
    axis === "x"
      ? Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY
      : Math.abs(event.deltaY) >= Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;

  const multiplier =
    event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 80
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? viewportSize
        : 1;

  return delta * multiplier;
}

export function useDesktopWheelScroll({
  axis,
  enabled,
  targetRef,
}: DesktopWheelScrollOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handleWheel(event: WheelEvent) {
      const target = targetRef.current;

      if (
        !target ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        !window.matchMedia(desktopMediaQuery).matches
      ) {
        return;
      }

      const isHorizontal = axis === "x";
      const viewportSize = isHorizontal ? target.clientWidth : target.clientHeight;
      const delta = getPixelDelta(event, axis, viewportSize);
      const position = isHorizontal ? target.scrollLeft : target.scrollTop;
      const maximum = isHorizontal
        ? target.scrollWidth - target.clientWidth
        : target.scrollHeight - target.clientHeight;

      if (
        delta === 0 ||
        maximum <= 0 ||
        (delta < 0 && position <= 0) ||
        (delta > 0 && position >= maximum - 1)
      ) {
        return;
      }

      event.preventDefault();

      if (isHorizontal) {
        target.scrollLeft += delta;
      } else {
        target.scrollTop += delta;
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [axis, enabled, targetRef]);
}
