/**
 * Atbash: the alphabet folded onto itself. Nested arches pair every letter
 * with its mirror image (A↔Z, B↔Y, …, M↔N).
 */
import {
  ALPHABET, COLOR, FONT, WIDTH,
  animate, animateMotion, animateTransform, blink, codeLine, draw, el, g, glyph,
  label, note, page, text, tile, windowFrames
} from './svg.js';

const PLAIN = 'HELLO';
const mirror = (ch) => ALPHABET[25 - ALPHABET.indexOf(ch)];

export const example = {
  cipher: 'Atbash',
  args: [PLAIN],
  expected: [...PLAIN].map(mirror).join('')
};

const T = 15;
const H = 590;
const slot = (i) => 1.6 + 2.2 * i;

const CELL = 28;
const LEFT = 166;
const ROW1 = 334;
const ROW2 = ROW1 + CELL + 4;
const BASE = ROW1 - CELL / 2 - 3;
const cx = (i) => LEFT + CELL * i + CELL / 2;

// muted rainbow, one hue per pair
const hue = (i) => `hsl(${Math.round(8 + i * 22)}, 48%, ${i > 5 && i < 9 ? 38 : 44}%)`;

function arch(i) {
  const x1 = cx(i);
  const x2 = cx(25 - i);
  const span = x2 - x1;
  const h = 24 + (span - CELL) / (25 * CELL - CELL) * 166;
  return { x1, x2, h, d: `M${x1},${BASE} C${x1},${BASE - h} ${x2},${BASE - h} ${x2},${BASE}` };
}

// arc length of the cubic, sampled
function length({ x1, x2, h }) {
  let len = 0;
  let px = x1;
  let py = BASE;
  for (let k = 1; k <= 64; k++) {
    const t = k / 64;
    const u = 1 - t;
    const x = u * u * u * x1 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x2;
    const y = u * u * u * BASE + 3 * u * u * t * (BASE - h) + 3 * u * t * t * (BASE - h) + t * t * t * BASE;
    len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return Math.ceil(len);
}

function arches() {
  const parts = [];
  for (let i = 12; i >= 0; i--) {
    const a = arch(i);
    const len = length(a);
    parts.push(el('path', {
      d: a.d, fill: 'none', stroke: hue(i), 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.55,
      'stroke-dasharray': len, 'stroke-dashoffset': 0
    }, animate('stroke-dashoffset', T, [[0, len], [0.1 + (12 - i) * 0.08, len], [0.6 + (12 - i) * 0.08, 0], [T, 0]])));
  }

  // the mirror
  const mx = LEFT + CELL * 13;
  parts.push(el('line', {
    x1: mx, y1: BASE - 154, x2: mx, y2: ROW2 + 26, stroke: COLOR.ink, 'stroke-width': 1.2,
    'stroke-dasharray': '2 5', 'stroke-linecap': 'round', opacity: 0.6
  }));
  parts.push(g({ transform: `translate(${mx} ${BASE - 172})` }, [
    el('ellipse', { cx: 0, cy: 0, rx: 9, ry: 12, fill: COLOR.cipherSoft, stroke: COLOR.ink, 'stroke-width': 1.3 }),
    el('path', { d: 'M-4,-5 L2,-9 M-5,0 L4,-6', stroke: COLOR.card, 'stroke-width': 1.6, 'stroke-linecap': 'round' }),
    el('line', { x1: 0, y1: 12, x2: 0, y2: 18, stroke: COLOR.ink, 'stroke-width': 1.3 })
  ]));
  parts.push(label(mx + 18, BASE - 168, 'the mirror', { size: 9, spacing: 1.6 }));
  return g({}, parts);
}

function rows() {
  const parts = [];
  parts.push(label(48, ROW1 + 4, 'plaintext', { fill: COLOR.plain, size: 10, spacing: 1.6 }));
  parts.push(label(48, ROW2 + 4, 'ciphertext', { fill: COLOR.cipher, size: 10, spacing: 1.6 }));
  for (let i = 0; i < 26; i++) {
    parts.push(el('rect', {
      x: LEFT + CELL * i, y: ROW1 - CELL / 2, width: CELL, height: CELL,
      fill: COLOR.card, stroke: COLOR.rule
    }));
    parts.push(el('rect', {
      x: LEFT + CELL * i, y: ROW2 - CELL / 2, width: CELL, height: CELL,
      fill: '#eef3f6', stroke: '#b7c9d8'
    }));
    // a tiny tick in each pair's color under the top row
    parts.push(el('rect', {
      x: LEFT + CELL * i + 3, y: ROW1 + CELL / 2 - 3, width: CELL - 6, height: 2,
      fill: hue(Math.min(i, 25 - i)), opacity: 0.8
    }));
  }
  return g({}, parts);
}

function rowGlyphs() {
  const parts = [];
  for (let i = 0; i < 26; i++) {
    parts.push(glyph(cx(i), ROW1, ALPHABET[i], { size: 14, fill: COLOR.plain }));
    parts.push(glyph(cx(i), ROW2, ALPHABET[25 - i], { size: 14, fill: COLOR.cipher }));
  }
  return g({}, parts);
}

function steps() {
  const under = [];
  const over = [];
  [...PLAIN].forEach((ch, n) => {
    const s = slot(n);
    const p = ALPHABET.indexOf(ch);
    const c = 25 - p;
    const pair = Math.min(p, c);
    const a = arch(pair);
    const len = length(a);
    // always travel from the plaintext letter to its mirror image
    const d = p < c ? a.d : `M${a.x2},${BASE} C${a.x2},${BASE - a.h} ${a.x1},${BASE - a.h} ${a.x1},${BASE}`;

    // column highlight: the table reading (plain above, cipher below)
    under.push(el('rect', {
      x: LEFT + CELL * p - 1, y: ROW1 - CELL / 2 - 1, width: CELL + 2, height: CELL * 2 + 6, rx: 3,
      fill: COLOR.keySoft, stroke: COLOR.key, 'stroke-width': 1.5, opacity: 0
    }, blink(T, s + 0.1, s + 2.1)));
    under.push(el('rect', {
      x: LEFT + CELL * c, y: ROW1 - CELL / 2, width: CELL, height: CELL,
      fill: COLOR.cipherSoft, stroke: COLOR.cipher, 'stroke-width': 1.5, opacity: 0
    }, blink(T, s + 1.2, s + 2.1)));

    // the arch lights up and a bead runs along it
    over.push(el('path', {
      d, fill: 'none', stroke: hue(pair), 'stroke-width': 4.5, 'stroke-linecap': 'round',
      'stroke-dasharray': len, 'stroke-dashoffset': len, opacity: 0
    }, [draw(T, len, s + 0.3, s + 1.2, { hold: T }), blink(T, s + 0.3, s + 2.1, { fade: 0.05 })]));
    over.push(el('circle', { r: 6, fill: hue(pair), stroke: COLOR.card, 'stroke-width': 2, opacity: 0 }, [
      animateMotion(T, d, s + 0.3, s + 1.2),
      blink(T, s + 0.25, s + 1.35, { fade: 0.1 })
    ]));
    over.push(text((a.x1 + a.x2) / 2, BASE - a.h * 0.75 - 9, `${ch} ↔ ${ALPHABET[c]}`, {
      'font-family': FONT.mono, 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle',
      fill: hue(pair), opacity: 0, stroke: COLOR.paper, 'stroke-width': 5, 'paint-order': 'stroke'
    }, blink(T, s + 0.5, s + 2.1)));
  });
  return { under: g({}, under), over: g({}, over) };
}

function words() {
  const y = 446;
  const size = 40;
  const gap = 50;
  const plainX = (i) => 186 + i * gap;
  const cipherX = (i) => 484 + i * gap;
  const parts = [];

  [...PLAIN].forEach((ch, n) => {
    const s = slot(n);
    parts.push(tile(plainX(n), y, ch, { size, color: COLOR.plain, extra: el('rect', {
      x: plainX(n) - size / 2 - 5, y: y - size / 2 - 5, width: size + 10, height: size + 10, rx: 9,
      fill: 'none', stroke: COLOR.key, 'stroke-width': 2.5, opacity: 0
    }, blink(T, s, s + 2.1)) }));
    parts.push(el('rect', {
      x: cipherX(n) - size / 2, y: y - size / 2, width: size, height: size, rx: 6,
      fill: 'none', stroke: COLOR.rule, 'stroke-width': 1.5, 'stroke-dasharray': '4 4'
    }));
    parts.push(g({}, [
      tile(cipherX(n), y, example.expected[n], { size, color: COLOR.cipher }),
      animate('opacity', T, windowFrames(T, s + 1.4, T, { fade: 0.2 })),
      animateTransform('translate', T, [[0, '0 -8'], [s + 1.2, '0 -8'], [s + 1.5, '0 0'], [T, '0 0']])
    ]));
  });

  // mirror between the words
  const mx = (plainX(4) + cipherX(0)) / 2;
  parts.push(el('line', { x1: mx, y1: y - 26, x2: mx, y2: y + 26, stroke: COLOR.ink, 'stroke-width': 1.2, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round', opacity: 0.6 }));
  parts.push(el('path', {
    d: `M${mx - 18},${y - 6} L${mx - 8},${y} L${mx - 18},${y + 6} M${mx + 18},${y - 6} L${mx + 8},${y} L${mx + 18},${y + 6}`,
    fill: 'none', stroke: COLOR.muted, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  }));
  parts.push(label(plainX(0) - size / 2, y - 34, 'plaintext', { fill: COLOR.plain, size: 10, spacing: 1.6 }));
  parts.push(label(cipherX(0) - size / 2, y - 34, 'ciphertext', { fill: COLOR.cipher, size: 10, spacing: 1.6 }));

  // apply it again and you are back home
  const loopY = y + size / 2 + 6;
  const loop = `M${cipherX(2)},${loopY} C${cipherX(2)},${loopY + 44} ${plainX(2)},${loopY + 44} ${plainX(2)},${loopY + 4}`;
  parts.push(el('path', {
    d: loop, fill: 'none', stroke: COLOR.green, 'stroke-width': 1.6, 'stroke-dasharray': '5 4',
    'marker-end': 'url(#arrow-green)', opacity: 0.9
  }, animate('opacity', T, [[0, 0.25], [12.5, 0.25], [12.9, 1], [T - 0.4, 1], [T, 0.25]])));
  parts.push(note(mx, loopY + 15, 'encrypt again → HELLO', {
    anchor: 'middle', size: 12, fill: COLOR.green
  }));

  // side note: the name spells out the first and last letters of the Hebrew alef-bet
  const nx = 836;
  parts.push(label(nx, y - 34, 'why "Atbash"?', { size: 10, spacing: 1.6, anchor: 'middle' }));
  const hebrew = (x, ch) => text(x, y + 6, ch, {
    'font-family': FONT.serif, 'font-size': 22, 'text-anchor': 'middle', fill: COLOR.ink, direction: 'ltr'
  });
  const arrow = (x) => text(x, y + 2, '↔', {
    'font-family': FONT.serif, 'font-size': 14, 'text-anchor': 'middle', fill: COLOR.muted
  });
  // alef ↔ tav (A–T), bet ↔ shin (B–Sh)
  parts.push(hebrew(nx - 62, 'א'), arrow(nx - 43), hebrew(nx - 24, 'ת'));
  parts.push(hebrew(nx + 24, 'ב'), arrow(nx + 43), hebrew(nx + 62, 'ש'));
  parts.push(note(nx - 43, y + 28, 'A · T', { anchor: 'middle', size: 12 }));
  parts.push(note(nx + 43, y + 28, 'B · Sh', { anchor: 'middle', size: 12 }));
  parts.push(note(nx, y + 46, 'first ↔ last, second ↔ second-last', { anchor: 'middle', size: 11 }));
  return g({}, parts);
}

export function render() {
  const { under, over } = steps();
  const body = [arches(), rows(), under, rowGlyphs(), over, words()].join('\n');
  const footer = [
    codeLine(48, H - 30, [
      ['encrypt(', COLOR.muted], ['"HELLO"', COLOR.plain, 700],
      [')  →  ', COLOR.muted], [`"${example.expected}"`, COLOR.cipher, 700]
    ]),
    note(WIDTH - 48, H - 30, 'No key at all: the first letter becomes the last, the second the second-to-last.', { anchor: 'end', size: 13 })
  ].join('\n');

  return page({
    height: H,
    number: 'II',
    family: 'Substitution',
    title: 'The Atbash Cipher',
    subtitle: 'Fold the alphabet in half: every letter swaps places with its mirror image.',
    description: `Thirteen nested arches pair A with Z, B with Y, down to M with N. Each letter of ${PLAIN} travels along its arch, giving ${example.expected}; applying Atbash again returns ${PLAIN}.`,
    body,
    footer
  });
}
