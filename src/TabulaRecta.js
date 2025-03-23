/**
 * https://en.wikipedia.org/wiki/Tabula_recta
 * 
 * Implementation of a Tabula Recta (also known as a Vigenère square or Vigenère table).
 * The Tabula Recta is a 26×26 table of alphabet letters, used in several classical
 * encryption algorithms including the Vigenère cipher, Bellaso's cipher, Trithemius cipher,
 * and the Autokey cipher.
 * 
 * The structure looks like:
 * [ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
 *   'BCDEFGHIJKLMNOPQRSTUVWXYZA',
 *   'CDEFGHIJKLMNOPQRSTUVWXYZAB',
 *   'DEFGHIJKLMNOPQRSTUVWXYZABC',
 *   'EFGHIJKLMNOPQRSTUVWXYZABCD',
 *   ... and so on ]
 * 
 * Each row is the alphabet shifted one position to the left from the previous row.
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */

// Generate the Tabula Recta matrix
const start = 'A'.charCodeAt(0);
const tabulaRecta = [];

for (let x = 0; x < 26; x += 1) {
  const seq = [];
  for (let y = x; y <= x + 25; y++) {
    const charCode = (y > 25 ? y - 26 : y) + start;

    const char = String.fromCharCode(charCode);
    seq.push(char);
  }
  tabulaRecta.push(seq.join(''));
}

export default tabulaRecta;
