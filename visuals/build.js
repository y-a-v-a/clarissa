#!/usr/bin/env node
/**
 * Builds the GitHub Pages site in docs/:
 *
 * - renders one animated SVG per cipher into docs/img/. Each visualization
 *   computes its own worked example step by step; before writing anything we
 *   check that example against the real implementation, so the pictures can
 *   never drift away from what the code does.
 * - copies the library into docs/clarissa/ so the page can import it in the
 *   browser (the modules have no Node dependencies).
 *
 *   npm run docs
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
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
const root = join(here, '..');
const docs = join(root, 'docs');

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

  const file = join(docs, 'img', `${name}.svg`);
  const svg = visual.render();
  writeFileSync(file, svg + '\n');
  console.log(`✓ ${name}.svg  (${(svg.length / 1024).toFixed(1)} kB)  ${args.join(', ')} → ${expected}`);
}

// the library itself, for the playground on the page
if (!only.length) {
  mkdirSync(join(docs, 'clarissa', 'src'), { recursive: true });
  copyFileSync(join(root, 'index.js'), join(docs, 'clarissa', 'index.js'));
  for (const file of readdirSync(join(root, 'src')).filter((f) => f.endsWith('.js'))) {
    copyFileSync(join(root, 'src', file), join(docs, 'clarissa', 'src', file));
  }
  console.log('✓ copied the library into docs/clarissa/');
}

process.exit(failed ? 1 : 0);
