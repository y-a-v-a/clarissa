/**
 * https://en.wikipedia.org/wiki/Caesar_cipher
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */

function meta(str, n = 13, direction = 1) {
  const charCodea = 'a'.charCodeAt(0);
  const charCodeA = 'A'.charCodeAt(0);

  const enc = (x, n) => {
    const r = x + (n * direction);
    return (r < 0 ? r + 26 : r) % 26;
  };

  const res = str.split('').map((str) => {
    const charCode = str.charCodeAt(0);
    const offset = charCode >= charCodea ? charCodea : charCodeA;
    const x = str.charCodeAt(0) - offset;
    const res = enc(x, n);
    return String.fromCharCode(res + offset);
  });
  return res.join('');
}

function encrypt(str, n = 13) {
  return meta(str.toUpperCase(), n, 1);
}

function decrypt(str, n = 13) {
  return meta(str.toUpperCase(), n, -1);
}

module.exports = {
  encrypt,
  decrypt
};
