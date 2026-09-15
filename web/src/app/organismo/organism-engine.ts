import { createOrganismRenderer, type OrganismLayer } from "./organism-shader";

export type OrganismSettings = {
  enabled: boolean;
  quantity: number;
  size: number;
  spacing: number;
  speed: number;
  influence: number;
  squaresEnabled: boolean;
  squareProbability: number;
  squareSize: number;
  squareBlur: number;
  squareSpacing: number;
  squareOffsetX: number;
  squareOffsetY: number;
  primaryEnabled: boolean;
  primaryQuantity: number;
  primarySize: number;
  primarySpacing: number;
  primaryOffsetX: number;
  primaryOffsetY: number;
  prismWidth: number;
  prismHeight: number;
  rotationSpeed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  prismTraceAmount: number;
  prismTraceDuration: number;
  pointerTraceAmount: number;
  pointerTraceDuration: number;
  grid: boolean;
  paused: boolean;
};

export const DEFAULT_SETTINGS: OrganismSettings = {
  enabled: true,
  quantity: 70,
  size: 32,
  spacing: 32,
  speed: 100,
  influence: 100,
  squaresEnabled: true,
  squareProbability: 25,
  squareSize: 32,
  squareBlur: 3,
  squareSpacing: 32,
  squareOffsetX: 0,
  squareOffsetY: 0,
  primaryEnabled: true,
  primaryQuantity: 70,
  primarySize: 32,
  primarySpacing: 32,
  primaryOffsetX: 0,
  primaryOffsetY: 0,
  prismWidth: 100,
  prismHeight: 100,
  rotationSpeed: 30,
  rotationX: 36,
  rotationY: 45,
  rotationZ: 7,
  prismTraceAmount: 50,
  prismTraceDuration: 3,
  pointerTraceAmount: 50,
  pointerTraceDuration: 3,
  grid: false,
  paused: false,
};

const MAX_PRISM_TRAIL_SAMPLES = 48;
const MAX_POINTER_TRAIL_POINTS = 512;

type Point = { x: number; y: number };
type Cell = Point & { index: number; population: number };
type Matrix = OrganismLayer & { cells: Cell[] };
type PointerTrailPoint = Point & { age: number; strength: number };
type Source = Point & { radius: number; strength: number };
type PrismProjection = {
  points: Point[];
  parts: Point[][];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  age: number;
};

// Alternating unequal tips and deep notches form a jagged twelve-vertex base.
export const PRISM_BASE = [
  [-1.48, -0.12], [-0.42, -0.30], [-0.82, -1.30], [-0.03, -0.40],
  [0.65, -1.44], [0.40, -0.20], [1.50, 0.18], [0.38, 0.36],
  [0.55, 1.25], [-0.13, 0.43], [-1.20, 0.95], [-0.47, 0.16],
] as const;

// Stable populations avoid random flickering when the quantity changes.
function hash(x: number, y: number, seed: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function cross(origin: Point, a: Point, b: Point) {
  return (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x);
}

function convexHull(points: Point[]) {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const lower: Point[] = [];
  const upper: Point[] = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower.at(-2)!, lower.at(-1)!, point) <= 0) lower.pop();
    lower.push(point);
  }
  for (let index = sorted.length - 1; index >= 0; index--) {
    const point = sorted[index];
    while (upper.length >= 2 && cross(upper.at(-2)!, upper.at(-1)!, point) <= 0) upper.pop();
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function contains(projection: PrismProjection, point: Point) {
  if (point.x < projection.minX || point.x > projection.maxX
    || point.y < projection.minY || point.y > projection.maxY) return false;
  return projection.parts.some((part) => {
    for (let index = 0; index < part.length; index++) {
      if (cross(part[index], part[(index + 1) % part.length], point) < -0.00001) return false;
    }
    return true;
  });
}

export function createOrganism(
  canvas: HTMLCanvasElement,
  initialSettings: OrganismSettings,
  onUnavailable: (unavailable: boolean) => void = () => {},
  interactionTarget: HTMLElement = canvas,
) {
  let renderer: ReturnType<typeof createOrganismRenderer>;
  try {
    renderer = createOrganismRenderer(canvas);
  } catch (error) {
    console.error("Organismo:", error);
    return null;
  }

  let settings = initialSettings;
  let width = 0;
  let height = 0;
  let spacingScale = 1;
  let centerX = 0;
  let centerY = 0;
  let circleMatrix: Matrix;
  let glassMatrix: Matrix;
  let primaryMatrix: Matrix;
  let contextLost = false;
  let time = 0;
  let frame = 0;
  let lastTime = 0;
  let disposed = false;
  let dirty = true;
  let prismSampleElapsed = 0;
  let prismTrail: PrismProjection[] = [];
  let pointerTrail: PointerTrailPoint[] = [];
  const pointer = { x: -1000, y: -1000, active: false, down: false };

  function prismTrailLimit() {
    return settings.prismTraceAmount <= 0
      ? 0
      : Math.max(1, Math.round(MAX_PRISM_TRAIL_SAMPLES * settings.prismTraceAmount / 100));
  }

  function pointerTrailLimit() {
    return settings.pointerTraceAmount <= 0
      ? 0
      : Math.max(1, Math.round(MAX_POINTER_TRAIL_POINTS * settings.pointerTraceAmount / 100));
  }

  // The lattice spans the viewport so the cursor can draw beyond the prism.
  function buildLayer(spacing: number, size: number, seed: number, offsetX = 0, offsetY = 0): Matrix {
    spacing = Math.max(10, spacing) * spacingScale;
    size *= width <= 768 ? 0.75 : 1;
    const radius = size * 0.8 + 6;
    const firstColumn = -Math.ceil((centerX + radius + Math.max(0, offsetX)) / spacing);
    const firstRow = -Math.ceil((centerY + radius + Math.max(0, offsetY)) / spacing);
    const lastColumn = Math.ceil(((width - centerX) + radius + Math.max(0, -offsetX)) / spacing);
    const lastRow = Math.ceil(((height - centerY) + radius + Math.max(0, -offsetY)) / spacing);
    const columns = lastColumn - firstColumn + 1;
    const rows = lastRow - firstRow + 1;
    const cells: Cell[] = [];
    for (let row = firstRow; row <= lastRow; row++) {
      for (let column = firstColumn; column <= lastColumn; column++) {
        cells.push({
          index: (row - firstRow) * columns + column - firstColumn,
          x: centerX + column * spacing,
          y: centerY + row * spacing,
          population: hash(column, row, seed),
        });
      }
    }
    return { cells, data: new Uint8Array(columns * rows), columns, rows,
      // Sample the original sources, then translate the rendered layer.
      originX: centerX + firstColumn * spacing + offsetX,
      originY: centerY + firstRow * spacing + offsetY, spacing, size };
  }

  function buildMatrix() {

    circleMatrix = buildLayer(settings.spacing, settings.size, 4);
    glassMatrix = buildLayer(settings.squareSpacing, settings.squareSize, 19, settings.squareOffsetX, settings.squareOffsetY);
    primaryMatrix = buildLayer(settings.primarySpacing, settings.primarySize, 31, settings.primaryOffsetX, settings.primaryOffsetY);
    dirty = true;
  }

  function projectPrism(atTime: number): PrismProjection {
    const radians = Math.PI / 180;
    const angleX = (settings.rotationX + atTime * 0.72) * radians;
    const angleY = (settings.rotationY + atTime) * radians;
    const angleZ = (settings.rotationZ + atTime * 0.4) * radians;
    const sinX = Math.sin(angleX);
    const cosX = Math.cos(angleX);
    const sinY = Math.sin(angleY);
    const cosY = Math.cos(angleY);
    const sinZ = Math.sin(angleZ);
    const cosZ = Math.cos(angleZ);
    // Give the smaller mobile shapes a broader source region to populate.
    const prismWidthRatio = width <= 768 ? 0.6 : 0.3;
    const scale = Math.min(width * prismWidthRatio, height * 0.6) * 0.28 * (width <= 768 ? 1.25 : 1);
    function project(baseX: number, baseZ: number, end: number): Point {
      const x = baseX * settings.prismWidth / 100;
      const y = end * 0.58 * settings.prismHeight / 100;
      const z = baseZ * 0.8;
      const yX = y * cosX - z * sinX;
      const zX = y * sinX + z * cosX;
      const xY = x * cosY + zX * sinY;
      const yZ = xY * sinZ + yX * cosZ;
      return {
        x: centerX + (xY * cosZ - yX * sinZ) * scale,
        y: centerY + yZ * scale,
      };
    }

    const caps = PRISM_BASE.map(([x, z]) => [project(x, z, -1), project(x, z, 1)]);
    const centers = [project(0, 0, -1), project(0, 0, 1)];
    // Project each triangular slice of the solid separately. A single hull
    // around the whole prism would fill the notches and erase the spikes.
    const parts = caps.map((cap, index) => convexHull([
      ...centers, ...cap, ...caps[(index + 1) % caps.length],
    ])).filter((part) => part.length >= 3);
    const points = caps.flat();
    return {
      points,
      parts,
      minX: Math.min(...points.map((point) => point.x)),
      minY: Math.min(...points.map((point) => point.y)),
      maxX: Math.max(...points.map((point) => point.x)),
      maxY: Math.max(...points.map((point) => point.y)),
      age: 0,
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    // Match the portfolio mobile breakpoint without changing saved settings.
    spacingScale = width <= 768 ? 0.75 : 1;
    centerX = width * (width <= 768 ? 0.5 : 0.65);
    centerY = height * 0.5;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!contextLost) renderer.resize(width, height, dpr);
    buildMatrix();
    prismTrail = [];
    pointerTrail = [];
    prismSampleElapsed = 0;
    pointer.active = false;
    pointer.down = false;
    wake();
  }

  function cursorSources(spacing: number): Source[] {
    const influence = settings.influence / 100;
    if (influence <= 0) return [];
    const result: Source[] = [];
    const brushRadius = spacing * (0.8 + influence * 0.7);
    for (const point of pointerTrail) {
      result.push({
        x: point.x,
        y: point.y,
        radius: brushRadius,
        strength: point.strength * influence,
      });
    }
    if (pointer.active) {
      result.push({
        x: pointer.x,
        y: pointer.y,
        radius: brushRadius,
        strength: (pointer.down ? 2.5 : 1.4) * influence,
      });
    }
    return result;
  }

  function draw() {
    const currentPrism = projectPrism(time);
    function paint(matrix: Matrix, enabled: boolean, probability: number) {
      const cursorField = cursorSources(matrix.spacing);
      for (const cell of matrix.cells) {
        if (!enabled || cell.population >= probability / 100) {
          matrix.data[cell.index] = 0;
          continue;
        }
        let visible = contains(currentPrism, cell);
        if (!visible) {
          for (const projection of prismTrail) {
            if (!contains(projection, cell)) continue;
            visible = true;
            break;
          }
        }
        if (!visible) {
          for (const source of cursorField) {
            const dx = cell.x - source.x;
            const dy = cell.y - source.y;
            const distance = (dx * dx + dy * dy) / (source.radius * source.radius);
            if (distance < 1 && (1 - distance) ** 2 * source.strength > 0.14) {
              visible = true;
              break;
            }
          }
        }
        matrix.data[cell.index] = visible ? 255 : 0;
      }
    }
    paint(circleMatrix, settings.enabled, settings.quantity);
    paint(glassMatrix, settings.squaresEnabled, settings.squareProbability);
    paint(primaryMatrix, settings.primaryEnabled, settings.primaryQuantity);
    renderer.draw(circleMatrix, glassMatrix, primaryMatrix, settings.grid, settings.squareBlur);
  }

  function ageTraces(dt: number) {
    for (const point of pointerTrail) point.age += dt;
    pointerTrail = pointerTrail.filter((point) => point.age < settings.pointerTraceDuration);
    for (const projection of prismTrail) projection.age += dt;
    prismTrail = prismTrail.filter((projection) => projection.age < settings.prismTraceDuration);

    const limit = prismTrailLimit();
    if (!limit) {
      prismTrail = [];
      prismSampleElapsed = 0;
      return;
    }
    prismSampleElapsed += dt;
    const interval = Math.max(0.05, settings.prismTraceDuration / limit);
    if (prismSampleElapsed >= interval) {
      prismSampleElapsed %= interval;
      prismTrail.push(projectPrism(time));
      prismTrail = prismTrail.slice(-limit);
    }
  }

  function tick(timestamp: number) {
    frame = 0;
    if (disposed || contextLost || document.hidden) return;
    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = timestamp;
    const moving = !settings.paused && settings.speed > 0;
    if (moving) {
      ageTraces(dt);
      time += dt * (settings.speed / 100) * settings.rotationSpeed;
    }
    if (moving || dirty) {
      draw();
      dirty = false;
    }
    if (moving) frame = requestAnimationFrame(tick);
  }

  function wake() {
    if (!frame && !disposed && !contextLost && !document.hidden) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }

  function move(event: PointerEvent) {
    if (!event.isPrimary) return;
    if (overControls(event)) {
      leave();
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const previous = pointer.active ? { x: pointer.x, y: pointer.y } : undefined;
    const distance = previous ? Math.hypot(x - previous.x, y - previous.y) : 0;
    const limit = pointerTrailLimit();
    const acceptsPointerInput = !settings.paused || event.pointerType !== "mouse";
    if (acceptsPointerInput && (settings.enabled || settings.squaresEnabled || settings.primaryEnabled) && settings.influence > 0 && limit > 0) {
      const sampleStep = Math.min(circleMatrix.spacing, glassMatrix.spacing, primaryMatrix.spacing) * 0.25;
      const segments = previous ? Math.min(limit, Math.ceil(distance / sampleStep)) : 1;
      for (let index = 1; index <= segments; index++) {
        pointerTrail.push({
          x: previous ? previous.x + (x - previous.x) * index / segments : x,
          y: previous ? previous.y + (y - previous.y) * index / segments : y,
          age: 0,
          strength: pointer.down ? 1.7 : 0.9,
        });
      }
      pointerTrail = pointerTrail.slice(-limit);
    }
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
    dirty = true;
    wake();
  }

  function down(event: PointerEvent) {
    if (!event.isPrimary || overControls(event)) return;
    pointer.down = true;
    // The background observes page input without taking capture from links,
    // scrolling panels, form fields, or the settings controls.
    if (interactionTarget === canvas) canvas.setPointerCapture(event.pointerId);
    move(event);
  }

  function overControls(event: PointerEvent) {
    return interactionTarget !== canvas && event.target instanceof Element
      && Boolean(event.target.closest("[data-organism-controls]"));
  }

  function leave() {
    pointer.active = false;
    pointer.down = false;
    dirty = true;
    wake();
  }

  function up(event: PointerEvent) {
    pointer.down = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (event.pointerType !== "mouse") leave();
  }

  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      dirty = true;
      wake();
    }
  }

  function loseContext(event: Event) {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    onUnavailable(true);
  }

  function restoreContext() {
    try {
      renderer.destroy();
      renderer = createOrganismRenderer(canvas);
      contextLost = false;
      resize();
      onUnavailable(false);
    } catch (error) {
      console.error("Organismo:", error);
      onUnavailable(true);
    }
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  interactionTarget.addEventListener("pointermove", move, { passive: true });
  interactionTarget.addEventListener("pointerdown", down, { passive: true });
  interactionTarget.addEventListener("pointerup", up, { passive: true });
  interactionTarget.addEventListener("pointercancel", leave, { passive: true });
  interactionTarget.addEventListener("pointerleave", leave, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", loseContext);
  canvas.addEventListener("webglcontextrestored", restoreContext);
  resize();

  return {
    update(next: OrganismSettings) {
      const rebuild = next.spacing !== settings.spacing || next.size !== settings.size
        || next.squareSpacing !== settings.squareSpacing || next.squareSize !== settings.squareSize
        || next.squareOffsetX !== settings.squareOffsetX || next.squareOffsetY !== settings.squareOffsetY
        || next.primarySize !== settings.primarySize || next.primarySpacing !== settings.primarySpacing
        || next.primaryOffsetX !== settings.primaryOffsetX || next.primaryOffsetY !== settings.primaryOffsetY;
      const reshape = next.prismWidth !== settings.prismWidth || next.prismHeight !== settings.prismHeight
        || next.rotationX !== settings.rotationX || next.rotationY !== settings.rotationY || next.rotationZ !== settings.rotationZ;
      settings = next;
      if (reshape) prismTrail = [];
      const pointerLimit = pointerTrailLimit();
      const prismLimit = prismTrailLimit();
      pointerTrail = pointerLimit ? pointerTrail.slice(-pointerLimit) : [];
      prismTrail = prismLimit ? prismTrail.slice(-prismLimit) : [];
      if (rebuild) buildMatrix();
      dirty = true;
      wake();
    },
    reset() {
      time = 0;
      prismTrail = [];
      pointerTrail = [];
      prismSampleElapsed = 0;
      pointer.active = false;
      pointer.down = false;
      buildMatrix();
      wake();
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      interactionTarget.removeEventListener("pointermove", move);
      interactionTarget.removeEventListener("pointerdown", down);
      interactionTarget.removeEventListener("pointerup", up);
      interactionTarget.removeEventListener("pointercancel", leave);
      interactionTarget.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", loseContext);
      canvas.removeEventListener("webglcontextrestored", restoreContext);
      renderer.destroy();
      circleMatrix.cells = [];
      glassMatrix.cells = [];
      primaryMatrix.cells = [];
      prismTrail = [];
      pointerTrail = [];
    },
  };
}
