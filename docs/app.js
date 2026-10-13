/**
 * Playground: runs the library (copied into ./clarissa by `npm run docs`)
 * straight in the browser.
 */
import * as clarissa from './clarissa/index.js';

const CIPHERS = {
  Caesar: { label: 'Caesar', fields: ['offset'], offset: 'Offset (0–25)' },
  Atbash: { label: 'Atbash', fields: [] },
  Vigenere: { label: 'Vigenère', fields: ['key'], key: 'Key' },
  Playfair: { label: 'Playfair', fields: ['key'], key: 'Key' },
  Scytale: { label: 'Scytale', fields: ['offset'], offset: 'Letters per face (2 or more)' },
  ADFGX: { label: 'ADFGX', fields: ['key', 'transposition'], key: 'Square key' }
};

const $ = (id) => document.getElementById(id);
const form = $('form');
const cipherSelect = $('cipher');
const output = $('output');
let mode = 'encrypt';

for (const name of clarissa.getCiphers()) {
  cipherSelect.append(new Option(CIPHERS[name]?.label ?? name, name));
}

const letters = (str) => str.toUpperCase().replace(/[^A-Z]/g, '');

function args(name) {
  const offset = Number.parseInt($('offset').value, 10);
  const key = letters($('key').value);
  const transposition = letters($('transposition').value);
  switch (name) {
    case 'Caesar':
      if (Number.isNaN(offset)) throw new Error('Caesar needs a number to shift by.');
      return [((offset % 26) + 26) % 26];
    case 'Scytale':
      if (Number.isNaN(offset) || offset < 2) throw new Error('The scytale needs at least 2 letters per face.');
      return [offset];
    case 'Vigenere':
    case 'Playfair':
      if (!key) throw new Error(`${CIPHERS[name].label} needs a key made of letters.`);
      return [key];
    case 'ADFGX':
      if (!key || !transposition) throw new Error('ADFGX needs both a square key and a transposition key.');
      return [key, transposition];
    default:
      return [];
  }
}

function hint(name) {
  if (name === 'Playfair' && mode === 'encrypt') return 'Letters only; J counts as I, and an X splits double letters.';
  if (name === 'ADFGX' && mode === 'decrypt') return 'Ciphertext may only contain the letters A, D, F, G and X.';
  if (name === 'Scytale' && mode === 'encrypt') return 'Letters only; the last row is padded with X.';
  return 'Letters only: spaces, digits and punctuation are dropped.';
}

function run() {
  const name = cipherSelect.value;
  const text = letters($('text').value);
  output.classList.remove('error');
  $('hint').textContent = hint(name);
  if (!text) {
    output.textContent = '';
    return;
  }
  try {
    const result = mode === 'encrypt'
      ? clarissa.createCipher(name).encrypt(text, ...args(name))
      : clarissa.createDecipher(name).decrypt(text, ...args(name));
    output.textContent = result;
  } catch (error) {
    output.classList.add('error');
    output.textContent = error.message;
  }
}

function sync() {
  const config = CIPHERS[cipherSelect.value];
  for (const field of document.querySelectorAll('[data-field]')) {
    field.hidden = !config.fields.includes(field.dataset.field);
  }
  $('offset-label').textContent = config.offset ?? 'Offset';
  $('key-label').textContent = config.key ?? 'Key';
  for (const button of document.querySelectorAll('[data-mode]')) {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  }
  $('text-label').textContent = mode === 'encrypt' ? 'Plaintext' : 'Ciphertext';
  $('output-label').textContent = mode === 'encrypt' ? 'Ciphertext' : 'Plaintext';
  $('text').style.color = mode === 'encrypt' ? 'var(--plain)' : 'var(--cipher)';
  output.style.color = mode === 'encrypt' ? '' : 'var(--plain)';
  run();
}

form.addEventListener('input', run);
form.addEventListener('submit', (event) => event.preventDefault());
cipherSelect.addEventListener('change', sync);

for (const button of document.querySelectorAll('[data-mode]')) {
  button.addEventListener('click', () => {
    mode = button.dataset.mode;
    sync();
  });
}

$('swap').addEventListener('click', () => {
  if (output.classList.contains('error') || !output.textContent) return;
  $('text').value = output.textContent;
  mode = mode === 'encrypt' ? 'decrypt' : 'encrypt';
  sync();
});

$('copy').addEventListener('click', async () => {
  const button = $('copy');
  try {
    await navigator.clipboard.writeText(output.textContent);
    button.textContent = 'Copied';
  } catch {
    button.textContent = 'Copy failed';
  }
  setTimeout(() => { button.textContent = 'Copy result'; }, 1400);
});

// "Try this example" buttons under each visualization
for (const button of document.querySelectorAll('[data-try]')) {
  button.addEventListener('click', () => {
    const { try: name, text, key, offset, transposition } = button.dataset;
    cipherSelect.value = name;
    $('text').value = text;
    if (key) $('key').value = key;
    if (offset) $('offset').value = offset;
    if (transposition) $('transposition').value = transposition;
    mode = 'encrypt';
    sync();
    $('playground').scrollIntoView();
    $('text').focus({ preventScroll: true });
  });
}

sync();
