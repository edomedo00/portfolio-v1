// Run with: node scripts/check-organism.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/app/organismo/organism-engine.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const api = {};
const pending = new Map();
const listeners = new Map();
let viewport = { width: 1280, height: 720, left: 0, top: 0 };
let drawn = [];
let squares = [];
let primaryCircles = [];
let glassBlur;
let layerGeometry;
let frameId = 0;
let now = 0;
let resize;
let destroyed = 0;
const unavailable = [];
let captures = 0;
class MockElement {
  constructor(isControl = false) { this.isControl = isControl; }
  closest(selector) {
    assert.equal(selector, "[data-organism-controls]");
    return this.isControl ? this : null;
  }
}
function createOrganismRenderer(canvas) {
  return {
    resize(width, height, dpr) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    },
    draw(circles, glass, primary, grid, blurRadius) {
      glassBlur = blurRadius;
      layerGeometry = [circles, glass, primary].map(({ spacing, size, originX, originY }) => ({ spacing, size, originX, originY }));
      function decode({ data, columns, rows, originX, originY, spacing, size }) {
        assert.equal(data.length, columns * rows);
        const shapes = [];
        for (let i = 0; i < data.length; i++) {
          assert([0, 255].includes(data[i]), "Layers must retain discrete visibility");
          if (data[i]) shapes.push({
            x: originX + (i % columns) * spacing,
            y: originY + Math.floor(i / columns) * spacing,
            radius: size / 2,
          });
        }
        return shapes;
      }
      drawn = decode(circles);
      squares = decode(glass).map(shape => ({ ...shape, side: glass.size }));
      primaryCircles = decode(primary);
    },
    destroy() { destroyed++; },
  };
}
const canvas = {
  getBoundingClientRect: () => viewport,
  addEventListener: (name, handler) => listeners.set(name, handler),
  removeEventListener: (name) => listeners.delete(name),
  setPointerCapture() { captures++; },
  hasPointerCapture: () => false,
};
runInNewContext(compiled, {
  exports: api,
  console,
  Element: MockElement,
  require: (name) => {
    assert.equal(name, "./organism-shader");
    return { createOrganismRenderer };
  },
  window: { devicePixelRatio: 1 },
  document: { hidden: false, addEventListener() {}, removeEventListener() {} },
  requestAnimationFrame: (callback) => { pending.set(++frameId, callback); return frameId; },
  cancelAnimationFrame: (id) => pending.delete(id),
  ResizeObserver: class {
    constructor(callback) { resize = callback; }
    observe() {}
    disconnect() {}
  },
});
let settings = { ...api.DEFAULT_SETTINGS };
let expectHomeOnly = true;
const engine = api.createOrganism(canvas, settings, (value) => unavailable.push(value));
assert.deepEqual([settings.quantity, settings.size, settings.spacing, settings.speed, settings.influence,
  settings.prismTraceAmount, settings.pointerTraceAmount, settings.prismTraceDuration, settings.pointerTraceDuration],
  [70, 32, 32, 100, 100, 50, 50, 3, 3], "Defaults must match the approved reference");
assert.equal(api.PRISM_BASE.length, 12, "The spiky prism has twelve vertices per base");
assert(new Set(api.PRISM_BASE.map(([x, z]) => Math.hypot(x, z).toFixed(3))).size > 4, "The prism base must be irregular");
function advance(frames = 1) {
  for (let i = 0; i < frames; i++) {
    const callbacks = [...pending.values()];
    pending.clear();
    now += 1000 / 60;
    callbacks.forEach((callback) => callback(now));
    const scale = viewport.width <= 768 ? 0.75 : 1;
    for (const square of squares) assert.equal(square.side, settings.squareSize * scale, "Glass size must remain fixed at its independent setting");
    for (const circle of primaryCircles) assert.equal(circle.radius, settings.primarySize * scale / 2, "Primary circles must keep their own fixed diameter");
    for (const circle of drawn) {
      assert.equal(circle.radius, settings.size * scale / 2, "Animation must never scale a circle");
      if (expectHomeOnly) {
        assert(circle.x >= viewport.width * 0.45, "The projected prism must stay in the original area");
        assert(circle.x <= viewport.width * 0.85);
        assert(circle.y >= viewport.height * 0.12);
        assert(circle.y <= viewport.height * 0.88);
      }
    }
  }
}
advance();
assert(drawn.length > 0, "The initial organism must be visible");
const initial = JSON.stringify(drawn);
advance(240);
assert.notEqual(JSON.stringify(drawn), initial, "Circles must appear or disappear over time");
// With 100% circles, the eligible region is directly observable. Square
// probability must select a stable independent subset of that same region.
settings = { ...settings, paused: true, quantity: 100, squareProbability: 25 };
engine.update(settings);
advance();
assert(squares.length > 0 && squares.length < drawn.length);
const selectedSquares = JSON.stringify(squares);
engine.update({ ...settings });
advance();
assert.equal(JSON.stringify(squares), selectedSquares, "Probability must not flicker each frame");
const unchangedCircles = JSON.stringify(drawn);
assert.equal(glassBlur, 3, "Glass starts at the existing blur strength");
for (const squareBlur of [0, 9.5, 16, 3]) {
  settings = { ...settings, squareBlur };
  engine.update(settings);
  advance();
  assert.equal(glassBlur, squareBlur, "Blur updates reach the renderer while paused");
  assert.equal(JSON.stringify(drawn), unchangedCircles, "Glass blur must not change circle geometry");
  assert.equal(JSON.stringify(squares), selectedSquares, "Glass blur must not move or resize glass squares");
}
const squarePositions = () => JSON.stringify(squares.map(({x, y}) => [x, y]));
const originalPositions = squarePositions();
settings = { ...settings, squareSize: 96 };
engine.update(settings);
advance();
assert.equal(JSON.stringify(drawn), unchangedCircles, "Glass size must not affect circles");
assert.equal(squarePositions(), originalPositions, "Glass size must not change glass positions");
settings = { ...settings, squareSpacing: 70 };
engine.update(settings);
advance();
assert.equal(JSON.stringify(drawn), unchangedCircles, "Glass spacing must not affect circles");
assert.notEqual(squarePositions(), originalPositions, "Glass spacing must change its own grid");
for (const pane of squares) {
  assert(Math.abs((pane.x - viewport.width * 0.65) / 70 - Math.round((pane.x - viewport.width * 0.65) / 70)) < 1e-6);
}
settings = { ...settings, squareSize: 32, squareSpacing: 32 };
engine.update(settings);
advance();
assert.equal(squarePositions(), originalPositions, "Returning to the same spacing preserves probability selection");
const originalPrimary = JSON.stringify(primaryCircles);
const originalGlass = JSON.stringify(squares);
const primaryPositions = () => JSON.stringify(primaryCircles.map(({x, y}) => [x, y]));
const originalPrimaryPositions = primaryPositions();
assert(primaryCircles.length > 0, "The primary layer must be enabled by default");
settings = { ...settings, squareOffsetX: 55, squareOffsetY: -37 };
engine.update(settings);
advance();
assert.equal(JSON.stringify(squares.map(p => ({ ...p, x: p.x - 55, y: p.y + 37 }))), originalGlass,
  "Glass offsets must translate its existing pattern without resampling");
assert.equal(JSON.stringify(drawn), unchangedCircles);
assert.equal(JSON.stringify(primaryCircles), originalPrimary);
settings = { ...settings, squareOffsetX: 0, squareOffsetY: 0, primaryOffsetX: -68, primaryOffsetY: 49 };
engine.update(settings);
advance();
assert.equal(JSON.stringify(primaryCircles.map(p => ({ ...p, x: p.x + 68, y: p.y - 49 }))), originalPrimary,
  "Primary offsets must translate the complete layer");
assert.equal(JSON.stringify(drawn), unchangedCircles);
assert.equal(JSON.stringify(squares), originalGlass);
settings = { ...settings, primaryOffsetX: 0, primaryOffsetY: 0, primarySize: 60 };
engine.update(settings);
advance();
assert.equal(primaryPositions(), originalPrimaryPositions, "Primary size must preserve positions");
settings = { ...settings, primarySpacing: 56 };
engine.update(settings);
advance();
assert.notEqual(primaryPositions(), originalPrimaryPositions, "Primary spacing must use an independent grid");
assert.equal(JSON.stringify(drawn), unchangedCircles);
assert.equal(JSON.stringify(squares), originalGlass);
settings = { ...settings, primarySize: 32, primarySpacing: 32, primaryQuantity: 0 };
engine.update(settings);
advance();
assert.equal(primaryCircles.length, 0);
settings = { ...settings, primaryQuantity: 100, primaryEnabled: false };
engine.update(settings);
advance();
assert.equal(primaryCircles.length, 0);
settings = { ...settings, primaryEnabled: true };
engine.update(settings);
advance();
assert.equal(primaryCircles.length, drawn.length, "Both 100% circle layers must sample the same source region");
settings = { ...settings, squareProbability: 100 };
engine.update(settings);
advance();
assert.equal(squares.length, drawn.length, "100% squares must cover all eligible positions");
settings = { ...settings, squareProbability: 0 };
engine.update(settings);
advance();
assert.equal(squares.length, 0);
settings = { ...settings, squareProbability: 100, enabled: false };
engine.update(settings);
advance();
assert.equal(drawn.length, 0);
assert(squares.length > 0, "Squares must work independently of the circle layer");
settings = { ...settings, squaresEnabled: false };
engine.update(settings);
advance();
assert.equal(squares.length, 0);

expectHomeOnly = false;
settings = { ...api.DEFAULT_SETTINGS, paused: true, quantity: 100, spacing: 10,
  prismTraceAmount: 0, rotationX: 90, rotationY: 0, rotationZ: 0 };
engine.update(settings);
engine.reset();
advance();
const occupies = (x, y) => drawn.some(p => Math.abs(p.x - x) < 0.01 && Math.abs(p.y - y) < 0.01);
assert(occupies(972, 350), "The projected base must retain its long right-hand spike");
assert(!occupies(912, 390), "The notch beside the spike must remain empty rather than being filled by a convex hull");
settings = { ...api.DEFAULT_SETTINGS, paused: true, quantity: 100, prismTraceAmount: 0,
  rotationX: 0, rotationY: 0, rotationZ: 0, rotationSpeed: 0 };
engine.update(settings);
engine.reset();
advance();
const bounds = () => ({
  width: Math.max(...drawn.map(p => p.x)) - Math.min(...drawn.map(p => p.x)),
  height: Math.max(...drawn.map(p => p.y)) - Math.min(...drawn.map(p => p.y)),
});
const originalBounds = bounds();
const originalProjection = JSON.stringify(drawn);
settings = { ...settings, prismWidth: 180 };
engine.update(settings);
advance();
assert(bounds().width > originalBounds.width && bounds().height === originalBounds.height);
settings = { ...settings, prismWidth: 100, prismHeight: 180 };
engine.update(settings);
advance();
assert(bounds().height > originalBounds.height && bounds().width === originalBounds.width);
settings = { ...settings, prismHeight: 100 };
for (const axis of ["rotationX", "rotationY", "rotationZ"]) {
  engine.update({ ...settings, [axis]: 65 });
  advance();
  assert.notEqual(JSON.stringify(drawn), originalProjection, `${axis} must change the projection`);
}
settings = { ...settings, paused: false };
engine.update(settings);
advance(120);
assert.equal(JSON.stringify(drawn), originalProjection, "Zero rotation speed must hold orientation");
settings = { ...api.DEFAULT_SETTINGS };
engine.update(settings);
engine.reset();
expectHomeOnly = true;
settings = { ...settings, quantity: 100, spacing: 20, speed: 100, prismTraceAmount: 100, prismTraceDuration: 8 };
engine.update(settings);
advance(120);
settings = { ...settings, paused: true };
engine.update(settings);
advance();
const prismWithTrail = drawn.length;
settings = { ...settings, prismTraceAmount: 0 };
engine.update(settings);
advance();
assert(prismWithTrail > drawn.length, "Prism trace controls must retain previous projections independently");
function move(x, y) {
  listeners.get("pointermove")({ isPrimary: true, clientX: x, clientY: y });
}
function near(x, y) {
  return drawn.some((circle) => Math.hypot(circle.x - x, circle.y - y) < settings.spacing);
}
// A mouse trail must still be created when only the primary layer is enabled.
settings = { ...api.DEFAULT_SETTINGS, enabled: false, squaresEnabled: false, primaryQuantity: 100,
  primaryOffsetX: 50, primaryOffsetY: -30 };
engine.update(settings);
expectHomeOnly = false;
move(80, 620);
move(350, 620);
listeners.get("pointerleave")();
advance();
assert.equal(drawn.length, 0);
assert.equal(squares.length, 0);
assert(primaryCircles.some(p => Math.hypot(p.x - 200, p.y - 590) < settings.primarySpacing),
  "The primary layer must keep an offset cursor trajectory independently");
advance(240);
assert(!primaryCircles.some(p => p.x < 500 && p.y > 550), "Primary mouse trails must expire");
engine.reset();
settings = { ...api.DEFAULT_SETTINGS, quantity: 100 };
engine.update(settings);
expectHomeOnly = false;
move(80, 620);
advance();
assert(near(80, 620), "Hover alone must paint outside the home area");
move(1180, 620);
advance();
assert(squares.some(p => p.x < 400 && p.y > 580), "Mouse history must also generate probability-selected squares");
for (const x of [80, 300, 550, 850, 1180]) {
  assert(near(x, 620), "Fast mouse movement must leave a connected sampled trajectory");
}
assert(!near(100, 100), "Unvisited areas must remain empty");
listeners.get("pointerleave")();
advance(30);
assert(near(300, 620), "A trail must survive after the cursor leaves");
settings = { ...settings, paused: true };
engine.update(settings);
advance();
const pausedTrail = JSON.stringify(drawn);
const pausedSquares = JSON.stringify(squares);
advance(240);
assert.equal(JSON.stringify(squares), pausedSquares, "Pause must freeze glass squares too");
assert.equal(JSON.stringify(drawn), pausedTrail, "Pause must freeze the entire trail");
settings = { ...settings, paused: false };
engine.update(settings);
advance(240);
assert(!squares.some(p => p.x < 400 && p.y > 580), "Mouse squares must expire with their source trail");
expectHomeOnly = true;
advance(); // Expired paths must leave only the original organism.

expectHomeOnly = false;
for (const [x, y] of [[5, 5], [1275, 5], [1275, 715], [5, 715]]) {
  move(x, y);
  advance();
  assert(near(x, y), "The brush must reach every viewport corner");
  listeners.get("pointerleave")();
}
engine.reset();
expectHomeOnly = true;
advance(); // Reset also clears the active cursor.

settings = { ...settings, influence: 0 };
engine.update(settings);
move(100, 100);
advance(30); // Zero influence must prevent fullscreen cursor circles.
listeners.get("pointerleave")();
settings = { ...settings, influence: 65 };
engine.update(settings);
expectHomeOnly = false;
for (let x = 80; x <= 280; x += 2) {
  move(x, 620);
  advance();
}
assert(near(130, 620), "Slow pointer movement must also leave a trail");
settings = { ...settings, pointerTraceAmount: 0 };
engine.update(settings);
listeners.get("pointerleave")();
advance();
assert(!near(130, 620), "Zero trace amount must clear the stored mouse path immediately");
settings = { ...settings, pointerTraceAmount: 50, pointerTraceDuration: 0.2 };
engine.update(settings);
move(80, 620);
move(280, 620);
listeners.get("pointerleave")();
advance(30);
assert(!near(130, 620), "The disappearance control must expire the mouse trail");
settings = { ...settings, pointerTraceAmount: 0, pointerTraceDuration: 3.2 };
engine.update(settings);
move(100, 620);
advance();
assert(near(100, 620), "The live pointer must remain visible when history is disabled");
listeners.get("pointerleave")();
advance();
assert(!near(100, 620), "Zero trace amount must leave no stored mouse path");
engine.reset();
expectHomeOnly = true;
settings = { ...settings, pointerTraceAmount: 50, spacing: 10 };
engine.update(settings);
advance(10); // The expanded spacing range must reach 10 px without changing diameter.
settings = { ...settings, paused: true, enabled: false };
engine.update(settings);
advance();
assert.equal(drawn.length, 0);
assert.equal(pending.size, 0, "Pause must stop scheduling animation frames");
settings = { ...settings, enabled: true, quantity: 0 };
engine.update(settings);
advance();
assert.equal(drawn.length, 0);
settings = { ...api.DEFAULT_SETTINGS };
engine.update(settings);
viewport = { width: 390, height: 844, left: 0, top: 0 };
expectHomeOnly = false;
resize();
advance(240);
assert.equal(canvas.width, 390);
assert.equal(canvas.height, 844);
assert(drawn.length > 0, "The mobile organism must remain visible");
assert.deepEqual(layerGeometry.map(({ size, spacing }) => [size, spacing]), [[24, 24], [24, 24], [24, 24]]);
settings = { ...settings, paused: true, size: 48, spacing: 10, squareSize: 80, squareSpacing: 22,
  primarySize: 60, primarySpacing: 30, quantity: 100, rotationX: 0, rotationY: 0, rotationZ: 0 };
engine.update(settings);
engine.reset();
advance();
assert.deepEqual(layerGeometry.map(({ size, spacing }) => [size, spacing]), [[36, 7.5], [60, 16.5], [45, 22.5]],
  "Mobile must use 75% sizes and spacing, including the minimum desktop spacing");
const mobileY = drawn.map(({ y }) => y);
assert(Math.abs((Math.min(...mobileY) + Math.max(...mobileY)) / 2 - viewport.height * 0.58) < 1e-6,
  "Mobile organism must sit slightly below the vertical midpoint");
assert(drawn.some(({ x }) => x < viewport.width / 2) && drawn.some(({ x }) => x > viewport.width / 2));
for (const { originX, spacing } of layerGeometry) {
  assert(Math.abs((viewport.width / 2 - originX) / spacing - Math.round((viewport.width / 2 - originX) / spacing)) < 1e-6,
    "Mobile layers must share a centered lattice");
}
const savedSettings = JSON.stringify(settings);
for (const width of [768, 769, 390, 1280]) {
  viewport = { ...viewport, width };
  resize();
  advance();
  const scale = width <= 768 ? 0.75 : 1;
  assert.deepEqual(layerGeometry.map(({ size, spacing }) => [size, spacing]),
    [[48, 10], [80, 22], [60, 30]].map(([size, spacing]) => [size * (width <= 768 ? 0.75 : 1), spacing * scale]));
  assert.equal(JSON.stringify(settings), savedSettings, "Resizing must preserve the desktop configuration");
}
listeners.get("webglcontextlost")({ preventDefault() {} });
assert.equal(pending.size, 0, "Context loss must stop rendering");
listeners.get("webglcontextrestored")();
advance();
assert.deepEqual(unavailable, [true, false], "Context restoration must resume the effect");
engine.destroy();
assert.equal(pending.size, 0);
assert.equal(listeners.size, 0);
assert.equal(destroyed, 2, "Restored and final GPU resources must be released");

// A canvas behind the page cannot receive pointer events directly. Observe
// the page's input without capturing it or generating trails over controls.
viewport = { width: 1280, height: 720, left: 0, top: 0 };
settings = { ...api.DEFAULT_SETTINGS, pointerTraceAmount: 0 };
expectHomeOnly = false;
const pageListeners = new Map();
const pageInput = {
  addEventListener(name, handler, options) {
    assert.equal(options.passive, true, "Background input must never block page interaction");
    pageListeners.set(name, handler);
  },
  removeEventListener(name) { pageListeners.delete(name); },
};
const background = api.createOrganism(canvas, settings, () => {}, pageInput);
advance();
const captureCount = captures;
const pageEvent = { isPrimary: true, pointerType: "mouse", pointerId: 1, clientX: 100, clientY: 620, target: new MockElement() };
pageListeners.get("pointerdown")(pageEvent);
advance();
assert(near(100, 620), "Background must follow input received over page content");
assert.equal(captures, captureCount, "Background must not steal pointer capture from the page");
pageListeners.get("pointerup")(pageEvent);
pageListeners.get("pointermove")({ ...pageEvent, clientX: 220, target: new MockElement(true) });
advance();
assert(!near(100, 620) && !near(220, 620), "Settings interaction must clear the live brush and not paint");
pageListeners.get("pointermove")({ ...pageEvent, clientX: 280 });
advance();
assert(near(280, 620), "The brush must resume after leaving the controls");
pageListeners.get("pointerleave")();
advance();
assert(!near(280, 620), "The brush must stop when the pointer leaves the viewport");
background.destroy();
assert.equal(pageListeners.size, 0, "Shared page listeners must be removed on teardown");
assert.equal(listeners.size, 0);
assert.equal(pending.size, 0);
console.log("PASS: defaults, prism, independent layers, fixed sizes, trails, controls, resize, context recovery, passive background input, control exclusion, and cleanup.");
