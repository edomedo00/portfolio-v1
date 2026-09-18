"use client";

import { usePathname, useRouter } from "next/navigation";
import { useScramble } from "use-scramble";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { prefersReducedMotion } from "@/motion-preference";

export const navigationSubtitle = "DESARROLLADOR WEB Y PROGRAMADOR CREATIVO";
export const projectsDescription =
  "UNA COLECCIÓN DE PROYECTOS DE DISEÑO Y DESARROLLO WEB";
export const archiveDescription =
  "UN ESPACIO PARA MOSTRAR CONCEPTOS, PROYECTOS SECUNDARIOS, EXPERIMENTOS, COLABORACIONES";

const mobileScrambleMediaQuery = "(max-width: 47.999rem)";

const sharedScrambleParameters = {
  range: [65, 125] as [number, number],
  chance: 1,
  overdrive: false,
  overflow: false,
};

const desktopScrambleParameters = {
  ...sharedScrambleParameters,
  speed: 0.8,
  tick: 2,
  step: 5,
  scramble: 18,
  seed: 4,
};

function subscribeMobileScramble(onChange: () => void) {
  const media = window.matchMedia(mobileScrambleMediaQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getMobileScrambleSnapshot() {
  return window.matchMedia(mobileScrambleMediaQuery).matches;
}

function getServerMobileScrambleSnapshot() {
  return false;
}

function useLibraryScrambleParameters(text: string) {
  const isMobile = useSyncExternalStore(
    subscribeMobileScramble,
    getMobileScrambleSnapshot,
    getServerMobileScrambleSnapshot,
  );
  const characterCount = Array.from(text).length;

  return useMemo(
    () =>
      isMobile
        ? {
            ...sharedScrambleParameters,
            speed: 0.7,
            tick: 1,
            step: characterCount > 56 ? 2 : 1,
            scramble: 12,
            seed: 6,
          }
        : desktopScrambleParameters,
    [characterCount, isMobile],
  );
}

const invisibleCharacter = "\u200B";
const noop = () => undefined;
const visuallyHiddenText: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export type ScrambleTextPhase = "appearing" | "visible" | "exiting" | "empty";

type RouteScrambleTextProps = {
  className?: string;
  navigationReady?: boolean;
  onExitStart?: () => void;
  routePrefix: string;
  showCursor?: boolean;
  text: string;
};

type ScrambleInProps = {
  className?: string;
  onAnimationEnd: () => void;
  onAnimationFrame: (text: string) => void;
  showCursor: boolean;
  text: string;
};

type ScrambleOutProps = {
  accessibleText?: string;
  className?: string;
  onAnimationEnd: () => void;
  showCursor: boolean;
  text: string;
};

type ScrambleTransitionTextProps = {
  accessibleText?: string;
  className?: string;
  onAnimationEnd?: () => void;
  onAnimationFrame?: (text: string) => void;
  phase: ScrambleTextPhase;
  showCursor?: boolean;
  text: string;
};

type NavigationIdentityProps = {
  className?: string;
  text: string;
};

function hasVisibleText(text: string) {
  return Boolean(text.replace(/[\s\u00a0]/g, ""));
}

function isWithinRoute(pathname: string, routePrefix: string) {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

export function NavigationIdentity({
  className,
  text,
}: NavigationIdentityProps) {
  const [initialText] = useState(text);
  const scrambleParameters = useLibraryScrambleParameters(text);
  const { ref } = useScramble({
    text,
    ...scrambleParameters,
    overflow: true,
    playOnMount: false,
  });

  return (
    <p className={className}>
      <span style={visuallyHiddenText}>{text}</span>
      <span aria-hidden="true" ref={ref}>
        {initialText}
      </span>
    </p>
  );
}

function ScrambleIn({
  className,
  onAnimationEnd,
  onAnimationFrame,
  showCursor,
  text,
}: ScrambleInProps) {
  const cursorRef = useRef<HTMLSpanElement>(null);
  const scrambleParameters = useLibraryScrambleParameters(text);
  const { ref } = useScramble({
    text,
    ...scrambleParameters,
    onAnimationEnd,
    onAnimationFrame(result) {
      onAnimationFrame(result);

      if (cursorRef.current) {
        cursorRef.current.hidden = !hasVisibleText(result);
      }
    },
  });

  return (
    <p className={className}>
      <span style={visuallyHiddenText}>{text}</span>
      <span aria-hidden="true" ref={ref} />
      {showCursor ? (
        <span
          aria-hidden="true"
          className="terminalCursor"
          hidden
          ref={cursorRef}
        >
          _
        </span>
      ) : null}
    </p>
  );
}

function ScrambleOut({
  accessibleText,
  className,
  onAnimationEnd,
  showCursor,
  text,
}: ScrambleOutProps) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const scrambleParameters = useLibraryScrambleParameters(text);
  const reversedSource = useMemo(() => Array.from(text).reverse(), [text]);
  const target = useMemo(
    () =>
      reversedSource
        .map((character) => (character === " " ? " " : invisibleCharacter))
        .join(""),
    [reversedSource],
  );
  const { ref: driverRef } = useScramble({
    text: target,
    ...scrambleParameters,
    onAnimationEnd,
    onAnimationFrame(result) {
      const driverCharacters = Array.from(result);
      const nextText =
        result === target
          ? ""
          : [
              ...driverCharacters.map((character) =>
                character === invisibleCharacter ? "" : character,
              ),
              ...reversedSource.slice(driverCharacters.length),
            ]
              .reverse()
              .join("");

      if (displayRef.current) {
        displayRef.current.textContent = nextText;
      }

      if (cursorRef.current) {
        cursorRef.current.hidden = !hasVisibleText(nextText);
      }
    },
  });

  return (
    <p aria-hidden={accessibleText ? undefined : true} className={className}>
      {accessibleText ? (
        <span style={visuallyHiddenText}>{accessibleText}</span>
      ) : null}
      <span aria-hidden={accessibleText ? true : undefined}>
        <span ref={displayRef}>{text}</span>
        <span hidden ref={driverRef} />
        {showCursor ? (
          <span className="terminalCursor" ref={cursorRef}>
            _
          </span>
        ) : null}
      </span>
    </p>
  );
}

export function ScrambleTransitionText({
  accessibleText,
  className,
  onAnimationEnd,
  onAnimationFrame,
  phase,
  showCursor = false,
  text,
}: ScrambleTransitionTextProps) {
  if (phase === "exiting") {
    return (
      <ScrambleOut
        accessibleText={accessibleText}
        className={className}
        onAnimationEnd={onAnimationEnd ?? noop}
        showCursor={showCursor}
        text={text}
      />
    );
  }

  if (phase === "empty") {
    return accessibleText ? (
      <p className={className}>
        <span style={visuallyHiddenText}>{accessibleText}</span>
      </p>
    ) : (
      <p aria-hidden="true" className={className} />
    );
  }

  if (phase === "visible") {
    return (
      <p className={className}>
        {text}
        {showCursor ? (
          <span aria-hidden="true" className="terminalCursor">
            _
          </span>
        ) : null}
      </p>
    );
  }

  return (
    <ScrambleIn
      className={className}
      onAnimationEnd={onAnimationEnd ?? noop}
      onAnimationFrame={onAnimationFrame ?? noop}
      showCursor={showCursor}
      text={text}
    />
  );
}

export function RouteScrambleText({
  className,
  navigationReady = true,
  onExitStart,
  routePrefix,
  showCursor = false,
  text,
}: RouteScrambleTextProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentText = useRef("");
  const pendingRoute = useRef<string | null>(null);
  const [exitText, setExitText] = useState(text);
  const [phase, setPhase] = useState<ScrambleTextPhase>("appearing");

  useEffect(() => {
    if (phase !== "empty" || !navigationReady || !pendingRoute.current) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const nextRoute = pendingRoute.current;

      if (!nextRoute) return;

      pendingRoute.current = null;
      router.push(nextRoute);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [navigationReady, phase, router]);

  useEffect(() => {
    const handleNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
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
        isWithinRoute(destination.pathname, routePrefix)
      ) {
        return;
      }

      event.preventDefault();

      if (pendingRoute.current) return;

      pendingRoute.current = `${destination.pathname}${destination.search}${destination.hash}`;
      onExitStart?.();

      if (prefersReducedMotion()) {
        currentText.current = "";
        setPhase("empty");
        return;
      }

      const visibleText = currentText.current;
      setExitText(visibleText);
      setPhase(visibleText ? "exiting" : "empty");
    };

    window.addEventListener("click", handleNavigation, true);
    return () => window.removeEventListener("click", handleNavigation, true);
  }, [onExitStart, pathname, routePrefix]);

  return (
    <ScrambleTransitionText
      className={className}
      onAnimationEnd={() => {
        if (phase === "exiting") {
          currentText.current = "";
          setPhase("empty");
        } else if (phase === "appearing") {
          currentText.current = text;
          setPhase("visible");
        }
      }}
      onAnimationFrame={(value) => {
        currentText.current = value;
      }}
      phase={phase}
      showCursor={showCursor}
      text={phase === "exiting" ? exitText : text}
    />
  );
}
