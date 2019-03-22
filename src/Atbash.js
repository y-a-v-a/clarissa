/**
 * https://en.wikipedia.org/wiki/Atbash
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */

function meta(str) {
  const charCodeA = 'A'.charCodeAt(0);
  const enc = (x) => {
    return (-x % 26) + 25;
  };

  const res = str.split('').map((str) => {
    const charCode = str.charCodeAt(0);
    const res = enc(charCode - charCodeA);
    return String.fromCharCode(res + charCodeA);
  });
  return res.join('');
}

function encrypt(str) {
  return meta(str.toUpperCase());
}

function decrypt(str) {
  return encrypt(str.toUpperCase());
}

module.exports = {
  encrypt,
  decrypt
};
