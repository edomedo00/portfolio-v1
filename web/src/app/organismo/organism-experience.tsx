"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import type { Locale } from "@/content/types";
import { reducedMotionQuery } from "@/motion-preference";
import {
  createOrganism,
  DEFAULT_SETTINGS,
  type OrganismSettings,
} from "./organism-engine";
import styles from "./page.module.css";

const mediaQueries = [reducedMotionQuery, "(max-width: 44rem)"];

const interfaceCopy = {
  es: {
    settings: "AJUSTES",
    settingsLabel: "Ajustes de Cells",
    circles: "Círculos",
    enableCircles: "Activar círculos",
    quantity: "Cantidad",
    diameter: "Diámetro",
    glass: "Cristal",
    glassSquares: "Cuadrados de cristal",
    enableSquares: "Activar cuadrados",
    probability: "Probabilidad",
    glassSize: "Tamaño del cristal",
    glassBlur: "Desenfoque del cristal",
    glassSpacing: "Espaciado del cristal",
    glassOffsetX: "Offset X del cristal",
    glassOffsetY: "Offset Y del cristal",
    primaryCircles: "Círculos primarios",
    enablePrimary: "Activar círculos primarios",
    primaryQuantity: "Cantidad primaria",
    primaryDiameter: "Diámetro primario",
    primarySpacing: "Espaciado primario",
    primaryOffsetX: "Offset X primario",
    primaryOffsetY: "Offset Y primario",
    movement: "MOVIMIENTO",
    speed: "Velocidad",
    cursorInfluence: "Influencia del cursor",
    prism: "PRISMA IRREGULAR",
    width: "Ancho",
    height: "Altura",
    rotationSpeed: "Velocidad de rotación",
    rotationX: "Rotación X",
    rotationY: "Rotación Y",
    rotationZ: "Rotación Z",
    prismTrail: "RASTRO DEL PRISMA",
    prismAmount: "Cantidad del prisma",
    prismFade: "Desaparición del prisma",
    cursorTrail: "RASTRO DEL CURSOR",
    cursorAmount: "Cantidad del cursor",
    cursorFade: "Desaparición del cursor",
    spacing: "Espaciado",
    showGrid: "Mostrar matriz",
    copySettings: "Copiar ajustes",
    copied: "Copiado",
    copyFailed: "No se pudo copiar",
    resume: "Reanudar",
    pause: "Pausar",
    reset: "Restablecer",
    unavailable: "No se pudo iniciar el efecto. Activa la aceleración gráfica o utiliza un navegador compatible con WebGL 2.",
    noscript: "Activa JavaScript para explorar Cells.",
  },
  en: {
    settings: "SETTINGS",
    settingsLabel: "Cells settings",
    circles: "Circles",
    enableCircles: "Enable circles",
    quantity: "Quantity",
    diameter: "Diameter",
    glass: "Glass",
    glassSquares: "Glass squares",
    enableSquares: "Enable squares",
    probability: "Probability",
    glassSize: "Glass size",
    glassBlur: "Glass blur",
    glassSpacing: "Glass spacing",
    glassOffsetX: "Glass offset X",
    glassOffsetY: "Glass offset Y",
    primaryCircles: "Primary circles",
    enablePrimary: "Enable primary circles",
    primaryQuantity: "Primary quantity",
    primaryDiameter: "Primary diameter",
    primarySpacing: "Primary spacing",
    primaryOffsetX: "Primary offset X",
    primaryOffsetY: "Primary offset Y",
    movement: "MOVEMENT",
    speed: "Speed",
    cursorInfluence: "Cursor influence",
    prism: "IRREGULAR PRISM",
    width: "Width",
    height: "Height",
    rotationSpeed: "Rotation speed",
    rotationX: "Rotation X",
    rotationY: "Rotation Y",
    rotationZ: "Rotation Z",
    prismTrail: "PRISM TRAIL",
    prismAmount: "Prism amount",
    prismFade: "Prism fade",
    cursorTrail: "CURSOR TRAIL",
    cursorAmount: "Cursor amount",
    cursorFade: "Cursor fade",
    spacing: "Spacing",
    showGrid: "Show grid",
    copySettings: "Copy settings",
    copied: "Copied",
    copyFailed: "Copy failed",
    resume: "Resume",
    pause: "Pause",
    reset: "Reset",
    unavailable: "The effect could not start. Enable graphics acceleration or use a browser with WebGL 2 support.",
    noscript: "Enable JavaScript to explore Cells.",
  },
} as const;

type OrganismExperienceProps = {
  background?: boolean;
  description?: string;
  displayName?: string;
  language?: Locale;
  navigation?: ReactNode;
  settingsJson?: string | null;
  title?: string;
};

function getConfiguredSettings(settingsJson?: string | null): OrganismSettings {
  if (!settingsJson?.trim()) return DEFAULT_SETTINGS;

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) } as OrganismSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function subscribePreferences(onChange: () => void) {
  const queries = mediaQueries.map((query) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
}

function getPreferences() {
  return mediaQueries.reduce((value, query, index) => value | (window.matchMedia(query).matches ? 1 << index : 0), 0);
}

function getServerPreferences() { return 0; }

type SliderProps = {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

function Slider({ id, label, value, min = 0, max = 100, step = 1, unit = "%", disabled, onChange }: SliderProps) {
  return (
    <label className={styles.slider} htmlFor={id}>
      <span>{label}</span>
      <output htmlFor={id}>{value}{unit}</output>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={`${value}${unit}`}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--range-progress": `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
      />
    </label>
  );
}

function Switch({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button
      className={styles.switch}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span />
    </button>
  );
}

export function OrganismExperience({
  navigation,
  background = false,
  description = "Interactive Cells visualization",
  displayName = "EDMUNDO MEDEL",
  language = "es",
  settingsJson,
  title = "CELLS",
}: OrganismExperienceProps) {
  const configuredSettings = useMemo(
    () => getConfiguredSettings(settingsJson),
    [settingsJson],
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof createOrganism>>(null);
  const copyStatusTimer = useRef<number | null>(null);
  const [settings, setSettings] = useState<OrganismSettings>(() => configuredSettings);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [unavailable, setUnavailable] = useState(false);
  const preferences = useSyncExternalStore(subscribePreferences, getPreferences, getServerPreferences);
  const reducedMotion = Boolean(preferences & 1);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const [panelOverride, setPanelOverride] = useState<boolean | null>(null);
  const panelOpen = panelOverride ?? !(preferences & 2);
  const paused = motionOverride ?? (settings.paused || reducedMotion);
  const isStill = paused || settings.speed === 0;
  const copy = interfaceCopy[language];

  useEffect(() => {
    const media = window.matchMedia(reducedMotionQuery);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createOrganism(
      canvas,
      { ...configuredSettings, paused: configuredSettings.paused || media.matches },
      setUnavailable,
      background ? document.documentElement : canvas,
    );
    engineRef.current = engine;
    if (!engine) setUnavailable(true);
    return () => {
      engine?.destroy();
      engineRef.current = null;
    };
  }, [background, configuredSettings]);

  useEffect(() => {
    return () => {
      if (copyStatusTimer.current !== null) window.clearTimeout(copyStatusTimer.current);
    };
  }, []);

  useEffect(() => {
    engineRef.current?.update({ ...settings, paused });
  }, [settings, paused]);

  function reset() {
    setSettings(configuredSettings);
    setMotionOverride(null);
    engineRef.current?.reset();
  }

  async function copySettings() {
    const serializedSettings = JSON.stringify(settings, null, 2);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(serializedSettings);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = serializedSettings;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand("copy");
        textArea.remove();
        if (!copied) throw new Error("Clipboard copy failed");
      }
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    if (copyStatusTimer.current !== null) window.clearTimeout(copyStatusTimer.current);
    copyStatusTimer.current = window.setTimeout(() => setCopyStatus("idle"), 2200);
  }

  function toggleMotion() {
    if (isStill) {
      if (settings.speed === 0) setSettings((current) => ({ ...current, speed: DEFAULT_SETTINGS.speed }));
      setMotionOverride(false);
    } else {
      setMotionOverride(true);
    }
  }

  const Container = background ? "div" : "main";

  return (
    <Container className={`${styles.experience}${background ? ` ${styles.background}` : ""}`}>
      {!background && <h1 className={styles.srOnly}>{title}</h1>}
      <canvas
        aria-hidden={background || undefined}
        aria-label={description}
        className={styles.canvas}
        ref={canvasRef}
      />

      {!background && <header className={styles.header}>
        <Link className={styles.name} href="/">{displayName}</Link>
        <div className={styles.navigation}>{navigation}</div>
      </header>}

      {!background ? (
      <aside className={styles.panel} aria-label={copy.settingsLabel} data-organism-controls>
        <button
          type="button"
          className={styles.panelHeading}
          aria-expanded={panelOpen}
          aria-controls="organism-controls"
          onClick={() => setPanelOverride(!panelOpen)}
        >
          <span className={styles.headingLabel}>
            <span className={styles.settingsIcon} aria-hidden="true"><i /><i /><i /></span>
            {copy.settings}
          </span>
          <span aria-hidden="true">{panelOpen ? "−" : "+"}</span>
        </button>

        <div id="organism-controls" className={styles.panelBody} hidden={!panelOpen}>
          <fieldset className={styles.layer} data-disabled={!settings.enabled}>
            <legend className={styles.srOnly}>{copy.circles}</legend>
            <div className={styles.layerHeading}>
              <span className={styles.shapeIcon} aria-hidden="true" />
              <span>{copy.circles}</span>
              <Switch checked={settings.enabled} label={copy.enableCircles} onChange={() => setSettings((current) => ({ ...current, enabled: !current.enabled }))} />
            </div>
            <div className={styles.layerControls}>
              <Slider id="circles-quantity" label={copy.quantity} value={settings.quantity} disabled={!settings.enabled} onChange={(quantity) => setSettings((current) => ({ ...current, quantity }))} />
              <Slider id="circles-size" label={copy.diameter} min={12} max={96} unit=" px" value={settings.size} disabled={!settings.enabled} onChange={(size) => setSettings((current) => ({ ...current, size }))} />
            </div>
          </fieldset>

          <fieldset className={styles.layer} data-disabled={!settings.squaresEnabled}>
            <legend className={styles.srOnly}>{copy.glassSquares}</legend>
            <div className={styles.layerHeading}>
              <span className={`${styles.shapeIcon} ${styles.squareIcon}`} aria-hidden="true" />
              <span>{copy.glass}</span>
              <Switch checked={settings.squaresEnabled} label={copy.enableSquares} onChange={() => setSettings((current) => ({ ...current, squaresEnabled: !current.squaresEnabled }))} />
            </div>
            <div className={styles.squareControls}>
              <Slider id="square-probability" label={copy.probability} value={settings.squareProbability} disabled={!settings.squaresEnabled} onChange={(squareProbability) => setSettings((current) => ({ ...current, squareProbability }))} />
              <Slider id="square-size" label={copy.glassSize} min={12} max={160} unit=" px" value={settings.squareSize} disabled={!settings.squaresEnabled} onChange={(squareSize) => setSettings((current) => ({ ...current, squareSize }))} />
              <Slider id="square-blur" label={copy.glassBlur} min={0} max={16} step={0.5} unit=" px" value={settings.squareBlur} disabled={!settings.squaresEnabled} onChange={(squareBlur) => setSettings((current) => ({ ...current, squareBlur }))} />
              <Slider id="square-spacing" label={copy.glassSpacing} min={10} max={160} unit=" px" value={settings.squareSpacing} disabled={!settings.squaresEnabled} onChange={(squareSpacing) => setSettings((current) => ({ ...current, squareSpacing }))} />
              <Slider id="square-offset-x" label={copy.glassOffsetX} min={-400} max={400} unit=" px" value={settings.squareOffsetX} disabled={!settings.squaresEnabled} onChange={(squareOffsetX) => setSettings((current) => ({ ...current, squareOffsetX }))} />
              <Slider id="square-offset-y" label={copy.glassOffsetY} min={-400} max={400} unit=" px" value={settings.squareOffsetY} disabled={!settings.squaresEnabled} onChange={(squareOffsetY) => setSettings((current) => ({ ...current, squareOffsetY }))} />
            </div>
          </fieldset>

          <fieldset className={styles.layer} data-disabled={!settings.primaryEnabled}>
            <legend className={styles.srOnly}>{copy.primaryCircles}</legend>
            <div className={styles.layerHeading}>
              <span className={`${styles.shapeIcon} ${styles.primaryIcon}`} aria-hidden="true" />
              <span>{copy.primaryCircles}</span>
              <Switch checked={settings.primaryEnabled} label={copy.enablePrimary} onChange={() => setSettings((current) => ({ ...current, primaryEnabled: !current.primaryEnabled }))} />
            </div>
            <div className={styles.squareControls}>
              <Slider id="primary-quantity" label={copy.primaryQuantity} value={settings.primaryQuantity} disabled={!settings.primaryEnabled} onChange={(primaryQuantity) => setSettings((current) => ({ ...current, primaryQuantity }))} />
              <Slider id="primary-size" label={copy.primaryDiameter} min={12} max={96} unit=" px" value={settings.primarySize} disabled={!settings.primaryEnabled} onChange={(primarySize) => setSettings((current) => ({ ...current, primarySize }))} />
              <Slider id="primary-spacing" label={copy.primarySpacing} min={10} max={90} unit=" px" value={settings.primarySpacing} disabled={!settings.primaryEnabled} onChange={(primarySpacing) => setSettings((current) => ({ ...current, primarySpacing }))} />
              <Slider id="primary-offset-x" label={copy.primaryOffsetX} min={-400} max={400} unit=" px" value={settings.primaryOffsetX} disabled={!settings.primaryEnabled} onChange={(primaryOffsetX) => setSettings((current) => ({ ...current, primaryOffsetX }))} />
              <Slider id="primary-offset-y" label={copy.primaryOffsetY} min={-400} max={400} unit=" px" value={settings.primaryOffsetY} disabled={!settings.primaryEnabled} onChange={(primaryOffsetY) => setSettings((current) => ({ ...current, primaryOffsetY }))} />
            </div>
          </fieldset>

          <div className={styles.behavior}>
            <div className={styles.sectionLabel}><span>{copy.movement}</span><span>↗</span></div>
            <Slider id="organism-speed" label={copy.speed} value={settings.speed} onChange={(speed) => setSettings((current) => ({ ...current, speed }))} />
            <Slider id="organism-influence" label={copy.cursorInfluence} value={settings.influence} onChange={(influence) => setSettings((current) => ({ ...current, influence }))} />
            <div className={styles.sectionLabel}><span>{copy.prism}</span><span>↗</span></div>
            <Slider id="prism-width" label={copy.width} min={40} max={180} value={settings.prismWidth} onChange={(prismWidth) => setSettings((current) => ({ ...current, prismWidth }))} />
            <Slider id="prism-height" label={copy.height} min={40} max={180} value={settings.prismHeight} onChange={(prismHeight) => setSettings((current) => ({ ...current, prismHeight }))} />
            <Slider id="rotation-speed" label={copy.rotationSpeed} min={0} max={120} unit=" °/s" value={settings.rotationSpeed} onChange={(rotationSpeed) => setSettings((current) => ({ ...current, rotationSpeed }))} />
            <Slider id="rotation-x" label={copy.rotationX} min={0} max={360} unit="°" value={settings.rotationX} onChange={(rotationX) => setSettings((current) => ({ ...current, rotationX }))} />
            <Slider id="rotation-y" label={copy.rotationY} min={0} max={360} unit="°" value={settings.rotationY} onChange={(rotationY) => setSettings((current) => ({ ...current, rotationY }))} />
            <Slider id="rotation-z" label={copy.rotationZ} min={0} max={360} unit="°" value={settings.rotationZ} onChange={(rotationZ) => setSettings((current) => ({ ...current, rotationZ }))} />
            <div className={styles.sectionLabel}><span>{copy.prismTrail}</span><span>↗</span></div>
            <Slider id="prism-trace-amount" label={copy.prismAmount} value={settings.prismTraceAmount} onChange={(prismTraceAmount) => setSettings((current) => ({ ...current, prismTraceAmount }))} />
            <Slider id="prism-trace-duration" label={copy.prismFade} min={0.2} max={8} step={0.1} unit=" s" value={settings.prismTraceDuration} onChange={(prismTraceDuration) => setSettings((current) => ({ ...current, prismTraceDuration }))} />
            <div className={styles.sectionLabel}><span>{copy.cursorTrail}</span><span>↗</span></div>
            <Slider id="pointer-trace-amount" label={copy.cursorAmount} value={settings.pointerTraceAmount} onChange={(pointerTraceAmount) => setSettings((current) => ({ ...current, pointerTraceAmount }))} />
            <Slider id="pointer-trace-duration" label={copy.cursorFade} min={0.2} max={8} step={0.1} unit=" s" value={settings.pointerTraceDuration} onChange={(pointerTraceDuration) => setSettings((current) => ({ ...current, pointerTraceDuration }))} />
            <Slider id="organism-spacing" label={copy.spacing} min={10} max={90} unit=" px" value={settings.spacing} onChange={(spacing) => setSettings((current) => ({ ...current, spacing }))} />
            <div className={styles.gridToggle}>
              <span>{copy.showGrid}</span>
              <Switch checked={settings.grid} label={copy.showGrid} onChange={() => setSettings((current) => ({ ...current, grid: !current.grid }))} />
            </div>
          </div>

          <div className={styles.panelActions}>
            <button type="button" onClick={toggleMotion} aria-label={isStill ? copy.resume : copy.pause}>
              <span aria-hidden="true">{isStill ? "▷" : "Ⅱ"}</span>{isStill ? copy.resume : copy.pause}
            </button>
            <button type="button" onClick={reset}>{copy.reset} <span aria-hidden="true">↺</span></button>
            <button type="button" onClick={copySettings}>
              <span aria-live="polite">
                {copyStatus === "copied"
                  ? copy.copied
                  : copyStatus === "failed"
                    ? copy.copyFailed
                    : copy.copySettings}
              </span>
              <span aria-hidden="true">⧉</span>
            </button>
          </div>
        </div>
      </aside>
      ) : null}

      {!background && unavailable ? <p className={styles.fallback} role="status">{copy.unavailable}</p> : null}
      {!background && <noscript><p className={styles.fallback}>{copy.noscript}</p></noscript>}
    </Container>
  );
}
