/**
 * https://en.wikipedia.org/wiki/Playfair_cipher
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */

/**
 * Generates a 5x5 Playfair cipher key table from the provided key
 * @param {string} key The key to generate the table from
 * @returns {string[][]} 5x5 key table
 */
function generateKeyTable(key) {
  // Standardize: uppercase, replace J with I, remove non-alphabetic chars
  key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  
  // Create alphabet for filling remaining positions (without J)
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  
  // Build key table with unique characters
  let keyChars = '';
  for (let char of (key + alphabet)) {
    if (!keyChars.includes(char)) {
      keyChars += char;
    }
  }
  
  // Arrange into 5x5 grid
  const keyTable = Array(5).fill(0).map(() => Array(5).fill(''));
  for (let i = 0; i < 25; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    keyTable[row][col] = keyChars[i];
  }
  
  return keyTable;
}

/**
 * Finds coordinates of a character in the key table
 * @param {string[][]} keyTable Playfair key table
 * @param {string} char Character to find
 * @returns {number[]} [row, col] coordinates
 */
function findCharPosition(keyTable, char) {
  // Replace J with I as per Playfair rules
  if (char === 'J') char = 'I';
  
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (keyTable[row][col] === char) {
        return [row, col];
      }
    }
  }
  return [-1, -1]; // Should never happen with valid input
}

/**
 * Processes a pair of characters according to Playfair rules
 * @param {string[][]} keyTable Playfair key table
 * @param {string} a First character
 * @param {string} b Second character
 * @param {number} direction 1 for encrypt, -1 for decrypt
 * @returns {string} Transformed character pair
 */
function processDigraph(keyTable, a, b, direction) {
  const [aRow, aCol] = findCharPosition(keyTable, a);
  const [bRow, bCol] = findCharPosition(keyTable, b);
  
  let newA, newB;
  
  // Same row: shift right/left circularly
  if (aRow === bRow) {
    newA = keyTable[aRow][(aCol + direction + 5) % 5];
    newB = keyTable[bRow][(bCol + direction + 5) % 5];
  }
  // Same column: shift down/up circularly
  else if (aCol === bCol) {
    newA = keyTable[(aRow + direction + 5) % 5][aCol];
    newB = keyTable[(bRow + direction + 5) % 5][bCol];
  }
  // Rectangle: exchange columns
  else {
    newA = keyTable[aRow][bCol];
    newB = keyTable[bRow][aCol];
  }
  
  return newA + newB;
}

/**
 * Prepares text for Playfair encryption
 * @param {string} text Text to prepare
 * @returns {string[]} Array of digraphs
 */
function prepareText(text) {
  // Standardize: uppercase, replace J with I, remove non-alphabetic chars
  const cleanText = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  
  const digraphs = [];
  let i = 0;
  
  while (i < cleanText.length) {
    if (i === cleanText.length - 1) {
      // Handle last character if text length is odd
      digraphs.push(cleanText[i] + 'X');
      break;
    }
    
    // If digraph has same letters, insert X between
    if (cleanText[i] === cleanText[i + 1]) {
      digraphs.push(cleanText[i] + 'X');
      i++; // Only advance one position
    } else {
      // Normal case
      digraphs.push(cleanText[i] + cleanText[i + 1]);
      i += 2;
    }
  }
  
  return digraphs;
}

/**
 * Encrypts text using Playfair cipher
 * @param {string} text Text to encrypt
 * @param {string} key Encryption key
 * @returns {string} Encrypted text
 */
function encrypt(text, key = 'PLAYFAIR') {
  const keyTable = generateKeyTable(key);
  const digraphs = prepareText(text);
  
  const encryptedDigraphs = digraphs.map(digraph => 
    processDigraph(keyTable, digraph[0], digraph[1], 1)
  );
  
  return encryptedDigraphs.join('');
}

/**
 * Decrypts text using Playfair cipher
 * @param {string} text Text to decrypt
 * @param {string} key Decryption key
 * @returns {string} Decrypted text
 */
function decrypt(text, key = 'PLAYFAIR') {
  const keyTable = generateKeyTable(key);
  
  // Split into digraphs
  const digraphs = [];
  for (let i = 0; i < text.length; i += 2) {
    if (i + 1 < text.length) {
      digraphs.push(text.substring(i, i + 2));
    }
  }
  
  const decryptedDigraphs = digraphs.map(digraph => 
    processDigraph(keyTable, digraph[0], digraph[1], -1)
  );
  
  return decryptedDigraphs.join('');
}

module.exports = {
  encrypt,
  decrypt
};