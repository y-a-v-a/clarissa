const Caesar = require('./src/Caesar');
const Atbash = require('./src/Atbash');
const Vigenere = require('./src/Vigenere');

const algorithms = {
  Caesar,
  Atbash,
  Vigenere
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

function checkCipher(name) {
  const availableCiphers = getCiphers();
  if (!availableCiphers.includes(name)) {
    throw new Error(`Unknown cipher: ${name}`);
  }
}

function getCiphers() {
  return Object.keys(algorithms);
}

module.exports = {
  createCipher,
  createDecipher,
  getCiphers
};
