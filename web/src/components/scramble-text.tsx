"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export const navigationSubtitle =
  "DESARROLLADOR WEB Y PROGRAMADOR CREATIVO";
export const projectsDescription =
  "UNA COLECCIÓN DE PROYECTOS DE DISEÑO Y DESARROLLO WEB";
export const archiveDescription =
  "UN ESPACIO PARA MOSTRAR CONCEPTOS, PROYECTOS SECUNDARIOS, EXPERIMENTOS, COLABORACIONES";
export const scrambleDuration = 900;

export const descriptionScrambleTargets = [
  { routePrefix: "/proyectos", text: projectsDescription },
  { routePrefix: "/archivo", text: archiveDescription },
] as const;

const scrambleInterval = 65;
const scrambleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/[]{}+-_*";

type ScrambleState = {
  key: string;
  progress: number;
  text: string;
};

type ScrambleTextProps = {
  animateOnMount?: boolean;
  as?: "p" | "span";
  className?: string;
  duration?: number;
  from: string;
  fromLetterSpacingEm?: number;
  showCursor?: boolean;
  style?: CSSProperties;
  to: string;
  toLetterSpacingEm?: number;
};

type RouteScrambleTextProps = {
  className?: string;
  duration?: number;
  routePrefix: string;
  showCursor?: boolean;
  sourceText: string;
  text: string;
};

type RouteScrambleTarget = {
  routePrefix: string;
  text: string;
};

type RouteScrambleContextValue = {
  completeTransition: (routePrefix: string) => void;
  isTransitionDestination: (routePrefix: string) => boolean;
  prepareTransition: (target?: RouteScrambleTarget) => void;
  resolveTarget: (pathname: string) => RouteScrambleTarget | undefined;
};

const RouteScrambleContext = createContext<RouteScrambleContextValue | null>(
  null,
);

function getScrambledText(source: string, target: string, progress: number) {
  if (progress >= 1) return target;

  const length = Math.round(
    source.length + (target.length - source.length) * progress,
  );
  const settledCharacters = Math.floor(target.length * progress);

  return Array.from({ length }, (_, index) => {
    if (index < settledCharacters) return target[index] ?? "";

    const referenceCharacter = target[index] ?? source[index];
    if (referenceCharacter === " ") return " ";

    const randomIndex = Math.floor(Math.random() * scrambleCharacters.length);
    return scrambleCharacters[randomIndex];
  }).join("");
}

function isWithinRoute(pathname: string, routePrefix: string) {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

export function RouteScrambleProvider({
  children,
  targets,
}: {
  children: ReactNode;
  targets: readonly RouteScrambleTarget[];
}) {
  const pendingTransition = useRef<RouteScrambleTarget | null>(null);
  const contextValue = useMemo<RouteScrambleContextValue>(
    () => ({
      completeTransition(routePrefix) {
        if (pendingTransition.current?.routePrefix === routePrefix) {
          pendingTransition.current = null;
        }
      },
      isTransitionDestination(routePrefix) {
        return pendingTransition.current?.routePrefix === routePrefix;
      },
      prepareTransition(target) {
        pendingTransition.current = target ?? null;
      },
      resolveTarget(pathname) {
        return targets.reduce<RouteScrambleTarget | undefined>(
          (match, target) =>
            isWithinRoute(pathname, target.routePrefix) &&
            (!match || target.routePrefix.length > match.routePrefix.length)
              ? target
              : match,
          undefined,
        );
      },
    }),
    [targets],
  );

  return (
    <RouteScrambleContext.Provider value={contextValue}>
      {children}
    </RouteScrambleContext.Provider>
  );
}

function useRouteScramble() {
  const context = useContext(RouteScrambleContext);

  if (!context) {
    throw new Error(
      "RouteScrambleText must be rendered inside RouteScrambleProvider.",
    );
  }

  return context;
}

function useScrambleText({
  animateOnMount,
  duration,
  from,
  to,
}: {
  animateOnMount: boolean;
  duration: number;
  from: string;
  to: string;
}) {
  const transitionKey = useMemo(
    () => `${from}\u0000${to}\u0000${duration}`,
    [duration, from, to],
  );
  const animationFrame = useRef<number | null>(null);
  const isInitialEffect = useRef(true);
  const [state, setState] = useState<ScrambleState>(() => ({
    key: transitionKey,
    progress: animateOnMount ? 0 : 1,
    text: animateOnMount ? from : to,
  }));

  useEffect(() => {
    const isInitial = isInitialEffect.current;
    isInitialEffect.current = false;

    if (animationFrame.current !== null) {
      window.cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    if (isInitial && !animateOnMount) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      animationFrame.current = window.requestAnimationFrame(() => {
        setState({ key: transitionKey, progress: 1, text: to });
        animationFrame.current = null;
      });

      return () => {
        if (animationFrame.current !== null) {
          window.cancelAnimationFrame(animationFrame.current);
          animationFrame.current = null;
        }
      };
    }

    const startedAt = performance.now();
    let lastScrambleUpdate = startedAt;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startedAt) / duration, 1);
      const settleProgress = Math.max(0, (progress - 0.35) / 0.65);
      let nextText: string | undefined;

      if (progress >= 1) {
        nextText = to;
      } else if (
        progress >= 0.1 &&
        currentTime - lastScrambleUpdate >= scrambleInterval
      ) {
        nextText = getScrambledText(from, to, settleProgress);
        lastScrambleUpdate = currentTime;
      }

      setState((current) => ({
        key: transitionKey,
        progress,
        text:
          nextText ?? (current.key === transitionKey ? current.text : from),
      }));

      if (progress < 1) {
        animationFrame.current = window.requestAnimationFrame(animate);
      } else {
        animationFrame.current = null;
      }
    };

    animationFrame.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [animateOnMount, duration, from, to, transitionKey]);

  if (state.key !== transitionKey) {
    return { progress: 0, text: from };
  }

  return state;
}

export function ScrambleText({
  animateOnMount = true,
  as = "span",
  className,
  duration = scrambleDuration,
  from,
  fromLetterSpacingEm,
  showCursor = false,
  style,
  to,
  toLetterSpacingEm,
}: ScrambleTextProps) {
  const { progress, text } = useScrambleText({
    animateOnMount,
    duration,
    from,
    to,
  });
  const Element = as;
  const hasLetterSpacingAnimation =
    fromLetterSpacingEm !== undefined || toLetterSpacingEm !== undefined;
  const spacingProgress = progress * progress * (3 - 2 * progress);
  const initialSpacing = fromLetterSpacingEm ?? 0;
  const finalSpacing = toLetterSpacingEm ?? initialSpacing;
  const letterSpacing =
    initialSpacing + (finalSpacing - initialSpacing) * spacingProgress;

  return (
    <Element
      className={className}
      style={
        hasLetterSpacingAnimation
          ? { ...style, letterSpacing: `${letterSpacing}em` }
          : style
      }
    >
      {text}
      {showCursor ? (
        <span aria-hidden="true" className="terminalCursor">
          _
        </span>
      ) : null}
    </Element>
  );
}

export function RouteScrambleText({
  className,
  duration = scrambleDuration,
  routePrefix,
  showCursor = false,
  sourceText,
  text,
}: RouteScrambleTextProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    completeTransition,
    isTransitionDestination,
    prepareTransition,
    resolveTarget,
  } = useRouteScramble();
  const isNavigating = useRef(false);
  const navigationTimer = useRef<number | null>(null);
  const [enteredFromSharedTransition] = useState(() =>
    isTransitionDestination(routePrefix),
  );
  const [exitText, setExitText] = useState<string | null>(null);

  useEffect(() => {
    if (enteredFromSharedTransition) {
      completeTransition(routePrefix);
    }
  }, [completeTransition, enteredFromSharedTransition, routePrefix]);

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
        isWithinRoute(destination.pathname, routePrefix) ||
        destination.pathname === pathname
      ) {
        return;
      }

      event.preventDefault();

      if (isNavigating.current) return;

      const nextRoute = `${destination.pathname}${destination.search}${destination.hash}`;
      const destinationTarget = resolveTarget(destination.pathname);
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      prepareTransition(destinationTarget);

      if (reduceMotion) {
        router.push(nextRoute);
        return;
      }

      isNavigating.current = true;
      setExitText(destinationTarget?.text ?? sourceText);

      navigationTimer.current = window.setTimeout(() => {
        navigationTimer.current = null;
        router.push(nextRoute);
      }, duration);
    };

    document.addEventListener("click", handleNavigation, true);

    return () => {
      document.removeEventListener("click", handleNavigation, true);

      if (navigationTimer.current !== null) {
        window.clearTimeout(navigationTimer.current);
      }
    };
  }, [
    duration,
    pathname,
    prepareTransition,
    resolveTarget,
    routePrefix,
    router,
    sourceText,
  ]);

  const isClosing = exitText !== null;
  const initialText = enteredFromSharedTransition ? text : sourceText;

  return (
    <ScrambleText
      animateOnMount={!enteredFromSharedTransition}
      as="p"
      className={className}
      duration={duration}
      from={isClosing ? text : initialText}
      showCursor={showCursor}
      to={exitText ?? text}
    />
  );
}
