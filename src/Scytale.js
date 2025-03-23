/**
 * https://en.wikipedia.org/wiki/Scytale
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */

/**
 * Encrypts text using the Scytale cipher
 * The Scytale is a transposition cipher where text is wrapped around a rod of specific diameter
 * @param {string} text The text to encrypt
 * @param {number} diameter The diameter of the rod (number of letters in each row)
 * @returns {string} Encrypted text
 */
function encrypt(text, diameter = 3) {
  // Convert to uppercase as per other ciphers in the project
  text = text.toUpperCase();
  
  // Remove non-alphabetic characters to maintain consistency with other ciphers
  text = text.replace(/[^A-Z]/g, '');
  
  if (diameter <= 1) {
    throw new Error('Diameter must be greater than 1');
  }
  
  // Number of rows needed (which is the wrapping)
  const rows = Math.ceil(text.length / diameter);
  
  // Fill a matrix with the text written horizontally
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix[i] = [];
    for (let j = 0; j < diameter; j++) {
      const index = i * diameter + j;
      matrix[i][j] = index < text.length ? text[index] : 'X'; // Pad with X
    }
  }
  
  // Read the matrix vertically to get the encrypted text
  let encrypted = '';
  for (let col = 0; col < diameter; col++) {
    for (let row = 0; row < rows; row++) {
      encrypted += matrix[row][col];
    }
  }
  
  // Format in groups of 5 for readability (common in classical ciphers)
  return encrypted.match(/.{1,5}/g).join(' ');
}

/**
 * Decrypts text using the Scytale cipher
 * @param {string} text The text to decrypt
 * @param {number} diameter The diameter of the rod (number of letters in each row)
 * @returns {string} Decrypted text
 */
function decrypt(text, diameter = 3) {
  // Remove spaces and convert to uppercase
  text = text.replace(/\s/g, '').toUpperCase();
  
  if (diameter <= 1) {
    throw new Error('Diameter must be greater than 1');
  }
  
  // Calculate the number of rows (total length / diameter)
  const rows = Math.ceil(text.length / diameter);
  const columns = diameter;
  
  // Create a matrix to rebuild the original message
  const matrix = Array(rows).fill().map(() => Array(columns).fill(''));
  
  // Fill the matrix vertically with the encrypted text
  let index = 0;
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      if (index < text.length) {
        matrix[row][col] = text[index++];
      }
    }
  }
  
  // Read the matrix horizontally to get the original message
  let decrypted = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      decrypted += matrix[row][col];
    }
  }
  
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};