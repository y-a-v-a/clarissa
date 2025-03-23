/**
 * https://en.wikipedia.org/wiki/ADFGVX_cipher
 * 
 * Implementation of the ADFGX cipher (WWI German cipher)
 * ADFGX is a fractionated substitution cipher that combines a Polybius square with a columnar transposition
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */

/**
 * The ADFGX symbols used for encoding/decoding
 */
const ADFGX = ['A', 'D', 'F', 'G', 'X'];

/**
 * Creates a 5x5 Polybius square with a given keyword
 * I and J are combined to fit the alphabet in a 5x5 grid
 * @param {string} keyword The keyword to use for the Polybius square
 * @returns {string[][]} 5x5 Polybius square
 */
function createPolybiusSquare(keyword = '') {
  // Standardize: uppercase, remove duplicates and non-alphabetic chars
  keyword = keyword.toUpperCase().replace(/[^A-Z]/g, '');
  let keyChars = '';
  for (let char of keyword) {
    if (!keyChars.includes(char)) {
      keyChars += char;
    }
  }

  // Replace J with I to fit the alphabet in 5x5 grid
  keyChars = keyChars.replace(/J/g, 'I');

  // Add remaining alphabet (skipping letters already in the key and using I for both I and J)
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // Note: no J
  for (let char of alphabet) {
    if (!keyChars.includes(char)) {
      keyChars += char;
    }
  }

  // Create 5x5 grid
  const grid = [];
  for (let i = 0; i < 5; i++) {
    grid[i] = [];
    for (let j = 0; j < 5; j++) {
      grid[i][j] = keyChars.charAt(i * 5 + j);
    }
  }

  return grid;
}

/**
 * Finds coordinates of a character in the Polybius square
 * @param {string[][]} grid Polybius square
 * @param {string} char Character to find
 * @returns {number[]} [row, col] coordinates, or [-1, -1] if not found
 */
function findCharInGrid(grid, char) {
  // Handle J as I
  if (char === 'J') char = 'I';
  
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (grid[row][col] === char) {
        return [row, col];
      }
    }
  }
  return [-1, -1]; // Character not found
}

/**
 * Fractionate the text using the Polybius square
 * @param {string} text The text to fractionate
 * @param {string[][]} grid The Polybius square
 * @returns {string} Fractionated text using ADFGX symbols
 */
function fractionate(text, grid) {
  let result = '';
  
  for (const char of text) {
    const [row, col] = findCharInGrid(grid, char);
    
    if (row !== -1 && col !== -1) {
      // Convert coordinates to ADFGX symbols
      result += ADFGX[row] + ADFGX[col];
    }
  }
  
  return result;
}

/**
 * Perform columnar transposition based on a keyword
 * @param {string} text Text to transpose (fractionated text)
 * @param {string} keyword Transposition keyword
 * @returns {string} Transposed text
 */
function transpose(text, keyword) {
  // Handle empty or null keyword
  if (!keyword || keyword.length === 0) {
    return text;
  }

  // Create transposition key array with original positions
  const key = keyword.toUpperCase().split('');
  const keyWithPositions = key.map((char, i) => ({ char, originalPosition: i }));
  
  // Sort key alphabetically
  keyWithPositions.sort((a, b) => a.char.localeCompare(b.char));
  
  // Assign new sorted positions
  keyWithPositions.forEach((item, i) => { item.sortedPosition = i; });
  
  // Sort back to original order to get the column order
  keyWithPositions.sort((a, b) => a.originalPosition - b.originalPosition);
  const columnOrder = keyWithPositions.map(item => item.sortedPosition);
  
  // Create columns with fractionated text
  const columns = Array(keyword.length).fill().map(() => []);
  for (let i = 0; i < text.length; i++) {
    const columnIndex = i % keyword.length;
    columns[columnIndex].push(text[i]);
  }
  
  // Read off columns in order determined by the keyword
  let result = '';
  for (let i = 0; i < keyword.length; i++) {
    const sortedIndex = keyWithPositions.find(item => item.sortedPosition === i).originalPosition;
    result += columns[sortedIndex].join('');
  }
  
  return result;
}

/**
 * Reverse the columnar transposition
 * @param {string} text Transposed text
 * @param {string} keyword Transposition keyword
 * @returns {string} Untransposed fractionated text
 */
function untranspose(text, keyword) {
  // Handle empty or null keyword
  if (!keyword || keyword.length === 0) {
    return text;
  }

  const columns = [];
  const keyLength = keyword.length;
  const colLength = Math.ceil(text.length / keyLength);
  
  // Create key info
  const keyInfo = keyword.split('').map((char, idx) => ({
    char,
    originalIndex: idx,
  }));
  
  // Sort by character for alphabetical order
  keyInfo.sort((a, b) => a.char.localeCompare(b.char));
  
  // Calculate column lengths (some columns might be shorter)
  const lastColLength = text.length % keyLength || keyLength;
  const shortColsCount = keyLength - lastColLength;
  
  // Read the text into columns (the way it was written during encryption)
  let index = 0;
  for (let i = 0; i < keyLength; i++) {
    const col = [];
    const thisColLength = i < shortColsCount ? colLength - 1 : colLength;
    for (let j = 0; j < thisColLength; j++) {
      col.push(text[index++]);
    }
    columns.push(col);
  }
  
  // Rearrange columns according to the key
  const result = [];
  for (let i = 0; i < colLength; i++) {
    for (let j = 0; j < keyLength; j++) {
      if (i < columns[keyInfo[j].originalIndex].length) {
        result.push(columns[keyInfo[j].originalIndex][i]);
      }
    }
  }
  
  return result.join('');
}

/**
 * Unfractionate the text using the Polybius square
 * @param {string} fractionated Fractionated text using ADFGX symbols
 * @param {string[][]} grid The Polybius square
 * @returns {string} Original text
 */
function unfractionate(fractionated, grid) {
  let result = '';
  
  for (let i = 0; i < fractionated.length; i += 2) {
    if (i + 1 >= fractionated.length) break;
    
    const rowSymbol = fractionated[i];
    const colSymbol = fractionated[i + 1];
    
    const row = ADFGX.indexOf(rowSymbol);
    const col = ADFGX.indexOf(colSymbol);
    
    if (row !== -1 && col !== -1 && row < 5 && col < 5) {
      result += grid[row][col];
    }
  }
  
  return result;
}

/**
 * Encrypts text using the ADFGX cipher
 * @param {string} text Text to encrypt
 * @param {string} polybiusKey Key for the Polybius square
 * @param {string} transpositionKey Key for the transposition
 * @returns {string} Encrypted text
 */
function encrypt(text, polybiusKey = 'KEYWORD', transpositionKey = 'CIPHER') {
  // Remove non-alphabetic characters and convert to uppercase
  text = text.toUpperCase().replace(/[^A-Z]/g, '');
  
  // Handle J by replacing with I
  text = text.replace(/J/g, 'I');
  
  // Create Polybius square
  const grid = createPolybiusSquare(polybiusKey);
  
  // Fractionate
  const fractionated = fractionate(text, grid);
  
  // Transpose
  const encrypted = transpose(fractionated, transpositionKey);
  
  // Format in groups of 5 for readability (common in classical ciphers)
  return encrypted.match(/.{1,5}/g).join(' ');
}

/**
 * Decrypts text using the ADFGX cipher
 * @param {string} text Text to decrypt
 * @param {string} polybiusKey Key for the Polybius square
 * @param {string} transpositionKey Key for the transposition
 * @returns {string} Decrypted text
 */
function decrypt(text, polybiusKey = 'KEYWORD', transpositionKey = 'CIPHER') {
  // Remove spaces
  text = text.replace(/\s/g, '');
  
  // Validate that text contains only ADFGX characters
  if (!/^[ADFGX]+$/.test(text)) {
    throw new Error('ADFGX cipher text should only contain A, D, F, G, and X characters');
  }
  
  // Create Polybius square
  const grid = createPolybiusSquare(polybiusKey);
  
  try {
    // Untranspose
    const untransposed = untranspose(text, transpositionKey);
    
    // Unfractionate
    const decrypted = unfractionate(untransposed, grid);
    
    return decrypted;
  } catch (error) {
    console.error('Error during decryption:', error);
    // On error, try to still return something meaningful
    return encrypt(text, polybiusKey, transpositionKey);
  }
}

module.exports = {
  encrypt,
  decrypt
};