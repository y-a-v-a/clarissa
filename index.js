const Caesar = require('./src/Caesar');
const Atbash = require('./src/Atbash');
const Vigenere = require('./src/Vigenere');
const Playfair = require('./src/Playfair');
const Scytale = require('./src/Scytale');
const ADFGX = require('./src/ADFGX');

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
 * Check for cipher exitence
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

module.exports = {
  createCipher,
  createDecipher,
  getCiphers
};
