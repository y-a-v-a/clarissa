/**
 * https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher
 * 
 * Implementation of the Vigenère cipher, a polyalphabetic substitution cipher
 * using a keyword to determine letter shifts for each position.
 * The Vigenère cipher combines multiple Caesar ciphers with different shift values
 * determined by the key, making it more secure than simple substitution ciphers.
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */

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

export {
  encrypt,
  decrypt
};
