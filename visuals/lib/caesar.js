/**
 * Caesar: a cipher wheel turns by the offset, then every letter hops
 * `offset` places along the alphabet.
 */
import {
  ALPHABET, COLOR, FONT, WIDTH,
  animate, animateMotion, animateTransform, blink, codeLine, draw, el, g, glyph,
  hop, label, note, page, polar, text, tile, windowFrames
} from './svg.js';

const PLAIN = 'HELLO';
const OFFSET = 3;

export const example = {
  cipher: 'Caesar',
  args: [PLAIN, OFFSET],
  expected: [...PLAIN].map((ch) => ALPHABET[(ALPHABET.indexOf(ch) + OFFSET) % 26]).join('')
};

const T = 14;
const H = 560;
const slot = (i) => 2 + 2.4 * i;
const STEP = 360 / 26;

function laurel(cx, cy, r, side) {
  // a sprig of leaves along an arc, mirrored by `side`
  const leaves = [];
  for (let i = 0; i < 9; i++) {
    const deg = side * (200 - i * 17);
    const [x, y] = polar(cx, cy, r, deg);
    const tilt = deg + (side > 0 ? -60 : 60) + 90;
    leaves.push(el('ellipse', {
      cx: x, cy: y, rx: 7.5 - i * 0.35, ry: 3.2,
      transform: `rotate(${tilt} ${x} ${y})`,
      fill: COLOR.green, opacity: 0.85 - i * 0.03
    }));
  }
  const [x0, y0] = polar(cx, cy, r, side * 205);
  const [x1, y1] = polar(cx, cy, r, side * 55);
  leaves.push(el('path', {
    d: `M${x0},${y0} A${r},${r} 0 0 ${side > 0 ? 0 : 1} ${x1},${y1}`,
    fill: 'none', stroke: COLOR.green, 'stroke-width': 1.4, opacity: 0.8
  }));
  return g({}, leaves);
}

function wheel(cx, cy) {
  const outer = [];
  const inner = [];
  for (let i = 0; i < 26; i++) {
    const deg = i * STEP;
    const [ox, oy] = polar(cx, cy, 147, deg);
    outer.push(glyph(ox, oy, ALPHABET[i], {
      size: 17, fill: COLOR.plain, transform: `rotate(${deg} ${ox} ${oy})`
    }));
    const [ix, iy] = polar(cx, cy, 105, deg);
    inner.push(glyph(ix, iy, ALPHABET[i], {
      size: 15, fill: COLOR.cipher, transform: `rotate(${deg} ${ix} ${iy})`
    }));
    const [ax, ay] = polar(cx, cy, 128, deg + STEP / 2);
    const [bx, by] = polar(cx, cy, 166, deg + STEP / 2);
    outer.push(el('line', { x1: ax, y1: ay, x2: bx, y2: by, stroke: COLOR.rule, 'stroke-width': 1 }));
    const [jx, jy] = polar(cx, cy, 87, deg + STEP / 2);
    const [kx, ky] = polar(cx, cy, 124, deg + STEP / 2);
    inner.push(el('line', { x1: jx, y1: jy, x2: kx, y2: ky, stroke: '#b7c9d8', 'stroke-width': 1 }));
  }

  // the window that points at the letter being encrypted
  const sector = (r1, r2, half) => {
    const [a1x, a1y] = polar(cx, cy, r2, -half);
    const [a2x, a2y] = polar(cx, cy, r2, half);
    const [b1x, b1y] = polar(cx, cy, r1, half);
    const [b2x, b2y] = polar(cx, cy, r1, -half);
    return `M${a1x},${a1y} A${r2},${r2} 0 0 1 ${a2x},${a2y} L${b1x},${b1y} A${r1},${r1} 0 0 0 ${b2x},${b2y} Z`;
  };
  const pointerFrames = [[0, '0'], [2, '0']];
  [...PLAIN].forEach((ch, i) => {
    const prev = pointerFrames[pointerFrames.length - 1][1];
    pointerFrames.push([slot(i), prev], [slot(i) + 0.5, String(ALPHABET.indexOf(ch) * STEP)]);
  });
  pointerFrames.push([T - 0.5, pointerFrames[pointerFrames.length - 1][1]], [T, '0']);
  const pointer = g({}, [
    el('path', {
      d: sector(84, 170, STEP / 2 + 0.6), fill: COLOR.key, 'fill-opacity': 0.22,
      stroke: COLOR.key, 'stroke-width': 2, 'stroke-linejoin': 'round'
    }),
    el('path', {
      d: `M${cx - 9},${cy - 186} L${cx + 9},${cy - 186} L${cx},${cy - 172} Z`, fill: COLOR.key
    }),
    animateTransform('rotate', T, pointerFrames.map(([t, v]) => [t, `${v} ${cx} ${cy}`]), { ease: true })
  ]);

  const turn = -OFFSET * STEP;
  const innerRing = g({ transform: `rotate(${turn} ${cx} ${cy})` }, [
    ...inner,
    animateTransform('rotate', T, [
      [0, `0 ${cx} ${cy}`], [0.3, `0 ${cx} ${cy}`], [1.6, `${turn} ${cx} ${cy}`],
      [T - 0.5, `${turn} ${cx} ${cy}`], [T, `0 ${cx} ${cy}`]
    ], { ease: true })
  ]);

  return g({}, [
    el('circle', { cx, cy, r: 172, fill: COLOR.paperDeep, opacity: 0.6 }),
    el('circle', { cx, cy, r: 166, fill: COLOR.card, stroke: COLOR.ink, 'stroke-width': 1.6, filter: 'url(#lift)' }),
    el('circle', { cx, cy, r: 128, fill: '#eef3f6', stroke: COLOR.ink, 'stroke-width': 1.2 }),
    ...outer,
    innerRing,
    el('circle', { cx, cy, r: 86, fill: COLOR.paper, stroke: COLOR.ink, 'stroke-width': 1.2 }),
    laurel(cx, cy, 66, 1),
    laurel(cx, cy, 66, -1),
    text(cx, cy + 6, `+${OFFSET}`, {
      'font-family': FONT.serif, 'font-size': 40, 'text-anchor': 'middle', fill: COLOR.key, 'font-weight': 700
    }),
    label(cx, cy + 30, 'shift', { anchor: 'middle', size: 10 }),
    text(cx, cy - 28, 'III', {
      'font-family': FONT.serif, 'font-size': 15, 'text-anchor': 'middle', fill: COLOR.muted, 'letter-spacing': 2
    }),
    el('circle', { cx, cy, r: 3, fill: COLOR.ink, opacity: 0 }),
    pointer,
    label(cx - 182, cy + 150, 'outer ring', { size: 9, spacing: 1.5 }),
    note(cx - 182, cy + 165, 'plaintext', { size: 12, fill: COLOR.plain }),
    label(cx + 182, cy + 150, 'inner ring', { size: 9, spacing: 1.5, anchor: 'end' }),
    note(cx + 182, cy + 165, 'turned by 3', { size: 12, fill: COLOR.cipher, anchor: 'end' })
  ]);
}

function hopper() {
  const left = 470;
  const cell = 17;
  const stripY = 334;
  const cellX = (i) => left + cell * i + cell / 2;
  const tileX = (i) => 610 + i * 58;
  const plainY = 206;
  const cipherY = 448;

  const parts = [];

  parts.push(label(tileX(0) - 26, plainY - 34, 'plaintext', { fill: COLOR.plain }));
  parts.push(label(tileX(0) - 26, cipherY + 44, 'ciphertext', { fill: COLOR.cipher }));
  parts.push(label(left, stripY + 38, 'the alphabet, which wraps around', { size: 9, spacing: 1.5 }));

  // wrap-around hint: Z curls back to A
  const zx = cellX(25) + cell / 2;
  parts.push(el('path', {
    d: `M${zx + 2},${stripY} C${zx + 22},${stripY} ${zx + 22},${stripY + 24} ${zx - 10},${stripY + 24} L${left + 120},${stripY + 24}`,
    fill: 'none', stroke: COLOR.muted, 'stroke-width': 1.2, 'stroke-dasharray': '3 4', opacity: 0.8
  }));
  parts.push(el('path', {
    d: `M${left + 120},${stripY + 24} L${left - 2},${stripY + 24} C${left - 16},${stripY + 24} ${left - 16},${stripY} ${left - 4},${stripY}`,
    fill: 'none', stroke: COLOR.muted, 'stroke-width': 1.2, 'stroke-dasharray': '3 4', opacity: 0.8,
    'marker-end': 'url(#arrow-muted)'
  }));

  // strip
  for (let i = 0; i < 26; i++) {
    parts.push(el('rect', {
      x: left + cell * i, y: stripY - 12, width: cell, height: 24,
      fill: COLOR.card, stroke: COLOR.rule, 'stroke-width': 1
    }));
  }

  // per-letter highlights live under the strip glyphs
  const highlights = [];
  const overlays = [];
  [...PLAIN].forEach((ch, i) => {
    const s = slot(i);
    const p = ALPHABET.indexOf(ch);
    const c = (p + OFFSET) % 26;
    highlights.push(el('rect', {
      x: left + cell * p, y: stripY - 12, width: cell, height: 24,
      fill: COLOR.plainSoft, stroke: COLOR.plain, 'stroke-width': 1.5, opacity: 0
    }, blink(T, s + 0.4, s + 2.3)));
    highlights.push(el('rect', {
      x: left + cell * c, y: stripY - 12, width: cell, height: 24,
      fill: COLOR.cipherSoft, stroke: COLOR.cipher, 'stroke-width': 1.5, opacity: 0
    }, blink(T, s + 1.6, s + 2.3)));

    // the hops
    const hops = [];
    let d = '';
    for (let k = 0; k < OFFSET; k++) {
      const x1 = cellX((p + k) % 26);
      const x2 = cellX((p + k + 1) % 26);
      const seg = hop(x1, stripY - 13, x2, 11);
      d += (k === 0 ? seg : seg.replace(/^M[^Q]+/, ' '));
      hops.push(el('path', {
        d: seg, fill: 'none', stroke: COLOR.key, 'stroke-width': 1.6,
        'stroke-dasharray': 30, 'stroke-dashoffset': 30, 'stroke-linecap': 'round'
      }, draw(T, 30, s + 0.5 + k * 0.35, s + 0.85 + k * 0.35, { hold: T })));
      hops.push(text((x1 + x2) / 2, stripY - 30, `+${k + 1}`, {
        'font-family': FONT.mono, 'font-size': 9, 'text-anchor': 'middle', fill: COLOR.key, opacity: 0,
        stroke: COLOR.paper, 'stroke-width': 3, 'paint-order': 'stroke'
      }, blink(T, s + 0.85 + k * 0.35, s + 2.3, { fade: 0.1 })));
    }
    overlays.push(g({ opacity: 0 }, [...hops, blink(T, s + 0.45, s + 2.3)]));

    // a little token that hops along
    overlays.push(el('circle', { cx: 0, cy: 0, r: 5.5, fill: COLOR.key, stroke: COLOR.card, 'stroke-width': 1.5, opacity: 0 }, [
      animateMotion(T, d, s + 0.5, s + 0.5 + OFFSET * 0.35),
      blink(T, s + 0.45, s + 0.55 + OFFSET * 0.35, { fade: 0.1 })
    ]));

    // connectors: tile -> strip, strip -> tile
    const down1 = `M${tileX(i)},${plainY + 24} C${tileX(i)},${plainY + 70} ${cellX(p)},${stripY - 70} ${cellX(p)},${stripY - 14}`;
    overlays.push(el('path', {
      d: down1, fill: 'none', stroke: COLOR.plain, 'stroke-width': 1.5, 'stroke-dasharray': 200, 'stroke-dashoffset': 200,
      'marker-end': 'url(#arrow-plain)', opacity: 0
    }, [draw(T, 200, s, s + 0.45, { hold: T }), blink(T, s, s + 2.3, { fade: 0.05, on: 0.9 })]));
    const down2 = `M${cellX(c)},${stripY + 14} C${cellX(c)},${stripY + 60} ${tileX(i)},${cipherY - 70} ${tileX(i)},${cipherY - 26}`;
    overlays.push(el('path', {
      d: down2, fill: 'none', stroke: COLOR.cipher, 'stroke-width': 1.5, 'stroke-dasharray': 200, 'stroke-dashoffset': 200,
      'marker-end': 'url(#arrow-cipher)', opacity: 0
    }, [draw(T, 200, s + 1.6, s + 2.0, { hold: T }), blink(T, s + 1.6, s + 2.3, { fade: 0.05, on: 0.9 })]));
  });

  parts.push(...highlights);
  for (let i = 0; i < 26; i++) {
    parts.push(glyph(cellX(i), stripY, ALPHABET[i], { size: 12, weight: 600, fill: COLOR.ink }));
  }

  // tiles
  [...PLAIN].forEach((ch, i) => {
    const s = slot(i);
    parts.push(tile(tileX(i), plainY, ch, { size: 44, color: COLOR.plain, extra: el('rect', {
      x: tileX(i) - 27, y: plainY - 27, width: 54, height: 54, rx: 9, fill: 'none',
      stroke: COLOR.key, 'stroke-width': 2.5, opacity: 0
    }, blink(T, s, s + 2.3)) }));
    parts.push(el('rect', {
      x: tileX(i) - 22, y: cipherY - 22, width: 44, height: 44, rx: 6,
      fill: 'none', stroke: COLOR.rule, 'stroke-width': 1.5, 'stroke-dasharray': '4 4'
    }));
    parts.push(g({}, [
      tile(tileX(i), cipherY, example.expected[i], { size: 44, color: COLOR.cipher }),
      animate('opacity', T, windowFrames(T, s + 1.95, T, { fade: 0.2 })),
      animateTransform('translate', T, [[0, '0 -8'], [s + 1.75, '0 -8'], [s + 2.05, '0 0'], [T, '0 0']])
    ]));
  });

  parts.push(...overlays);
  return g({}, parts);
}

export function render() {
  const body = [wheel(240, 318), hopper()].join('\n');
  const footer = [
    codeLine(48, H - 30, [
      ['encrypt(', COLOR.muted], ['"HELLO"', COLOR.plain, 700], [', ', COLOR.muted], ['3', COLOR.key, 700],
      [')  →  ', COLOR.muted], [`"${example.expected}"`, COLOR.cipher, 700]
    ]),
    note(WIDTH - 48, H - 30, 'Every letter moves the same distance. Decrypting moves it back.', { anchor: 'end', size: 13 })
  ].join('\n');

  return page({
    height: H,
    number: 'I',
    family: 'Substitution',
    title: 'The Caesar Cipher',
    subtitle: 'Turn the inner wheel by the key, then read each letter off the inner ring.',
    description: `Animated cipher wheel: the inner ring turns ${OFFSET} places, then each letter of ${PLAIN} hops ${OFFSET} places along the alphabet, giving ${example.expected}.`,
    body,
    footer
  });
}
