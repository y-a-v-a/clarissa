/**
 * Vigenère: the key is repeated under the message, and every pair is looked
 * up in the tabula recta (plaintext picks the column, key picks the row).
 */
import {
  ALPHABET, COLOR, FONT, WIDTH,
  animate, animateTransform, blink, codeLine, el, g, glyph,
  label, note, page, text, tile, windowFrames
} from './svg.js';

const PLAIN = 'ATTACKATDAWN';
const KEY = 'LEMON';
const idx = (ch) => ALPHABET.indexOf(ch);
const keyAt = (i) => KEY[i % KEY.length];
const encode = (p, k) => ALPHABET[(idx(p) + idx(k)) % 26];

export const example = {
  cipher: 'Vigenere',
  args: [PLAIN.toLowerCase(), KEY.toLowerCase()],
  expected: [...PLAIN].map((ch, i) => encode(ch, keyAt(i))).join('')
};

const H = 640;
const T = 22;
const slot = (i) => 1.2 + 1.65 * i;
const ON = 1.5;

// the tabula recta
const CELL = 15;
const GX = 74;
const GY = 166;
const cellX = (c) => GX + c * CELL;
const cellY = (r) => GY + r * CELL;
const band = (n) => `hsl(${Math.round(n * 360 / 26)}, 46%, 89%)`;

function table() {
  const parts = [];
  for (let r = 0; r < 26; r++) {
    for (let c = 0; c < 26; c++) {
      parts.push(el('rect', { x: cellX(c), y: cellY(r), width: CELL, height: CELL, fill: band((r + c) % 26) }));
    }
  }
  parts.push(el('rect', {
    x: GX, y: GY, width: CELL * 26, height: CELL * 26, fill: 'none', stroke: COLOR.ink, 'stroke-width': 1, opacity: 0.5
  }));
  return g({}, parts);
}

function tableGlyphs() {
  const xs = ALPHABET.split('').map((_, c) => cellX(c) + CELL / 2).join(' ');
  const rows = [];
  for (let r = 0; r < 26; r++) {
    const row = ALPHABET.slice(r) + ALPHABET.slice(0, r);
    rows.push(el('text', {
      x: xs, y: cellY(r) + CELL / 2 + 3.4, 'text-anchor': 'middle'
    }, row));
  }
  // headers: plaintext along the top, key down the side
  const top = el('text', {
    x: xs, y: GY - 7, 'text-anchor': 'middle', fill: COLOR.plain, 'font-weight': 700, 'font-size': 11
  }, ALPHABET);
  const side = ALPHABET.split('').map((ch, r) => glyph(GX - 10, cellY(r) + CELL / 2, ch, { size: 11, fill: COLOR.key }));
  return g({ 'font-family': FONT.mono, 'font-size': 9.5, fill: '#5b4c3a' }, [...rows, top, ...side]);
}

function crosshairs() {
  const under = [];
  const over = [];
  [...PLAIN].forEach((ch, i) => {
    const s = slot(i);
    const c = idx(ch);
    const r = idx(keyAt(i));
    const fin = s + ON;
    const colH = cellY(r) - (GY - 18);
    const rowW = cellX(c) - (GX - 18);

    // the plaintext column slides down, the key row slides right
    under.push(el('rect', {
      x: cellX(c), y: GY - 18, width: CELL, height: colH, fill: COLOR.plain, 'fill-opacity': 0.22, opacity: 0
    }, [animate('height', T, [[0, 0], [s, 0], [s + 0.4, colH], [T, colH]]), blink(T, s, fin, { fade: 0.1 })]));
    under.push(el('rect', {
      x: GX - 18, y: cellY(r), width: rowW, height: CELL, fill: COLOR.key, 'fill-opacity': 0.25, opacity: 0
    }, [animate('width', T, [[0, 0], [s + 0.2, 0], [s + 0.6, rowW], [T, rowW]]), blink(T, s + 0.2, fin, { fade: 0.1 })]));

    over.push(g({ opacity: 0 }, [
      el('rect', {
        x: cellX(c) - 4, y: cellY(r) - 4, width: CELL + 8, height: CELL + 8, rx: 4,
        fill: COLOR.cipher, stroke: COLOR.card, 'stroke-width': 1.5, filter: 'url(#lift)'
      }),
      glyph(cellX(c) + CELL / 2, cellY(r) + CELL / 2, example.expected[i], { size: 13, fill: COLOR.card }),
      blink(T, s + 0.6, fin, { fade: 0.1 })
    ]));
  });
  return { under: g({}, under), over: g({}, over) };
}

const RX = 506;
const RW = 33;
const colX = (i) => RX + i * RW + RW / 2;
const KEY_Y = 202;
const PLAIN_Y = 282;
const CIPHER_Y = 356;

function strips() {
  const parts = [];
  // the frame that walks along the message
  const frames = [[0, `${colX(0)} 0`]];
  [...PLAIN].forEach((_, i) => {
    frames.push([slot(i) - 0.25, frames[frames.length - 1][1]], [slot(i), `${colX(i)} 0`]);
  });
  frames.push([T - 0.4, frames[frames.length - 1][1]], [T, `${colX(0)} 0`]);
  const box = (y1, y2) => el('rect', {
    x: -RW / 2 + 2, y: y1, width: RW - 4, height: y2 - y1, rx: 7,
    fill: COLOR.card, stroke: COLOR.ink, 'stroke-width': 1.2, filter: 'url(#lift)'
  });
  parts.push(g({ transform: `translate(${colX(0)} 0)` }, [
    el('line', { x1: 0, y1: KEY_Y + 28, x2: 0, y2: CIPHER_Y - 18, stroke: COLOR.ink, 'stroke-width': 1, opacity: 0.25 }),
    box(KEY_Y - 20, KEY_Y + 28),
    box(PLAIN_Y - 18, PLAIN_Y + 18),
    box(CIPHER_Y - 18, CIPHER_Y + 20),
    animateTransform('translate', T, frames, { ease: true })
  ]));

  parts.push(label(RX, KEY_Y - 34, 'key, repeated', { fill: COLOR.key, size: 10, spacing: 1.6 }));
  parts.push(label(RX, PLAIN_Y - 26, 'plaintext', { fill: COLOR.plain, size: 10, spacing: 1.6 }));
  parts.push(label(RX, CIPHER_Y - 26, 'ciphertext', { fill: COLOR.cipher, size: 10, spacing: 1.6 }));

  [...PLAIN].forEach((ch, i) => {
    const s = slot(i);
    const k = keyAt(i);
    parts.push(glyph(colX(i), KEY_Y, k, { size: 20, fill: COLOR.key }));
    parts.push(text(colX(i), KEY_Y + 20, String(idx(k)), {
      'font-family': FONT.mono, 'font-size': 10, 'text-anchor': 'middle', fill: COLOR.muted
    }));
    parts.push(glyph(colX(i), PLAIN_Y, ch, { size: 20, fill: COLOR.plain }));
    parts.push(el('line', {
      x1: colX(i) - 8, y1: CIPHER_Y + 14, x2: colX(i) + 8, y2: CIPHER_Y + 14, stroke: COLOR.rule, 'stroke-width': 1.5
    }));
    parts.push(g({}, [
      glyph(colX(i), CIPHER_Y, example.expected[i], { size: 20, fill: COLOR.cipher }),
      animate('opacity', T, windowFrames(T, s + 0.7, T, { fade: 0.2 })),
      animateTransform('translate', T, [[0, '0 -10'], [s + 0.55, '0 -10'], [s + 0.9, '0 0'], [T, '0 0']])
    ]));
  });

  // one period of the key
  const x1 = RX + 3;
  const x2 = RX + RW * KEY.length - 3;
  parts.push(el('path', {
    d: `M${x1},${KEY_Y - 14} L${x1},${KEY_Y - 19} L${x2},${KEY_Y - 19} L${x2},${KEY_Y - 14}`,
    fill: 'none', stroke: COLOR.key, 'stroke-width': 1.2, opacity: 0.7
  }));
  parts.push(note((x1 + x2) / 2 + 92, KEY_Y - 34, '… and again, and again', { size: 11, fill: COLOR.key }));
  return g({}, parts);
}

function equation() {
  const cx = 704;
  const y = 460;
  const parts = [
    el('rect', {
      x: RX, y: y - 66, width: RW * 12, height: 132, rx: 10,
      fill: COLOR.card, stroke: COLOR.rule, 'stroke-width': 1.2
    }),
    label(RX + 16, y - 44, 'this letter', { size: 10, spacing: 1.6 })
  ];
  [...PLAIN].forEach((ch, i) => {
    const s = slot(i);
    const k = keyAt(i);
    const c = example.expected[i];
    const sum = idx(ch) + idx(k);
    const op = (x, str, size = 22) => text(x, y + 8, str, {
      'font-family': FONT.serif, 'font-size': size, 'text-anchor': 'middle', fill: COLOR.muted
    });
    const num = (x, n, color) => text(x, y + 44, String(n), {
      'font-family': FONT.mono, 'font-size': 13, 'text-anchor': 'middle', fill: color
    });
    parts.push(g({ opacity: i === 0 ? 1 : 0 }, [
      tile(cx - 120, y, ch, { size: 46, color: COLOR.plain }),
      op(cx - 60, '+'),
      tile(cx, y, k, { size: 46, color: COLOR.key }),
      op(cx + 60, '='),
      tile(cx + 120, y, c, { size: 46, color: COLOR.cipher, fill: COLOR.cipherSoft }),
      num(cx - 120, idx(ch), COLOR.plain),
      text(cx - 60, y + 44, '+', { 'font-family': FONT.mono, 'font-size': 13, 'text-anchor': 'middle', fill: COLOR.muted }),
      num(cx, idx(k), COLOR.key),
      text(cx + 60, y + 44, sum >= 26 ? `= ${sum} − 26 =` : '=', {
        'font-family': FONT.mono, 'font-size': sum >= 26 ? 10 : 13, 'text-anchor': 'middle', fill: COLOR.muted
      }),
      num(cx + 120, idx(c), COLOR.cipher),
      animate('opacity', T, windowFrames(T, s + 0.1, i === PLAIN.length - 1 ? T : s + ON + 0.05, { fade: 0.15 }))
    ]));
  });
  parts.push(note(RX + RW * 12 - 16, y - 44, 'column × row = shift by the key letter', { anchor: 'end', size: 11 }));
  return g({}, parts);
}

function insight() {
  // the same plaintext letter comes out differently depending on the key letter above it
  const repeats = [...PLAIN].map((ch, i) => [ch, i]).filter(([ch]) => ch === 'T').map(([, i]) => i);
  const parts = repeats.map((i) => el('circle', {
    cx: colX(i), cy: PLAIN_Y, r: 14, fill: 'none', stroke: COLOR.green, 'stroke-width': 1.6, 'stroke-dasharray': '3 3', opacity: 0
  }, animate('opacity', T, [[0, 0], [T - 2.6, 0], [T - 2.3, 1], [T - 0.4, 1], [T, 0]])));
  const disguises = repeats.map((i) => example.expected[i]);
  parts.push(note(RX, 560, `Three T's turn into ${disguises.slice(0, -1).join(', ')} and ${disguises.at(-1)}: the key smears out frequencies.`, {
    size: 13, fill: COLOR.green
  }));
  return g({}, parts);
}

export function render() {
  const { under, over } = crosshairs();
  const body = [
    table(),
    under,
    tableGlyphs(),
    over,
    label(GX, GY - 26, 'tabula recta', { size: 10, spacing: 1.6 }),
    note(GX + 26 * CELL, GY - 26, 'plaintext → column, key → row', { anchor: 'end', size: 11 }),
    strips(),
    equation(),
    insight()
  ].join('\n');

  const groups = example.expected.match(/.{1,5}/g).join(' ');
  const footer = [
    codeLine(48, H - 30, [
      ['encrypt(', COLOR.muted], [`"${PLAIN}"`, COLOR.plain, 700], [', ', COLOR.muted], [`"${KEY}"`, COLOR.key, 700],
      [')  →  ', COLOR.muted], [`"${groups}"`, COLOR.cipher, 700]
    ]),
    note(WIDTH - 48, H - 30, 'A Caesar shift that changes with every letter.', { anchor: 'end', size: 13 })
  ].join('\n');

  return page({
    height: H,
    number: 'III',
    family: 'Polyalphabetic substitution',
    title: 'The Vigenère Cipher',
    subtitle: 'Repeat the key under the message and look every pair up in the tabula recta.',
    description: `The key ${KEY} is repeated under ${PLAIN}. For every letter, the plaintext column and the key row of the 26 by 26 tabula recta meet at the ciphertext letter, giving ${example.expected}.`,
    body,
    footer
  });
}
