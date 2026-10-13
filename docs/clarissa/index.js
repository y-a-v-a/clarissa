import * as Caesar from './src/Caesar.js';
import * as Atbash from './src/Atbash.js';
import * as Vigenere from './src/Vigenere.js';
import * as Playfair from './src/Playfair.js';
import * as Scytale from './src/Scytale.js';
import * as ADFGX from './src/ADFGX.js';

const algorithms = {
  Caesar,
  Atbash,
  Vigenere,
  Playfair,
  Scytale,
  ADFGX
};

function createCipher(algorithm = 'Caesar') {
  checkCipher(algorithm);

  return {
    encrypt: algorithms[algorithm].encrypt
  };
}

function createDecipher(algorithm = 'Caesar') {
  checkCipher(algorithm);

  return {
    decrypt: algorithms[algorithm].decrypt
  };
}

/**
 * Check for cipher existence
 * @param {string} name Name of the cipher
 * @returns {boolean} True when supplied cipher is known
 * @throws Error
 */
function checkCipher(name) {
  const availableCiphers = getCiphers();
  if (!availableCiphers.includes(name)) {
    throw new Error(`Unknown cipher: ${name}`);
  }
  return true;
}

/**
 * Return list of ciphers
 * @returns {Array.<string>} List of available ciphers
 */
function getCiphers() {
  return Object.keys(algorithms);
}

export {
  createCipher,
  createDecipher,
  getCiphers
};
