const TabulaRecta = require('./TabulaRecta');

const charCodeA = 'A'.charCodeAt(0);

function Vigenere(str, key, direction) {
  return str.split('').filter(char => char !== ' ').map((char, idx) => {
    const charCode = char.charCodeAt(0);
    const keyChar = (key[idx % key.length]).charCodeAt(0);

    const r = charCode + (keyChar * direction);

    return String.fromCharCode(((r < 0 ? r + 26 : r) % 26) + charCodeA);
  }).map((str, idx) => {
    return (idx + 1) % 5 === 0 ? `${str} ` : str;
  }).join('').trim();
}

function encrypt(str, key = 'tabulaRecta') {
  return Vigenere(str.toUpperCase(), key.toUpperCase(), 1);
}

function decrypt(str, key = 'tabulaRecta') {
  return Vigenere(str.toUpperCase(), key.toUpperCase(), -1);
}

module.exports = {
  encrypt,
  decrypt
};
