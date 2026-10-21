/**
 * Tiny SVG toolkit shared by all cipher visualizations.
 *
 * Everything is plain string building: no DOM, no dependencies.
 * Animations use SMIL on one shared looping clock per drawing, so they also
 * play when the SVG is embedded with <img> (e.g. on GitHub or npm), where
 * scripts are not allowed.
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */

export const WIDTH = 960;

export const COLOR = {
  paper: '#f6eedb',
  paperDeep: '#ece0c3',
  card: '#fffaf0',
  ink: '#2b2118',
  muted: '#7d6c55',
  rule: '#cdbb98',
  plain: '#b4412c',     // vermilion: plaintext
  plainSoft: '#f3d3c6',
  key: '#b9821a',       // ochre: key material
  keySoft: '#f5e2b0',
  cipher: '#23598a',    // lapis: ciphertext
  cipherSoft: '#cfe0ee',
  green: '#4c7a46',
  greenSoft: '#d9e6cf',
  plum: '#7a4b7e',
  plumSoft: '#e6d5e6'
};

export const FONT = {
  serif: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', 'DejaVu Serif', serif",
  mono: "'SF Mono', Menlo, Consolas, 'Liberation Mono', 'DejaVu Sans Mono', monospace"
};

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const r2 = (n) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));

export function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function attrs(obj = {}) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${typeof v === 'number' ? r2(v) : esc(v)}"`)
    .join('');
}

/**
 * Build an element. Children may be a string or an array of strings.
 */
export function el(tag, attributes = {}, children) {
  const inner = Array.isArray(children) ? children.join('') : children;
  if (inner === undefined || inner === '') {
    return `<${tag}${attrs(attributes)}/>`;
  }
  return `<${tag}${attrs(attributes)}>${inner}</${tag}>`;
}

export const g = (attributes, children) => el('g', attributes, children);

export function text(x, y, str, attributes = {}, children = '') {
  return el('text', { x, y, ...attributes }, esc(str) + children);
}

/** Monospaced glyph, centered on (x, y). */
export function glyph(x, y, ch, { size = 18, fill = COLOR.ink, weight = 700, ...rest } = {}, children = '') {
  return text(x, y + size * 0.36, ch, {
    'font-family': FONT.mono,
    'font-size': size,
    'font-weight': weight,
    'text-anchor': 'middle',
    fill,
    ...rest
  }, children);
}

/** A letter on a little card. (x, y) is the center. */
export function tile(x, y, ch, {
  size = 34,
  color = COLOR.ink,
  fill = COLOR.card,
  stroke,
  font = size * 0.56,
  radius = 6,
  extra = '',
  attributes = {}
} = {}) {
  const h = size / 2;
  return g(attributes, [
    el('rect', {
      x: x - h, y: y - h, width: size, height: size, rx: radius,
      fill, stroke: stroke || color, 'stroke-width': 1.5
    }),
    glyph(x, y, ch, { size: font, fill: color }),
    extra
  ]);
}

/** Small-caps style label. */
export function label(x, y, str, { anchor = 'start', fill = COLOR.muted, size = 11, spacing = 2.2, ...rest } = {}) {
  return text(x, y, str.toUpperCase(), {
    'font-family': FONT.serif,
    'font-size': size,
    'letter-spacing': spacing,
    'text-anchor': anchor,
    fill,
    ...rest
  });
}

/** Italic serif prose. */
export function note(x, y, str, { anchor = 'start', fill = COLOR.muted, size = 14, style = 'italic', ...rest } = {}) {
  return text(x, y, str, {
    'font-family': FONT.serif,
    'font-size': size,
    'font-style': style,
    'text-anchor': anchor,
    fill,
    ...rest
  });
}

/* ------------------------------------------------------------------------ *
 * Animation: every animation in a drawing loops on the same period T, and is
 * described as a list of [seconds, value] keyframes inside that period.
 * ------------------------------------------------------------------------ */

function normalize(T, frames) {
  const sorted = [...frames].sort((a, b) => a[0] - b[0]);
  if (sorted[0][0] > 0) sorted.unshift([0, sorted[0][1]]);
  if (sorted[sorted.length - 1][0] < T) sorted.push([T, sorted[sorted.length - 1][1]]);
  // keyTimes must not decrease; nudge identical times apart a hair
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] <= sorted[i - 1][0]) sorted[i][0] = sorted[i - 1][0] + 0.001;
  }
  const last = sorted[sorted.length - 1];
  if (last[0] > T) last[0] = T;
  return {
    keyTimes: sorted.map(([t]) => r2(Math.min(1, t / T) * 1e4) / 1e4).join(';'),
    values: sorted.map(([, v]) => v).join(';')
  };
}

export function animate(attributeName, T, frames, { ease = false, ...extra } = {}) {
  const { keyTimes, values } = normalize(T, frames);
  return el('animate', {
    attributeName, dur: `${T}s`, repeatCount: 'indefinite', values, keyTimes,
    ...easing(keyTimes, ease), ...extra
  });
}

const EASE = '0.45 0 0.35 1';

/** Smooth every segment (ease-in-out) instead of moving linearly. */
function easing(keyTimes, ease) {
  if (!ease) return {};
  const n = keyTimes.split(';').length;
  return { calcMode: 'spline', keySplines: Array(n - 1).fill(EASE).join(';') };
}

export function animateTransform(type, T, frames, { ease = false, ...extra } = {}) {
  const { keyTimes, values } = normalize(T, frames);
  return el('animateTransform', {
    attributeName: 'transform', type, dur: `${T}s`, repeatCount: 'indefinite', values, keyTimes,
    ...easing(keyTimes, ease), ...extra
  });
}

/** Move along `path` between seconds a and b, parked at the ends otherwise. */
export function animateMotion(T, path, a, b, extra = {}) {
  const { keyTimes, values } = normalize(T, [[0, 0], [a, 0], [b, 1], [T, 1]]);
  return el('animateMotion', {
    dur: `${T}s`, repeatCount: 'indefinite', path,
    keyPoints: values, keyTimes, calcMode: 'linear', ...extra
  });
}

/**
 * Keyframes for "visible from a to b" (fading over `fade` seconds).
 * Pass b >= T to stay on until the loop restarts.
 */
export function windowFrames(T, a, b, { fade = 0.25, on = 1, off = 0 } = {}) {
  const frames = [[0, off], [Math.max(0, a - fade), off], [a, on]];
  if (b < T) {
    frames.push([b, on], [Math.min(T, b + fade), off]);
  } else {
    frames.push([T - 0.35, on], [T, off]);
  }
  return frames;
}

/** Shorthand: opacity animation for windowFrames. */
export const blink = (T, a, b, opts) => animate('opacity', T, windowFrames(T, a, b, opts));

/** Stroke "drawing" animation for a path of (approximate) length len. */
export function draw(T, len, a, b, { hold = T - 0.35 } = {}) {
  const frames = [[0, len], [a, len], [b, 0], [hold, 0]];
  if (hold < T) frames.push([Math.min(T, hold + 0.2), len]);
  return animate('stroke-dashoffset', T, frames);
}

/* ------------------------------------------------------------------------ *
 * The page every diagram is printed on.
 * ------------------------------------------------------------------------ */

function defs() {
  return el('defs', {}, [
    el('filter', { id: 'grain', x: 0, y: 0, width: '100%', height: '100%' }, [
      el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.85, numOctaves: 2, seed: 7, result: 'noise' }),
      el('feColorMatrix', {
        type: 'matrix',
        values: '0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.16  0 0 0 0.09 0'
      })
    ]),
    el('radialGradient', { id: 'vignette', cx: '50%', cy: '45%', r: '75%' }, [
      el('stop', { offset: '60%', 'stop-color': COLOR.paperDeep, 'stop-opacity': 0 }),
      el('stop', { offset: '100%', 'stop-color': '#c9b48a', 'stop-opacity': 0.55 })
    ]),
    el('filter', { id: 'lift', x: '-20%', y: '-20%', width: '140%', height: '150%' }, [
      el('feDropShadow', { dx: 0, dy: 1.5, stdDeviation: 1.2, 'flood-color': '#5a4325', 'flood-opacity': 0.28 })
    ]),
    ...['ink', 'plain', 'key', 'cipher', 'muted', 'green', 'plum'].map((name) =>
      el('marker', {
        id: `arrow-${name}`, viewBox: '0 0 10 10', refX: 8, refY: 5,
        markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse'
      }, el('path', { d: 'M1,1 L9,5 L1,9 Q3,5 1,1 Z', fill: COLOR[name] }))
    )
  ]);
}

function corner(x, y, sx, sy) {
  return el('path', {
    d: `M${x},${y + sy * 26} L${x},${y} L${x + sx * 26},${y} M${x + sx * 6},${y + sy * 6} l${sx * 6},0 l0,${sy * 6} l${-sx * 6},0 Z`,
    fill: 'none', stroke: COLOR.ink, 'stroke-width': 1.2, opacity: 0.55
  });
}

function legend(x, y) {
  const items = [['plaintext', COLOR.plain], ['key', COLOR.key], ['ciphertext', COLOR.cipher]];
  let cursor = x;
  return g({}, items.map(([name, color]) => {
    const out = g({}, [
      el('circle', { cx: cursor, cy: y - 4, r: 5, fill: color }),
      label(cursor + 10, y, name, { size: 10, spacing: 1.6, fill: COLOR.muted })
    ]);
    cursor += 26 + name.length * 8.5;
    return out;
  }));
}

/**
 * Wrap a drawing in the shared parchment card with header and footer.
 */
export function page({
  height,
  number,
  family,
  title,
  subtitle,
  body,
  footer,
  description,
  showLegend = true
}) {
  const W = WIDTH;
  const H = height;
  const id = title.toLowerCase().replace(/[^a-z]+/g, '-');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${id}-title ${id}-desc">`,
    el('title', { id: `${id}-title` }, esc(title)),
    el('desc', { id: `${id}-desc` }, esc(description)),
    defs(),
    el('rect', { x: 0, y: 0, width: W, height: H, rx: 18, fill: COLOR.paper }),
    el('rect', { x: 0, y: 0, width: W, height: H, rx: 18, fill: 'url(#vignette)' }),
    el('rect', { x: 0, y: 0, width: W, height: H, rx: 18, filter: 'url(#grain)' }),
    el('rect', { x: 12, y: 12, width: W - 24, height: H - 24, rx: 10, fill: 'none', stroke: COLOR.ink, 'stroke-width': 1, opacity: 0.35 }),
    corner(22, 22, 1, 1), corner(W - 22, 22, -1, 1), corner(22, H - 22, 1, -1), corner(W - 22, H - 22, -1, -1),
    label(48, 50, `Clarissa  ·  Nº ${number}  ·  ${family}`, { size: 11, spacing: 3 }),
    text(46, 88, title, { 'font-family': FONT.serif, 'font-size': 34, fill: COLOR.ink }),
    note(48, 113, subtitle, { size: 15 }),
    showLegend ? legend(W - 300, 50) : '',
    body,
    el('line', { x1: 48, y1: H - 62, x2: W - 48, y2: H - 62, stroke: COLOR.rule, 'stroke-width': 1 }),
    footer,
    '</svg>'
  ].join('\n');
}

/**
 * Footer line: encrypt(...) → result, colored by role.
 * parts: array of [string, color] pairs.
 */
export function codeLine(x, y, parts, { size = 15, anchor = 'start' } = {}) {
  return text(x, y, '', {
    'font-family': FONT.mono, 'font-size': size, 'text-anchor': anchor, fill: COLOR.ink
  }, parts.map(([str, color, weight]) =>
    el('tspan', { fill: color || COLOR.ink, 'font-weight': weight || 400 }, esc(str))
  ).join(''));
}

/** Quadratic arc ("hop") path from (x1, y) to (x2, y) bulging upward by h. */
export function hop(x1, y, x2, h) {
  return `M${r2(x1)},${r2(y)} Q${r2((x1 + x2) / 2)},${r2(y - h * 2)} ${r2(x2)},${r2(y)}`;
}

export const polar = (cx, cy, r, deg) => {
  const a = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

export { r2 as round };
