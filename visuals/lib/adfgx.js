/**
 * ADFGX: every letter becomes two coordinates in a keyed Polybius square,
 * then the stream of coordinates is shuffled by a keyed columnar
 * transposition.
 */
import {
  COLOR, FONT, WIDTH,
  animate, animateMotion, animateTransform, blink, codeLine, el, g, glyph,
  label, note, page, text, tile, windowFrames
} from './svg.js';

const PLAIN = 'ATTACKATDAWN';
const SQUARE_KEY = 'PLAYFAIR';
const COLUMN_KEY = 'GERMANY';
const SYMBOLS = 'ADFGX';
const ALPHA25 = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';

// the same steps as src/ADFGX.js
const square = [...new Set([...SQUARE_KEY.replace(/J/g, 'I'), ...ALPHA25])];
const keyCount = new Set(SQUARE_KEY).size;
const coords = (ch) => {
  const n = square.indexOf(ch === 'J' ? 'I' : ch);
  return [Math.floor(n / 5), n % 5];
};
const fractions = [...PLAIN].map((ch) => coords(ch).map((n) => SYMBOLS[n]).join(''));
const stream = fractions.join('');

const COLS = COLUMN_KEY.length;
const ROWS = Math.ceil(stream.length / COLS);
const cellOf = (n) => [Math.floor(n / COLS), n % COLS];
const sorted = [...COLUMN_KEY].map((ch, i) => ({ ch, i })).sort((a, b) => a.ch.localeCompare(b.ch));
const rank = [];
sorted.forEach(({ i }, k) => { rank[i] = k; });
const columnOf = (c) => [...stream].filter((_, n) => n % COLS === c);
const readOrder = sorted.flatMap(({ i }) => columnOf(i).map((_, r) => r * COLS + i));

export const example = {
  cipher: 'ADFGX',
  args: [PLAIN.toLowerCase(), SQUARE_KEY.toLowerCase(), COLUMN_KEY.toLowerCase()],
  expected: readOrder.map((n) => stream[n]).join('')
};

const H = 750;
const T = 27;

// timeline
const fracAt = (i) => 1.0 + 0.62 * i;
const dropAt = (n) => 9.0 + 0.075 * n;
const RANKS = 11.4;
const SORT = [12.9, 14.3];
const readAt = (m) => 14.8 + 0.22 * m;

/* ① Polybius square --------------------------------------------------- */

const SQ = { x: 92, y: 232, cell: 32 };
const sqCenter = (r, c) => [SQ.x + c * SQ.cell + SQ.cell / 2, SQ.y + r * SQ.cell + SQ.cell / 2];

function polybius() {
  const parts = [step(48, 166, '1', 'Letters become coordinates')];
  parts.push(note(76, 186, `Polybius square, keyed with ${SQUARE_KEY}`, { size: 12 }));

  // highlights go under the letters
  [...PLAIN].forEach((ch, i) => {
    const s = fracAt(i);
    const [r, c] = coords(ch);
    const [x, y] = sqCenter(r, c);
    parts.push(el('rect', {
      x: SQ.x - 28, y: y - SQ.cell / 2 + 2, width: SQ.cell * 5 + 28, height: SQ.cell - 4, rx: 5,
      fill: COLOR.plum, 'fill-opacity': 0.13, opacity: 0
    }, blink(T, s, s + 0.6, { fade: 0.1 })));
    parts.push(el('rect', {
      x: x - SQ.cell / 2 + 2, y: SQ.y - 28, width: SQ.cell - 4, height: SQ.cell * 5 + 28, rx: 5,
      fill: COLOR.plum, 'fill-opacity': 0.13, opacity: 0
    }, blink(T, s, s + 0.6, { fade: 0.1 })));
    parts.push(el('rect', {
      x: x - SQ.cell / 2 + 1, y: y - SQ.cell / 2 + 1, width: SQ.cell - 2, height: SQ.cell - 2, rx: 6,
      fill: COLOR.plainSoft, stroke: COLOR.plain, 'stroke-width': 1.6, opacity: 0
    }, blink(T, s, s + 0.6, { fade: 0.1 })));
  });

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const n = r * 5 + c;
      const [x, y] = sqCenter(r, c);
      parts.push(el('rect', {
        x: x - SQ.cell / 2, y: y - SQ.cell / 2, width: SQ.cell, height: SQ.cell,
        fill: n < keyCount ? COLOR.keySoft : 'none', 'fill-opacity': 0.75, stroke: COLOR.rule
      }));
      parts.push(glyph(x, y, square[n], { size: 15, weight: 600, fill: n < keyCount ? COLOR.key : COLOR.ink }));
    }
  }
  parts.push(el('rect', {
    x: SQ.x, y: SQ.y, width: SQ.cell * 5, height: SQ.cell * 5, fill: 'none', stroke: COLOR.ink, 'stroke-width': 1.3
  }));
  for (let k = 0; k < 5; k++) {
    const [x, y] = sqCenter(k, k);
    parts.push(glyph(x, SQ.y - 14, SYMBOLS[k], { size: 15, fill: COLOR.plum }));
    parts.push(glyph(SQ.x - 15, y, SYMBOLS[k], { size: 15, fill: COLOR.plum }));
  }
  parts.push(note(SQ.x + SQ.cell * 2.5, SQ.y + SQ.cell * 5 + 24, 'row first, then column', { anchor: 'middle', size: 12 }));
  return g({}, parts);
}

const FX = (i) => 352 + i * 47;
const LETTER_Y = 250;
const PAIR_Y = 306;
const pairX = (i, k) => FX(i) + (k ? 11 : -11);

function fractionation() {
  const parts = [];
  parts.push(label(FX(0) - 18, LETTER_Y - 30, 'plaintext', { fill: COLOR.plain, size: 10, spacing: 1.6 }));
  parts.push(label(FX(0) - 18, PAIR_Y + 34, 'coordinates', { fill: COLOR.plum, size: 10, spacing: 1.6 }));
  parts.push(note(FX(0) - 18, PAIR_Y + 64, `${PLAIN.length} letters became ${stream.length} symbols, spelled with only five: A D F G X.`, { size: 12 }));
  parts.push(note(FX(0) - 18, PAIR_Y + 82, 'Each letter is now two halves; the next step pulls the halves apart.', { size: 12 }));
  [...PLAIN].forEach((ch, i) => {
    const s = fracAt(i);
    parts.push(tile(FX(i), LETTER_Y, ch, { size: 34, color: COLOR.plain, extra: el('rect', {
      x: FX(i) - 22, y: LETTER_Y - 22, width: 44, height: 44, rx: 9, fill: 'none', stroke: COLOR.plum, 'stroke-width': 2.2, opacity: 0
    }, blink(T, s, s + 0.6, { fade: 0.1 })) }));
    parts.push(el('path', {
      d: `M${FX(i)},${LETTER_Y + 20} L${FX(i)},${PAIR_Y - 17}`, stroke: COLOR.rule, 'stroke-width': 1.2,
      'marker-end': 'url(#arrow-muted)'
    }));
    [...fractions[i]].forEach((sym, k) => {
      parts.push(g({}, [
        tile(pairX(i, k), PAIR_Y, sym, { size: 21, color: COLOR.plum, fill: COLOR.plumSoft, font: 12, radius: 4 }),
        animate('opacity', T, windowFrames(T, s + 0.25 + k * 0.12, T, { fade: 0.12 })),
        animateTransform('translate', T, [[0, '0 -8'], [s + 0.13 + k * 0.12, '0 -8'], [s + 0.3 + k * 0.12, '0 0'], [T, '0 0']])
      ]));
    });
  });
  return g({}, parts);
}

/* ② columnar transposition ------------------------------------------ */

const TG = { x: 92, y: 568, cw: 36, ch: 27 };
const colX = (slot) => TG.x + slot * TG.cw + TG.cw / 2;
const rowY = (r) => TG.y + r * TG.ch + TG.ch / 2;

function transposition() {
  const parts = [step(48, 452, '2', 'Shuffle the columns')];
  parts.push(note(76, 474, `fill the rows under the key ${COLUMN_KEY}`, { size: 12 }));

  // like shuffling cards: movers to the right lift up, movers to the left dip down
  const slide = (c) => {
    const dx = (rank[c] - c) * TG.cw;
    const lift = dx > 0 ? -10 : 7;
    const mid = (SORT[0] + SORT[1]) / 2;
    return animateTransform('translate', T, [
      [0, '0 0'], [SORT[0], '0 0'], [mid, `${dx / 2} ${lift}`], [SORT[1], `${dx} 0`], [T - 0.6, `${dx} 0`], [T, '0 0']
    ], { ease: true });
  };

  for (let c = 0; c < COLS; c++) {
    const x = colX(c);
    const col = [];
    col.push(el('rect', {
      x: x - TG.cw / 2 + 2, y: TG.y - 46, width: TG.cw - 4, height: ROWS * TG.ch + 50, rx: 7,
      fill: COLOR.card, stroke: COLOR.rule, 'stroke-width': 1.2, filter: 'url(#lift)'
    }));
    // reading highlight
    const first = readOrder.indexOf(c);
    const n = columnOf(c).length;
    col.push(el('rect', {
      x: x - TG.cw / 2 + 2, y: TG.y - 46, width: TG.cw - 4, height: ROWS * TG.ch + 50, rx: 7,
      fill: COLOR.cipher, 'fill-opacity': 0.1, stroke: COLOR.cipher, 'stroke-width': 2, opacity: 0
    }, blink(T, readAt(first) - 0.1, readAt(first + n - 1) + 0.3, { fade: 0.12 })));
    col.push(glyph(x, TG.y - 26, COLUMN_KEY[c], { size: 18, fill: COLOR.key }));
    // alphabetical rank
    col.push(g({}, [
      el('circle', { cx: x, cy: TG.y - 62, r: 10, fill: COLOR.key }),
      text(x, TG.y - 58, String(rank[c] + 1), {
        'font-family': FONT.serif, 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: COLOR.card
      }),
      animate('opacity', T, windowFrames(T, RANKS + rank[c] * 0.15, T, { fade: 0.15 }))
    ]));
    col.push(el('line', {
      x1: x - TG.cw / 2 + 6, y1: TG.y - 8, x2: x + TG.cw / 2 - 6, y2: TG.y - 8, stroke: COLOR.key, 'stroke-width': 1.2
    }));
    for (let r = 0; r * COLS + c < stream.length; r++) {
      const idx = r * COLS + c;
      col.push(g({}, [
        glyph(x, rowY(r), stream[idx], { size: 15, fill: COLOR.plum }),
        animate('opacity', T, windowFrames(T, dropAt(idx) + 0.5, T, { fade: 0.08 }))
      ]));
    }
    col.push(slide(c));
    parts.push(g({}, col));
  }

  // coordinates fall into the grid, row by row
  for (let idx = 0; idx < stream.length; idx++) {
    const i = Math.floor(idx / 2);
    const [r, c] = cellOf(idx);
    const from = [pairX(i, idx % 2), PAIR_Y];
    const to = [colX(c), rowY(r)];
    const path = `M${from[0]},${from[1]} C${from[0]},${from[1] + 90} ${to[0]},${to[1] - 140} ${to[0]},${to[1]}`;
    parts.push(g({ opacity: 0 }, [
      glyph(0, 0, stream[idx], { size: 15, fill: COLOR.plum }),
      animateMotion(T, path, dropAt(idx), dropAt(idx) + 0.5),
      blink(T, dropAt(idx), dropAt(idx) + 0.5, { fade: 0.05 })
    ]));
  }
  return g({}, parts);
}

/* ③ read the columns ------------------------------------------------- */

const OUT = { x: 420, y: 588, w: 18, gap: 8 };
const outX = (m) => {
  let col = 0;
  let seen = 0;
  for (const { i } of sorted) {
    const n = columnOf(i).length;
    if (m < seen + n) break;
    seen += n;
    col += 1;
  }
  return OUT.x + m * OUT.w + col * OUT.gap + OUT.w / 2;
};

function output() {
  const parts = [step(OUT.x - 28, 452, '3', 'Read them off, column by column')];
  parts.push(note(OUT.x, 474, 'in the alphabetical order of the key letters', { size: 12 }));

  let m = 0;
  for (const { ch, i } of sorted) {
    const n = columnOf(i).length;
    const x1 = outX(m) - OUT.w / 2;
    const x2 = outX(m + n - 1) + OUT.w / 2;
    parts.push(el('path', {
      d: `M${x1 + 1},${OUT.y + 18} L${x1 + 1},${OUT.y + 23} L${x2 - 1},${OUT.y + 23} L${x2 - 1},${OUT.y + 18}`,
      fill: 'none', stroke: COLOR.key, 'stroke-width': 1.2
    }));
    parts.push(glyph((x1 + x2) / 2, OUT.y + 36, ch, { size: 12, fill: COLOR.key }));
    m += n;
  }

  readOrder.forEach((idx, k) => {
    const x = outX(k);
    const t = readAt(k);
    parts.push(el('rect', {
      x: x - OUT.w / 2 + 1, y: OUT.y - 14, width: OUT.w - 2, height: 28, rx: 3,
      fill: 'none', stroke: COLOR.rule, 'stroke-dasharray': '2 3'
    }));
    parts.push(g({}, [
      tile(x, OUT.y, stream[idx], { size: OUT.w - 2, color: COLOR.cipher, fill: COLOR.cipherSoft, font: 12, radius: 3 }),
      animate('opacity', T, windowFrames(T, t + 0.4, T, { fade: 0.08 }))
    ]));
    const [r, c] = cellOf(idx);
    const from = [colX(rank[c]), rowY(r)];
    const path = `M${from[0]},${from[1]} C${from[0] + 80},${from[1] - 90} ${x - 40},${OUT.y - 120} ${x},${OUT.y}`;
    parts.push(g({ opacity: 0 }, [
      glyph(0, 0, stream[idx], { size: 14, fill: COLOR.cipher }),
      animateMotion(T, path, t, t + 0.45),
      blink(T, t, t + 0.45, { fade: 0.05 })
    ]));
  });

  // the whole stream, grouped in fives like a telegram
  const groups = example.expected.match(/.{1,5}/g).join('  ');
  parts.push(g({}, [
    label(OUT.x, OUT.y + 70, 'sent over the wire', { size: 10, spacing: 1.6 }),
    text(OUT.x, OUT.y + 94, groups, {
      'font-family': FONT.mono, 'font-size': 19, 'font-weight': 700, fill: COLOR.cipher, 'letter-spacing': 1.5
    }),
    animate('opacity', T, windowFrames(T, readAt(readOrder.length) + 0.4, T, { fade: 0.4 }))
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
  const body = [polybius(), fractionation(), transposition(), output()].join('\n');
  const footer = [
    codeLine(48, H - 30, [
      ['encrypt(', COLOR.muted], [`"${PLAIN}"`, COLOR.plain, 700], [', ', COLOR.muted],
      [`"${SQUARE_KEY}"`, COLOR.key, 700], [', ', COLOR.muted], [`"${COLUMN_KEY}"`, COLOR.key, 700],
      [')', COLOR.muted]
    ], { size: 13 }),
    note(WIDTH - 48, H - 30, 'A, D, F, G, X: picked because they are hard to confuse in Morse.', { anchor: 'end', size: 13 })
  ].join('\n');

  return page({
    height: H,
    number: 'VI',
    family: 'Fractionation + transposition',
    title: 'The ADFGX Cipher',
    subtitle: 'Split every letter into two coordinates, then scramble the coordinates by column.',
    description: `${PLAIN} is looked up in a 5 by 5 square keyed with ${SQUARE_KEY}, turning each letter into two of the symbols A, D, F, G, X. The ${stream.length} symbols are written in rows under ${COLUMN_KEY}, the columns are sorted alphabetically by key letter and read top to bottom, giving ${example.expected}.`,
    body,
    footer
  });
}
