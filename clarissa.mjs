#!/usr/bin/env node
import { Command } from 'commander';
import * as clarissa from './index.js';

const program = new Command();
const allCiphers = clarissa.getCiphers();

/**
 * Check given cipher against list given by clarissa
 * @param value String
 */
function cipherExists(value) {
  const cipherRegexp = new RegExp(`^(${allCiphers.join('|')})$`);
  if (!cipherRegexp.test(value)) {
    throw new Error(`Unknown cipher: ${value}`);
  }
  return value;
}

/**
 * Additions to the help output
 */
function helpExtended() {
  console.log(`
Examples:
  $ clarissa -e -c Vigenere -k mykey -t 'plaintext'
  $ clarissa -d -c Caesar -t 'NCJAEZRCLASJ' -o 11
  $ clarissa -e -c ADFGX -k keyword -p transposition -t 'secret message'
`);
}

program
  .version('0.0.1')
  .usage('[options]')
  .description('CLI app for Clarissa')
  .option('-t, --text <text>', 'text to encrypt/decrypt', /^[a-zA-Z0-9 ]+$/)
  .option('-c, --cipher [cipher]', 'encrypt/decrypt given string', cipherExists)
  .option('-e, --encrypt', 'encrypt given string')
  .option('-d, --decrypt', 'decrypt given string')
  .option('-k, --key <key>', 'key to be used for ciphers (primary key)')
  .option('-p, --transposition <key>', 'transposition key for ADFGX cipher')
  .option('-o, --offset <offset>', 'offset to be used for the Caesar cipher', parseInt)
  .option('-l, --list', 'list available ciphers')
  .option('-v, --verbose', 'verbose output');

program.on('--help', helpExtended);

program
  .action((options) => {
    if (options.list) {
      console.log(`Available ciphers:
    ${allCiphers.join('\n  ')}
  `);
      process.exit();
    }
    
    const cipher = options.cipher;
    let key = options.key;
    const text = options.text;
    const decrypt = options.decrypt || false;
    const encrypt = options.encrypt || false;
    let offset = options.offset;
    const transpositionKey = options.transposition;
    const verbose = !!options.verbose;

    try {
      if (!text || typeof text === 'boolean') {
        throw new Error('No text given or invalid characters found. Please adhere to RegExp /[a-zA-Z0-9 ]+/');
      }

      if (cipher === 'Caesar') {
        if (typeof offset !== 'number') {
          throw new Error('Caesar cipher needs -o option');
        }
        key = undefined;
      }

      if (cipher === 'Vigenere') {
        if (!key) {
          throw new Error('Vigenere cipher needs -k option');
        }
        offset = undefined;
      }
      
      if (cipher === 'ADFGX') {
        if (!key) {
          throw new Error('ADFGX cipher needs -k option for Polybius square key');
        }
        if (!transpositionKey) {
          throw new Error('ADFGX cipher needs -p option for transposition key');
        }
        offset = undefined;
      }

      let cipherInstance;
      let result = '';

      if (encrypt) {
        cipherInstance = clarissa.createCipher(cipher);
        if (cipher === 'ADFGX') {
          result = cipherInstance.encrypt(text, key, transpositionKey);
        } else {
          result = cipherInstance.encrypt(text, key || offset);
        }
      } else if (decrypt) {
        cipherInstance = clarissa.createDecipher(cipher);
        if (cipher === 'ADFGX') {
          result = cipherInstance.decrypt(text, key, transpositionKey);
        } else {
          result = cipherInstance.decrypt(text, key || offset);
        }
      } else {
        throw new Error('Please supply either -e or -d');
      }

      console.log(result);
    } catch (exception) {
      console.log(exception.message);
      process.exit(1);
    }
  });

program.parse();