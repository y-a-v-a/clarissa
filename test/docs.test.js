import assert from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import * as adfgx from '../visuals/lib/adfgx.js';
import * as atbash from '../visuals/lib/atbash.js';
import * as caesar from '../visuals/lib/caesar.js';
import * as playfair from '../visuals/lib/playfair.js';
import * as scytale from '../visuals/lib/scytale.js';
import * as vigenere from '../visuals/lib/vigenere.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('GitHub Pages site (docs/)', () => {
  it('should carry an up-to-date copy of the library (run `npm run docs`)', () => {
    assert.strictEqual(read('docs/clarissa/index.js'), read('index.js'), 'docs/clarissa/index.js is stale');
    const files = readdirSync(new URL('../src/', import.meta.url)).filter((f) => f.endsWith('.js'));
    for (const file of files) {
      assert.strictEqual(read(`docs/clarissa/src/${file}`), read(`src/${file}`), `docs/clarissa/src/${file} is stale`);
    }
  });

  it('should carry up-to-date visualizations (run `npm run docs`)', () => {
    for (const [name, visual] of Object.entries({ caesar, atbash, vigenere, playfair, scytale, adfgx })) {
      assert.strictEqual(read(`docs/img/${name}.svg`), visual.render() + '\n', `docs/img/${name}.svg is stale`);
    }
  });
});
