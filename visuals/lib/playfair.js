/**
 * Playfair: build a 5×5 square from the key, cut the message into pairs and
 * move every pair according to one of three rules.
 */
import {
  COLOR, FONT, WIDTH,
  animate, animateTransform, blink, codeLine, draw, el, g, glyph,
  label, note, page, text, tile, windowFrames
} from './svg.js';

const PLAIN = 'HELLO';
const KEY = 'PLAYFAIR';
const ALPHA25 = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';

// the same steps as src/Playfair.js, kept visible for the drawing
const keyLetters = [...KEY].filter((ch, i) => KEY.indexOf(ch) === i);
const square = [...new Set([...keyLetters, ...ALPHA25])];
const at = (r, c) => square[r * 5 + c];
const pos = (ch) => [Math.floor(square.indexOf(ch) / 5), square.indexOf(ch) % 5];

function pairs(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    if (i === text.length - 1) { out.push([text[i], 'X', 'pad']); break; }
    if (text[i] === text[i + 1]) { out.push([text[i], 'X', 'split']); i += 1; continue; }
    out.push([text[i], text[i + 1]]);
    i += 2;
  }
  return out;
}

function rule(a, b) {
  const [ar, ac] = pos(a);
  const [br, bc] = pos(b);
  if (ar === br) return { kind: 'row', out: [at(ar, (ac + 1) % 5), at(br, (bc + 1) % 5)] };
  if (ac === bc) return { kind: 'column', out: [at((ar + 1) % 5, ac), at((br + 1) % 5, bc)] };
  return { kind: 'rectangle', out: [at(ar, bc), at(br, ac)] };
}

const PAIRS = pairs(PLAIN);
const STEPS = PAIRS.map(([a, b, why]) => ({ a, b, why, ...rule(a, b) }));

export const example = {
  cipher: 'Playfair',
  args: [PLAIN.toLowerCase(), KEY.toLowerCase()],
  expected: STEPS.map(({ out }) => out.join('')).join('')
};

const H = 730;
const T = 17;
const PANEL = (i) => 5.2 + 3.4 * i;

/* 1 · the square ---------------------------------------------------------- */

function buildSquare() {
  const parts = [];
  const x0 = 48;
  parts.push(step(x0, 162, '1', 'Build the square from the key'));

  // key letters, duplicates struck out
  const kx = (i) => x0 + 14 + i * 29;
  [...KEY].forEach((ch, i) => {
    const dup = KEY.indexOf(ch) !== i;
    parts.push(tile(kx(i), 198, ch, {
      size: 25, color: dup ? COLOR.muted : COLOR.key, fill: dup ? COLOR.paper : COLOR.card, font: 14, radius: 4
    }));
    if (dup) {
      parts.push(el('line', {
        x1: kx(i) - 11, y1: 209, x2: kx(i) + 11, y2: 187, stroke: COLOR.plain, 'stroke-width': 2, 'stroke-linecap': 'round'
      }));
    }
  });
  parts.push(note(x0, 234, 'repeated letters are dropped…', { size: 12 }));

  // the rest of the alphabet
  const rest = square.slice(keyLetters.length);
  parts.push(text(x0, 262, '', { 'font-family': FONT.mono, 'font-size': 13, fill: COLOR.muted, 'letter-spacing': 1.5 },
    `${el('tspan', { fill: COLOR.ink }, '+ ')}${rest.join('')}`));
  parts.push(note(x0, 284, '…then the rest of the alphabet follows.', { size: 12 }));
  parts.push(note(x0, 302, 'There is no J: I stands in for it.', { size: 12 }));

  // the square itself
  const cell = 31;
  const gx = 372;
  const gy = 150;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const n = r * 5 + c;
      const ch = at(r, c);
      const fromKey = n < keyLetters.length;
      parts.push(el('rect', {
        x: gx + c * cell, y: gy + r * cell, width: cell, height: cell,
        fill: fromKey ? COLOR.keySoft : COLOR.card, stroke: COLOR.rule
      }));
      parts.push(g({}, [
        glyph(gx + c * cell + cell / 2, gy + r * cell + cell / 2, ch, {
          size: 15, fill: fromKey ? COLOR.key : COLOR.ink
        }),
        animate('opacity', T, [[0, 0], [0.3 + n * 0.07, 0], [0.5 + n * 0.07, 1], [T - 0.4, 1], [T, 0]]),
        animateTransform('translate', T, [[0, '0 -6'], [0.3 + n * 0.07, '0 -6'], [0.5 + n * 0.07, '0 0'], [T, '0 0']])
      ]));
    }
  }
  parts.push(el('rect', {
    x: gx, y: gy, width: cell * 5, height: cell * 5, fill: 'none', stroke: COLOR.ink, 'stroke-width': 1.4
  }));
  return g({}, parts);
}

/* 2 · the pairs ----------------------------------------------------------- */

function buildPairs() {
  const parts = [];
  const x0 = 564;
  parts.push(step(x0, 162, '2', 'Cut the message into pairs'));

  const lx = (i) => x0 + 24 + i * 44;
  [...PLAIN].forEach((ch, i) => {
    parts.push(tile(lx(i), 204, ch, { size: 34, color: COLOR.plain }));
  });
  parts.push(note(lx(4) + 30, 209, 'LL can’t pair up', { size: 12 }));

  // pairs, with the inserted X
  let x = x0 + 6;
  const py = 274;
  PAIRS.forEach(([a, b, why], i) => {
    const w = 78;
    const start = 2.2 + i * 0.6;
    const cardParts = [
      el('rect', { x, y: py - 25, width: w, height: 50, rx: 10, fill: COLOR.paperDeep, stroke: COLOR.rule }),
      tile(x + 21, py, a, { size: 34, color: COLOR.plain }),
      why
        ? tile(x + 57, py, b, { size: 34, color: COLOR.green, fill: COLOR.greenSoft, stroke: COLOR.green })
        : tile(x + 57, py, b, { size: 34, color: COLOR.plain }),
      animate('opacity', T, windowFrames(T, start, T, { fade: 0.3 })),
      animateTransform('translate', T, [[0, '0 -14'], [start - 0.3, '0 -14'], [start, '0 0'], [T, '0 0']], { ease: true })
    ];
    parts.push(g({}, cardParts));
    if (why === 'split') {
      parts.push(g({ opacity: 1 }, [
        el('path', {
          d: `M${x + 57},${py + 38} L${x + 57},${py + 26}`, stroke: COLOR.green, 'stroke-width': 1.4,
          'marker-end': 'url(#arrow-green)'
        }),
        note(x + 57, py + 52, 'slip in an X', { anchor: 'middle', size: 12, fill: COLOR.green }),
        animate('opacity', T, windowFrames(T, start + 0.2, T, { fade: 0.3 }))
      ]));
    }
    x += w + 16;
  });
  parts.push(note(x0, 352, 'A lone letter at the end gets an X too.', { size: 12 }));
  return g({}, parts);
}

/* 3 · the rules ----------------------------------------------------------- */

const TITLES = {
  row: ['Same row', 'each letter steps one to the right'],
  rectangle: ['Rectangle', 'each takes the far corner in its own row'],
  column: ['Same column', 'each letter steps one down']
};

function panel(stepInfo, i) {
  const { a, b, kind, out } = stepInfo;
  const s = PANEL(i);
  const cell = 28;
  const cx = 186 + i * 294;
  const gx = cx - cell * 2.5;
  const gy = 456;
  const center = ([r, c]) => [gx + c * cell + cell / 2, gy + r * cell + cell / 2];
  const parts = [];

  // panel card
  parts.push(el('rect', {
    x: cx - 134, y: gy - 66, width: 268, height: 262, rx: 12,
    fill: COLOR.card, stroke: COLOR.rule, 'stroke-width': 1.2
  }));
  // active glow
  parts.push(el('rect', {
    x: cx - 134, y: gy - 66, width: 268, height: 262, rx: 12,
    fill: 'none', stroke: COLOR.ink, 'stroke-width': 2, opacity: 0
  }, blink(T, s, s + 3.2)));

  parts.push(text(cx, gy - 40, TITLES[kind][0], {
    'font-family': FONT.serif, 'font-size': 18, 'text-anchor': 'middle', fill: COLOR.ink
  }));
  parts.push(note(cx, gy - 20, TITLES[kind][1], { anchor: 'middle', size: 12 }));

  const inA = pos(a);
  const inB = pos(b);
  const outA = pos(out[0]);
  const outB = pos(out[1]);
  const role = (r, c) => {
    const ch = at(r, c);
    if (ch === a || ch === b) return 'in';
    if (ch === out[0] || ch === out[1]) return 'out';
    return '';
  };

  // the rectangle, for the rectangle rule
  if (kind === 'rectangle') {
    const [x1, y1] = center(inA);
    const [x2, y2] = center(inB);
    parts.push(el('rect', {
      x: Math.min(x1, x2) - cell / 2 + 3, y: Math.min(y1, y2) - cell / 2 + 3,
      width: Math.abs(x2 - x1) + cell - 6, height: Math.abs(y2 - y1) + cell - 6, rx: 6,
      fill: COLOR.keySoft, 'fill-opacity': 0.6, stroke: COLOR.key, 'stroke-width': 1.5, 'stroke-dasharray': '5 4'
    }, animate('opacity', T, [[0, 1], [s + 0.3, 0.15], [s + 0.8, 1], [T, 1]])));
  }

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const kindOf = role(r, c);
      const [x, y] = center([r, c]);
      if (kindOf === 'in') {
        parts.push(el('rect', {
          x: x - cell / 2 + 2, y: y - cell / 2 + 2, width: cell - 4, height: cell - 4, rx: 5,
          fill: COLOR.plainSoft, stroke: COLOR.plain, 'stroke-width': 1.5
        }));
      }
      if (kindOf === 'out') {
        parts.push(el('rect', {
          x: x - cell / 2 + 2, y: y - cell / 2 + 2, width: cell - 4, height: cell - 4, rx: 5,
          fill: COLOR.cipherSoft, stroke: COLOR.cipher, 'stroke-width': 1.5
        }, animate('opacity', T, [[0, 1], [s, 1], [s + 0.05, 0], [s + 1.4, 0], [s + 1.7, 1], [T, 1]])));
      }
      parts.push(glyph(x, y, at(r, c), {
        size: 13,
        weight: kindOf ? 700 : 500,
        fill: kindOf === 'in' ? COLOR.plain : kindOf === 'out' ? COLOR.cipher : '#a39478'
      }));
    }
  }
  parts.push(el('rect', {
    x: gx, y: gy, width: cell * 5, height: cell * 5, fill: 'none', stroke: COLOR.rule, 'stroke-width': 1.2
  }));

  // movement arrows: little arcs hugging the outside of the cells
  const rows = [inA[0], inB[0]];
  const edge = ([r, c], side) => {
    const [x, y] = center([r, c]);
    const o = cell / 2 - 1;
    return {
      top: [x, y - o], bottom: [x, y + o], left: [x - o, y], right: [x + o, y]
    }[side];
  };
  const arc = (from, to, side, bulge, delay) => {
    const [x1, y1] = edge(from, side);
    const [x2, y2] = edge(to, side);
    const out = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] }[side];
    const cxp = (x1 + x2) / 2 + out[0] * bulge;
    const cyp = (y1 + y2) / 2 + out[1] * bulge;
    const d = `M${x1},${y1} Q${cxp},${cyp} ${x2},${y2}`;
    const L = Math.ceil(Math.hypot(x2 - x1, y2 - y1) + bulge * 1.4);
    return el('path', {
      d, fill: 'none', stroke: COLOR.ink, 'stroke-width': 1.8, 'stroke-linecap': 'round',
      'stroke-dasharray': L, 'stroke-dashoffset': 0, 'marker-end': 'url(#arrow-ink)'
    }, [
      animate('stroke-dashoffset', T, [[0, 0], [s, 0], [s + 0.05, L], [s + 0.5 + delay, L], [s + 1.3 + delay, 0], [T, 0]]),
      animate('opacity', T, [[0, 1], [s, 1], [s + 0.05, 0], [s + 0.5 + delay, 0], [s + 0.55 + delay, 1], [T, 1]])
    ]);
  };
  const wraps = (from, to) => Math.abs(from[0] - to[0]) > 1 || Math.abs(from[1] - to[1]) > 1;
  [[inA, outA], [inB, outB]].forEach(([from, to], k) => {
    if (wraps(from, to) && kind !== 'rectangle') {
      // stepping over the edge: go around
      const [x1, y1] = center(from);
      const [x2, y2] = center(to);
      const d = kind === 'row'
        ? `M${x1 + cell * 0.4},${y1} L${gx + cell * 5 + 8},${y1} M${gx - 8},${y2} L${x2 - cell * 0.4},${y2}`
        : `M${x1},${y1 + cell * 0.4} L${x1},${gy + cell * 5 + 8} M${x2},${gy - 8} L${x2},${y2 - cell * 0.4}`;
      parts.push(el('path', {
        d, fill: 'none', stroke: COLOR.ink, 'stroke-width': 1.8, 'stroke-dasharray': '4 3', 'marker-end': 'url(#arrow-ink)'
      }, animate('opacity', T, [[0, 1], [s, 1], [s + 0.05, 0], [s + 0.5 + k * 0.3, 0], [s + 0.8 + k * 0.3, 1], [T, 1]])));
    } else if (kind === 'row') {
      parts.push(arc(from, to, 'top', 12, k * 0.3));
    } else if (kind === 'column') {
      parts.push(arc(from, to, 'right', 12, k * 0.3));
    } else {
      const side = from[0] === Math.min(...rows) ? 'top' : 'bottom';
      parts.push(arc(from, to, side, 16, k * 0.3));
    }
  });

  // pair → result
  const ry = gy + cell * 5 + 30;
  const pairTiles = (x, chars, color, fill) => chars.map((ch, k) =>
    tile(x + k * 30, ry, ch, { size: 28, color, fill, font: 15, radius: 5 })).join('');
  parts.push(pairTiles(cx - 75, [a, b], COLOR.plain));
  parts.push(text(cx, ry + 6, '→', {
    'font-family': FONT.serif, 'font-size': 20, 'text-anchor': 'middle', fill: COLOR.muted
  }));
  parts.push(g({}, [
    pairTiles(cx + 45, out, COLOR.cipher, COLOR.cipherSoft),
    animate('opacity', T, [[0, 1], [s, 1], [s + 0.05, 0], [s + 1.6, 0], [s + 1.9, 1], [T, 1]])
  ]));
  return g({}, parts);
}

function step(x, y, n, title) {
  return g({}, [
    el('circle', { cx: x + 10, cy: y - 5, r: 10, fill: COLOR.ink }),
    text(x + 10, y - 0.5, n, {
      'font-family': FONT.serif, 'font-size': 13, 'text-anchor': 'middle', fill: COLOR.paper, 'font-weight': 700
    }),
    text(x + 28, y, title, { 'font-family': FONT.serif, 'font-size': 17, fill: COLOR.ink })
  ]);
}

export function render() {
  const body = [
    buildSquare(),
    buildPairs(),
    step(48, 378, '3', 'Move each pair by one of three rules'),
    ...STEPS.map(panel)
  ].join('\n');

  const footer = [
    codeLine(48, H - 30, [
      ['encrypt(', COLOR.muted], ['"HELLO"', COLOR.plain, 700], [', ', COLOR.muted], [`"${KEY}"`, COLOR.key, 700],
      [')  →  ', COLOR.muted], [`"${example.expected}"`, COLOR.cipher, 700]
    ]),
    note(WIDTH - 48, H - 30, 'Decrypting walks the same rules backwards: left, up, and the same swap.', { anchor: 'end', size: 13 })
  ].join('\n');

  return page({
    height: H,
    number: 'IV',
    family: 'Digraph substitution',
    title: 'The Playfair Cipher',
    subtitle: 'Letters travel in pairs across a 5 × 5 square built from the key.',
    description: `The key ${KEY} fills a 5 by 5 square. ${PLAIN} is cut into the pairs ${PAIRS.map((p) => p[0] + p[1]).join(', ')}; each pair moves by the same-row, rectangle or same-column rule, giving ${example.expected}.`,
    body,
    footer
  });
}
