export type OrganismLayer = {
  data: Uint8Array;
  columns: number;
  rows: number;
  originX: number;
  originY: number;
  spacing: number;
  size: number;
};

const vertexSource = `#version 300 es
void main() {
  vec2 position = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}`;

const fragmentSource = `#version 300 es
precision highp float;
uniform sampler2D u_circles;
uniform sampler2D u_glass;
uniform sampler2D u_primary;
uniform vec2 u_resolution;
uniform vec2 u_circleOrigin;
uniform vec2 u_glassOrigin;
uniform vec2 u_primaryOrigin;
uniform float u_dpr;
uniform float u_blurRadius;
uniform float u_circleSpacing;
uniform float u_glassSpacing;
uniform float u_primarySpacing;
uniform float u_circleRadius;
uniform float u_glassRadius;
uniform float u_primaryRadius;
uniform vec3 u_white;
uniform vec3 u_primaryColor;
uniform int u_circleReach;
uniform int u_glassReach;
uniform int u_primaryReach;
uniform bool u_grid;
out vec4 color;

float merge(float a, float b, float blend) {
  float h = max(blend - abs(a - b), 0.0) / blend;
  return min(a, b) - h * h * blend * 0.25;
}
float circleField(sampler2D layer, vec2 p, vec2 origin, float spacing, float radius, int reach) {
  ivec2 nearest = ivec2(floor((p - origin) / spacing + 0.5));
  ivec2 dimensions = textureSize(layer, 0);
  float distance = 10000.0;
  for (int y = -reach; y <= reach; y++) {
    for (int x = -reach; x <= reach; x++) {
      ivec2 cell = nearest + ivec2(x, y);
      if (any(lessThan(cell, ivec2(0))) || any(greaterThanEqual(cell, dimensions))) continue;
      if (texelFetch(layer, cell, 0).r < 0.5) continue;
      vec2 center = origin + vec2(cell) * spacing;
      distance = merge(distance, length(p - center) - radius, radius * 0.55);
    }
  }
  return distance;
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y) / u_dpr;
  float distance = circleField(u_circles, p, u_circleOrigin, u_circleSpacing, u_circleRadius, u_circleReach);
  float primaryDistance = circleField(u_primary, p, u_primaryOrigin, u_primarySpacing, u_primaryRadius, u_primaryReach);
  // Square masks only: there is no drawn surface, border or reflection.
  ivec2 paneCell = ivec2(floor((p - u_glassOrigin) / u_glassSpacing + 0.5));
  ivec2 paneDimensions = textureSize(u_glass, 0);
  float squareDistance = 10000.0;
  for (int y = -u_glassReach; y <= u_glassReach; y++) {
    for (int x = -u_glassReach; x <= u_glassReach; x++) {
      ivec2 cell = paneCell + ivec2(x, y);
      if (any(lessThan(cell, ivec2(0))) || any(greaterThanEqual(cell, paneDimensions))) continue;
      if (texelFetch(u_glass, cell, 0).r < 0.5) continue;
      vec2 local = abs(p - (u_glassOrigin + vec2(cell) * u_glassSpacing));
      squareDistance = min(squareDistance, max(local.x, local.y) - u_glassRadius);
    }
  }
  float cover = (1.0 - smoothstep(-0.7 / u_dpr, 0.7 / u_dpr, squareDistance)) * step(0.001, u_blurRadius);
  float aa = clamp(fwidth(distance) * 0.5, 0.35 / u_dpr, 1.0 / u_dpr);
  float outline = 1.0 - smoothstep(0.75 - aa, 0.75 + aa, abs(distance));
  // Gaussian diffusion of the existing thin contour. Normalizing by sigma
  // spreads its brightness rather than adding a glow or a tinted square.
  float sigma = max(0.1, u_blurRadius);
  float blurredOutline = 1.5 / (2.506628 * sigma) * exp(-0.5 * pow(distance / sigma, 2.0));
  float alpha = mix(outline, blurredOutline, cover);
  vec2 gridLocal = (p - u_circleOrigin) / u_circleSpacing;
  float gridDistance = length((gridLocal - floor(gridLocal + 0.5)) * u_circleSpacing);
  if (u_grid && distance > 1.5) {
    float gridAlpha = (1.0 - smoothstep(0.6, 1.4, gridDistance)) * 0.2;
    float blurredGrid = 0.2 / (2.0 * sigma * sigma) * exp(-0.5 * pow(gridDistance / sigma, 2.0));
    alpha = max(alpha, mix(gridAlpha, blurredGrid, cover));
  }
  // The second circle layer is a solid smooth union, including every bridge.
  // The borderless glass mask softens both layers beneath it.
  float primaryAA = clamp(fwidth(primaryDistance) * 0.5, 0.35 / u_dpr, 1.0 / u_dpr);
  float solid = 1.0 - smoothstep(-primaryAA, primaryAA, primaryDistance);
  float blurredSolid = 1.0 - smoothstep(-sigma * 2.0, sigma * 2.0, primaryDistance);
  float primaryAlpha = mix(solid, blurredSolid, cover);
  float combinedAlpha = primaryAlpha + alpha * (1.0 - primaryAlpha);
  vec3 rgb = (u_primaryColor * primaryAlpha + u_white * alpha * (1.0 - primaryAlpha)) / max(combinedAlpha, 0.0001);
  color = vec4(rgb, combinedAlpha);
}`;

export function createOrganismRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) throw new Error("WebGL 2 no está disponible.");
  const program = gl.createProgram();
  const textures = [gl.createTexture(), gl.createTexture(), gl.createTexture()];
  if (!program || textures.some((texture) => !texture)) {
    gl.deleteProgram(program);
    textures.forEach((texture) => gl.deleteTexture(texture));
    throw new Error("No se pudo iniciar el shader.");
  }
  try {
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("No se pudo crear el shader.");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      const valid = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      const message = gl.getShaderInfoLog(shader);
      if (valid) gl.attachShader(program, shader);
      gl.deleteShader(shader);
      if (!valid) throw new Error(message || "Error al compilar el shader.");
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Error al enlazar el shader.");
  } catch (error) {
    gl.deleteProgram(program);
    textures.forEach((texture) => gl.deleteTexture(texture));
    throw error;
  }
  const uniforms = Object.fromEntries(
    ["circles", "glass", "resolution", "circleOrigin", "glassOrigin", "dpr", "circleSpacing", "glassSpacing",
      "circleRadius", "glassRadius", "white", "circleReach", "glassReach", "grid",
      "primary", "primaryOrigin", "primarySpacing", "primaryRadius", "primaryReach", "primaryColor", "blurRadius"]
      .map((name) => [name, gl.getUniformLocation(program, 'u_' + name)]),
  );
  gl.useProgram(program);
  textures.forEach((texture, index) => {
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  });
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.uniform1i(uniforms.circles, 0);
  gl.uniform1i(uniforms.glass, 1);
  gl.uniform1i(uniforms.primary, 2);
  const allocated = textures.map(() => ({ columns: 0, rows: 0 }));
  let dpr = 1;

  const upload = (layer: OrganismLayer, index: number) => {
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, textures[index]);
    const previous = allocated[index];
    if (previous.columns !== layer.columns || previous.rows !== layer.rows) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, layer.columns, layer.rows, 0, gl.RED, gl.UNSIGNED_BYTE, layer.data);
      previous.columns = layer.columns;
      previous.rows = layer.rows;
    } else {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, layer.columns, layer.rows, gl.RED, gl.UNSIGNED_BYTE, layer.data);
    }
  };
  return {
    resize(width: number, height: number, scale: number) {
      dpr = scale;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.dpr, dpr);
      const white = getComputedStyle(canvas).color.match(/[\d.]+/g)?.slice(0, 3).map((value) => Number(value) / 255) ?? [1, 1, 1];
      gl.uniform3fv(uniforms.white, white);
      const primaryToken = getComputedStyle(canvas).getPropertyValue("--organism-primary").trim();
      const hex = /^#([\da-f]{6})$/i.exec(primaryToken);
      const primary = hex
        ? [0, 2, 4].map((index) => parseInt(hex[1].slice(index, index + 2), 16) / 255)
        : primaryToken.match(/[\d.]+/g)?.slice(0, 3).map((value) => Number(value) / 255) ?? white;
      gl.uniform3fv(uniforms.primaryColor, primary);
    },
    draw(circles: OrganismLayer, glass: OrganismLayer, primary: OrganismLayer, grid: boolean, blurRadius: number) {
      gl.uniform1f(uniforms.blurRadius, Math.max(0, blurRadius));
      upload(circles, 0);
      upload(glass, 1);
      upload(primary, 2);
      gl.uniform2f(uniforms.primaryOrigin, primary.originX, primary.originY);
      gl.uniform1f(uniforms.primarySpacing, primary.spacing);
      gl.uniform1f(uniforms.primaryRadius, primary.size / 2);
      gl.uniform1i(uniforms.primaryReach, Math.ceil(primary.size * 0.65 / primary.spacing) + 1);
      gl.uniform2f(uniforms.circleOrigin, circles.originX, circles.originY);
      gl.uniform2f(uniforms.glassOrigin, glass.originX, glass.originY);
      gl.uniform1f(uniforms.circleSpacing, circles.spacing);
      gl.uniform1f(uniforms.glassSpacing, glass.spacing);
      gl.uniform1f(uniforms.circleRadius, circles.size / 2);
      gl.uniform1f(uniforms.glassRadius, glass.size / 2);
      gl.uniform1i(uniforms.circleReach, Math.ceil(circles.size * 0.65 / circles.spacing) + 1);
      gl.uniform1i(uniforms.glassReach, Math.ceil((glass.size / 2 + 5) / glass.spacing) + 1);
      gl.uniform1i(uniforms.grid, grid ? 1 : 0);
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      let left = canvas.width;
      let top = canvas.height;
      let right = 0;
      let bottom = 0;
      for (const layer of [circles, glass, primary]) {
        const margin = layer.size * 0.8 + 6;
        for (let i = 0; i < layer.data.length; i++) {
          if (!layer.data[i] && !(grid && layer === circles)) continue;
          const x = layer.originX + (i % layer.columns) * layer.spacing;
          const y = layer.originY + Math.floor(i / layer.columns) * layer.spacing;
          left = Math.min(left, (x - margin) * dpr);
          right = Math.max(right, (x + margin) * dpr);
          top = Math.min(top, (y - margin) * dpr);
          bottom = Math.max(bottom, (y + margin) * dpr);
        }
      }
      left = Math.max(0, Math.floor(left));
      right = Math.min(canvas.width, Math.ceil(right));
      top = Math.max(0, Math.floor(top));
      bottom = Math.min(canvas.height, Math.ceil(bottom));
      if (right <= left || bottom <= top) return;
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(left, canvas.height - bottom, right - left, bottom - top);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.disable(gl.SCISSOR_TEST);
    },
    destroy() {
      textures.forEach((texture) => gl.deleteTexture(texture));
      gl.deleteProgram(program);
    },
  };
}
