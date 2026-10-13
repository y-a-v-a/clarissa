#!/usr/bin/env node
/**
 * Renders one animated SVG per cipher into this directory.
 *
 * Each visualization computes its own worked example step by step; before
 * writing anything we check that example against the real implementation,
 * so the pictures can never drift away from what the code does.
 *
 *   npm run visuals
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as clarissa from '../index.js';
import * as adfgx from './lib/adfgx.js';
import * as atbash from './lib/atbash.js';
import * as caesar from './lib/caesar.js';
import * as playfair from './lib/playfair.js';
import * as scytale from './lib/scytale.js';
import * as vigenere from './lib/vigenere.js';

const here = dirname(fileURLToPath(import.meta.url));

const visuals = {
  caesar,
  atbash,
  vigenere,
  playfair,
  scytale,
  adfgx
};

const only = process.argv.slice(2);
let failed = false;

for (const [name, visual] of Object.entries(visuals)) {
  if (only.length && !only.includes(name)) continue;

  const { cipher, args, expected } = visual.example;
  const actual = clarissa.createCipher(cipher).encrypt(...args).replace(/\s/g, '');
  if (actual !== expected) {
    console.error(`✗ ${name}: visualization shows ${expected}, but ${cipher}.encrypt gives ${actual}`);
    failed = true;
    continue;
  }

  const file = join(here, `${name}.svg`);
  const svg = visual.render();
  writeFileSync(file, svg + '\n');
  console.log(`✓ ${name}.svg  (${(svg.length / 1024).toFixed(1)} kB)  ${args.join(', ')} → ${expected}`);
}

process.exit(failed ? 1 : 0);
