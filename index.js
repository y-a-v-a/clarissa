const Caesar = require('./src/Caesar');
const Atbash = require('./src/Atbash');
const Vigenere = require('./src/Vigenere');

const algorithms = {
  Caesar,
  Atbash,
  Vigenere
};

function createCipher(algorithm = 'Caesar') {
  const availableCiphers = getCiphers();
  if (!availableCiphers.includes(algorithm)) {
    throw new Error(`Unknown cipher: ${algorithm}`);
  }

  return {
    encrypt: algorithms[algorithm].encrypt
  };
}

function createDecipher(algorithm = 'Caesar') {
  return {
    decrypt: algorithms[algorithm].decrypt
  };
}

function getCiphers() {
  return Object.keys(algorithms);
}

module.exports = {
  createCipher,
  createDecipher,
  getCiphers
};
