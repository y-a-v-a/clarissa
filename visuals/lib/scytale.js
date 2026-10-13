/**
 * Scytale: a leather strip wound around a rod. The message is written along
 * the rod, one row per face; unwound, the strip shows the letters column by
 * column.
 */
import {
  COLOR, FONT, WIDTH,
  animate, animateMotion, animateTransform, blink, codeLine, el, g, glyph,
  label, note, page, text, windowFrames
} from './svg.js';

const PLAIN = 'HELLOWORLD';
const PER_ROW = 3; // the "diameter" argument: letters along the rod per face

const ROWS = Math.ceil(PLAIN.length / PER_ROW);
const padded = PLAIN.padEnd(ROWS * PER_ROW, 'X');
const grid = Array.from({ length: ROWS }, (_, r) => padded.slice(r * PER_ROW, (r + 1) * PER_ROW));
const order = [];
for (let c = 0; c < PER_ROW; c++) {
  for (let r = 0; r < ROWS; r++) order.push([r, c]);
}

export const example = {
  cipher: 'Scytale',
  args: [PLAIN.toLowerCase(), PER_ROW],
  expected: order.map(([r, c]) => grid[r][c]).join('')
};

const H = 600;
const T = 17;

// one hue per face of the rod
const FACE = ['hsl(8, 62%, 86%)', 'hsl(42, 70%, 82%)', 'hsl(140, 32%, 82%)', 'hsl(258, 34%, 86%)'];
const FACE_INK = ['hsl(8, 50%, 42%)', 'hsl(38, 70%, 34%)', 'hsl(140, 34%, 30%)', 'hsl(258, 30%, 42%)'];

/* the rod turns a quarter at a time ------------------------------------- */

const TURNS = [1.3, 2.9, 4.5, 6.1].map((t, k) => ({ start: t, end: t + 0.7, to: (k + 1) * 90 }));
const smooth = (x) => x * x * (3 - 2 * x);

function phi(t) {
  let angle = 0;
  for (const { start, end, to } of TURNS) {
    if (t >= end) angle = to;
    else if (t > start) return to - 90 + 90 * smooth((t - start) / (end - start));
  }
  return angle;
}

/** Sample a function of the rod angle over the loop: denser while turning. */
function sampled(fn) {
  const times = new Set([0, T]);
  for (const { start, end } of TURNS) {
    for (let k = 0; k <= 10; k++) times.add(+(start + (end - start) * k / 10).toFixed(3));
  }
  return [...times].sort((a, b) => a - b).map((t) => [t, fn(phi(t))]);
}

const ROD = { x1: 74, x2: 446, cy: 262, r: 64 };
const PITCH = 84;
const X0 = 96;

function rod() {
  const { x1, x2, cy, r } = ROD;
  const parts = [];
  parts.push(el('linearGradient', { id: 'wood', x1: 0, y1: 0, x2: 0, y2: 1 }, [
    el('stop', { offset: '0%', 'stop-color': '#7a5634' }),
    el('stop', { offset: '35%', 'stop-color': '#b58756' }),
    el('stop', { offset: '60%', 'stop-color': '#a37446' }),
    el('stop', { offset: '100%', 'stop-color': '#5e3f22' })
  ]));
  parts.push(el('linearGradient', { id: 'shade', x1: 0, y1: 0, x2: 0, y2: 1 }, [
    el('stop', { offset: '0%', 'stop-color': '#2b1a0c', 'stop-opacity': 0.55 }),
    el('stop', { offset: '28%', 'stop-color': '#2b1a0c', 'stop-opacity': 0 }),
    el('stop', { offset: '45%', 'stop-color': '#fff7e6', 'stop-opacity': 0.18 }),
    el('stop', { offset: '72%', 'stop-color': '#2b1a0c', 'stop-opacity': 0 }),
    el('stop', { offset: '100%', 'stop-color': '#2b1a0c', 'stop-opacity': 0.6 })
  ]));
  parts.push(el('clipPath', { id: 'rod-body' }, el('rect', { x: x1, y: cy - r, width: x2 - x1, height: 2 * r })));

  // the rod pokes out on both ends
  parts.push(el('rect', { x: x1 - 26, y: cy - r + 10, width: x2 - x1 + 52, height: 2 * r - 20, rx: 12, fill: 'url(#wood)' }));
  parts.push(el('ellipse', { cx: x2 + 26, cy, rx: 9, ry: r - 10, fill: '#6b4a2b' }));
  parts.push(el('rect', { x: x1, y: cy - r, width: x2 - x1, height: 2 * r, fill: 'url(#wood)', opacity: 0.6 }));

  // the strip: helical bands, sliding sideways as the rod turns (barber pole)
  const bands = [];
  const edge = (s) => {
    const pts = [];
    for (let k = 0; k <= 12; k++) {
      const v = -90 + k * 15;
      pts.push([s + PITCH * v / 360, cy - r * Math.sin(v * Math.PI / 180)]);
    }
    return pts;
  };
  for (let j = -3; j < 7; j++) {
    const left = edge(X0 + j * PITCH);
    const right = edge(X0 + (j + 1) * PITCH).reverse();
    const d = 'M' + [...left, ...right].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L') + ' Z';
    bands.push(el('path', {
      d, fill: j % 2 === 0 ? '#e9d3ad' : '#e2c89c', stroke: '#8a6a43', 'stroke-width': 1.2
    }));
  }
  parts.push(g({ 'clip-path': 'url(#rod-body)' }, g({}, [
    ...bands,
    animateTransform('translate', T, sampled((p) => `${(PITCH * p / 360).toFixed(2)} 0`))
  ])));

  // the letters, one row per face; a face shows up front once per quarter turn
  for (let k = 0; k < ROWS; k++) {
    const letters = [...grid[k]].map((ch, j) => {
      const x = X0 + j * PITCH + PITCH / 2 + PITCH * k / 4;
      const pad = k * PER_ROW + j >= PLAIN.length;
      return glyph(x, 0, ch, { size: 30, fill: pad ? '#8f7a5c' : COLOR.plain });
    }).join('');
    const view = (p) => ((k * 90 - p) % 360 + 540) % 360 - 180; // -180..180, 0 = facing us
    parts.push(g({ 'clip-path': 'url(#rod-body)' }, g({ transform: `translate(0 ${cy})` }, [
      g({ transform: `scale(1 ${k === 0 ? 1 : 0})` }, [
        letters,
        animateTransform('scale', T, sampled((p) => `1 ${Math.max(0.001, Math.cos(view(p) * Math.PI / 180)).toFixed(3)}`))
      ]),
      animateTransform('translate', T, sampled((p) => `0 ${(cy - r * 0.92 * Math.sin(view(p) * Math.PI / 180)).toFixed(2)}`)),
      animate('opacity', T, sampled((p) => Math.max(0, Math.cos(view(p) * Math.PI / 180) * 1.6 - 0.3).toFixed(3)))
    ])));
  }

  // shading over everything for the round look
  parts.push(el('rect', { x: x1, y: cy - r, width: x2 - x1, height: 2 * r, fill: 'url(#shade)' }));
  parts.push(el('rect', { x: x1, y: cy - r, width: x2 - x1, height: 2 * r, fill: 'none', stroke: '#4a321b', 'stroke-width': 1.2 }));

  // end cap
  parts.push(el('ellipse', { cx: x1 - 26, cy, rx: 13, ry: r - 10, fill: '#c79b67', stroke: '#5e3f22', 'stroke-width': 1.2 }));

  // turning arrow
  const ax = x1 - 26;
  parts.push(el('path', {
    d: `M${ax + 22},${cy - r - 6} A30,${r + 6} 0 0 0 ${ax - 6},${cy - r + 22}`,
    fill: 'none', stroke: COLOR.ink, 'stroke-width': 1.6, 'marker-end': 'url(#arrow-ink)', opacity: 0
  }, animate('opacity', T, [[0, 0], ...TURNS.flatMap(({ start, end }) => [[start - 0.15, 0], [start, 0.8], [end, 0.8], [end + 0.15, 0]])])));
  return g({}, parts);
}

/* the flat view ----------------------------------------------------------- */

const GX = 586;
const GY = 178;
const CW = 46;
const CH = 34;
const cellCenter = (r, c) => [GX + c * CW + CW / 2, GY + r * CH + CH / 2];

function flat() {
  const parts = [];
  parts.push(label(GX - 70, GY - 22, 'what is written along the rod', { size: 10, spacing: 1.6 }));
  for (let r = 0; r < ROWS; r++) {
    // which face is in front right now?
    const front = sampled((p) => (Math.abs(((r * 90 - p) % 360 + 540) % 360 - 180) < 30 ? 1 : 0));
    parts.push(el('rect', {
      x: GX - 76, y: GY + r * CH + 3, width: CW * PER_ROW + 84, height: CH - 6, rx: 8,
      fill: 'none', stroke: COLOR.ink, 'stroke-width': 1.6, opacity: r === 0 ? 1 : 0
    }, animate('opacity', T, front)));
    parts.push(el('rect', { x: GX - 66, y: GY + r * CH + 11, width: 12, height: 12, rx: 3, fill: FACE[r], stroke: FACE_INK[r] }));
    parts.push(text(GX - 48, GY + r * CH + 22, `face ${r + 1}`, {
      'font-family': FONT.serif, 'font-size': 13, 'font-style': 'italic', fill: FACE_INK[r]
    }));
    for (let c = 0; c < PER_ROW; c++) {
      const [x, y] = cellCenter(r, c);
      const pad = r * PER_ROW + c >= PLAIN.length;
      parts.push(el('rect', {
        x: x - CW / 2 + 3, y: y - CH / 2 + 3, width: CW - 6, height: CH - 6, rx: 5,
        fill: FACE[r], stroke: pad ? COLOR.muted : FACE_INK[r], 'stroke-width': 1.2,
        'stroke-dasharray': pad ? '3 3' : undefined
      }));
      parts.push(glyph(x, y, grid[r][c], { size: 18, fill: pad ? COLOR.muted : COLOR.plain }));
    }
  }
  parts.push(note(GX + CW * PER_ROW + 14, GY + (ROWS - 1) * CH + 22, '← padding', { size: 12 }));

  // reading order: down the columns, one after the other
  for (let c = 0; c < PER_ROW; c++) {
    const [x, y1] = cellCenter(0, c);
    const [, y2] = cellCenter(ROWS - 1, c);
    const from = unwind(c * ROWS) - 0.15;
    const to = unwind(c * ROWS + ROWS - 1) + 0.6;
    parts.push(g({ opacity: 0 }, [
      el('rect', {
        x: x - CW / 2, y: y1 - CH / 2, width: CW, height: y2 - y1 + CH, rx: 8,
        fill: COLOR.cipher, 'fill-opacity': 0.08, stroke: COLOR.cipher, 'stroke-width': 2
      }),
      el('path', { d: `M${x - 7},${y2 + CH / 2 + 5} L${x + 7},${y2 + CH / 2 + 5} L${x},${y2 + CH / 2 + 13} Z`, fill: COLOR.cipher }),
      blink(T, from, to, { fade: 0.15 })
    ]));
  }
  parts.push(note(GX + CW * PER_ROW / 2, GY + ROWS * CH + 34, 'unwinding reads it down the columns', {
    anchor: 'middle', size: 12, fill: COLOR.cipher
  }));
  return g({}, parts);
}

/* the strip, unwound ------------------------------------------------------ */

const unwind = (m) => 7.5 + m * 0.5;
const SY = 470;
const SW = 44;
const SX = WIDTH / 2 - (SW * padded.length) / 2;
const stripX = (m) => SX + m * SW + SW / 2;

function strip() {
  const parts = [];
  const x1 = SX - 30;
  const x2 = SX + SW * padded.length + 30;
  // leather with ragged ends
  const wobble = (x, top) => {
    const pts = [];
    for (let k = 0; k <= 6; k++) pts.push(`${x + (k % 2 ? 6 : 0) * (top ? 1 : -1)},${SY - 24 + k * 8}`);
    return pts.join(' L');
  };
  parts.push(el('path', {
    d: `M${x1},${SY - 24} L${x2},${SY - 24} L${wobble(x2, true)} L${x1},${SY + 24} L${wobble(x1, false).split(' L').reverse().join(' L')} Z`,
    fill: '#e6cfa6', stroke: '#8a6a43', 'stroke-width': 1.2, filter: 'url(#lift)'
  }));
  parts.push(label(x1, SY - 36, 'the strip, unwound', { size: 10, spacing: 1.6 }));

  order.forEach(([r, c], m) => {
    const x = stripX(m);
    const t = unwind(m);
    parts.push(el('rect', {
      x: x - SW / 2 + 3, y: SY - 18, width: SW - 6, height: 36, rx: 5, fill: FACE[r], opacity: 0.9
    }));
    parts.push(g({}, [
      glyph(x, SY, grid[r][c], { size: 20, fill: COLOR.cipher }),
      animate('opacity', T, windowFrames(T, t + 0.55, T, { fade: 0.1 }))
    ]));
    // a copy flies from the grid to the strip
    const [gx, gy] = cellCenter(r, c);
    const path = `M${gx},${gy} C${gx},${gy + 120} ${x},${SY - 140} ${x},${SY}`;
    parts.push(g({ opacity: 0 }, [
      glyph(0, 0, grid[r][c], { size: 20, fill: COLOR.cipher }),
      animateMotion(T, path, t, t + 0.6),
      blink(T, t, t + 0.6, { fade: 0.05 })
    ]));
  });

  // the tell-tale rhythm of the faces
  parts.push(note(WIDTH / 2, SY + 46, `Face colors repeat every ${ROWS} letters: that rhythm is the rod’s circumference.`, {
    anchor: 'middle', size: 13
  }));
  return g({}, parts);
}

export function render() {
  const groups = example.expected.match(/.{1,5}/g).join(' ');
  const body = [
    rod(),
    note((ROD.x1 + ROD.x2) / 2, ROD.cy + ROD.r + 30, `${ROWS} faces around, ${PER_ROW} letters along each face`, {
      anchor: 'middle', size: 13
    }),
    flat(),
    strip()
  ].join('\n');

  const footer = [
    codeLine(48, H - 30, [
      ['encrypt(', COLOR.muted], [`"${PLAIN}"`, COLOR.plain, 700], [', ', COLOR.muted], [String(PER_ROW), COLOR.key, 700],
      [')  →  ', COLOR.muted], [`"${groups}"`, COLOR.cipher, 700]
    ]),
    note(WIDTH - 48, H - 30, 'The key is the rod: wrap it on one the same size to read it.', { anchor: 'end', size: 13 })
  ].join('\n');

  return page({
    height: H,
    number: 'V',
    family: 'Transposition',
    title: 'The Scytale',
    subtitle: 'Wind a strip around a rod, write along it, unwind it: same letters, new order.',
    description: `${PLAIN} is written along a rod in rows of ${PER_ROW}, one row per face, padded with X. Unwinding the strip reads the letters column by column: ${example.expected}.`,
    body,
    footer
  });
}
