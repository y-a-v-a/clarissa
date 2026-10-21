import * as ADFGX from '../src/ADFGX.js';
import assert from 'node:assert';

describe('ADFGX cipher', () => {
  describe('#encrypt()', () => {
    it('should encrypt text to ADFGX characters only', () => {
      const result = ADFGX.encrypt('ATTACKATONCE');
      assert(/^[ADFGX ]+$/.test(result), 'ADFGX encryption should only output ADFGX characters');
    });

    it('should encrypt consistently with the same keys', () => {
      const result1 = ADFGX.encrypt('HELLO', 'TEST', 'KEY');
      const result2 = ADFGX.encrypt('HELLO', 'TEST', 'KEY');
      assert(result1 === result2, 'ADFGX encryption should be deterministic');
    });

    it('should produce properly formatted output', () => {
      const result = ADFGX.encrypt('MESSAGE');
      // Check for spaces every 5 characters
      const groups = result.split(' ');
      assert(groups.length > 0, 'Output should contain at least one group');
      
      // All groups except possibly the last should be 5 characters
      for (let i = 0; i < groups.length - 1; i++) {
        assert(groups[i].length === 5, `Group ${i} should have 5 characters, but has ${groups[i].length}`);
      }
      
      // Last group should be 5 or fewer characters
      assert(groups[groups.length - 1].length <= 5, 'Last group should have 5 or fewer characters');
    });
  });

  describe('#decrypt()', () => {
    it('should properly handle the ADFGX format during decryption', () => {
      // Test with direct ADFGX format text
      const input = 'ADFGX';
      const encrypted = ADFGX.encrypt(input, 'TEST', 'KEY');
      // Verify it's a valid ADFGX ciphertext
      assert(/^[ADFGX ]+$/.test(encrypted), 'Encryption should produce ADFGX characters');
      
      // Decryption should complete without errors
      const decrypted = ADFGX.decrypt(encrypted, 'TEST', 'KEY');
      assert(typeof decrypted === 'string', 'Decryption should return a string');
    });
    
    it('should successfully encrypt and decrypt a longer message', () => {
      const original = 'ATTACKATDAWN';
      const key1 = 'CIPHER';
      const key2 = 'KEY';
      
      const encrypted = ADFGX.encrypt(original, key1, key2);
      const decrypted = ADFGX.decrypt(encrypted, key1, key2);
      
      assert(decrypted.toUpperCase() === original, 'Round-trip encryption/decryption failed');
    });

    it('should decrypt the readme example, where columns have unequal lengths', () => {
      const encrypted = ADFGX.encrypt('attackatdawn', 'playfair', 'germany');
      assert.strictEqual(encrypted, 'GGAFD XGAFG FXFXX AFGGD AAFX');
      assert.strictEqual(ADFGX.decrypt(encrypted, 'playfair', 'germany'), 'ATTACKATDAWN');
    });

    it('should round-trip with mixed-case and repeated-letter transposition keys', () => {
      for (const key of ['Germany', 'BALLOON', 'zebra', 'aaa']) {
        const encrypted = ADFGX.encrypt('defendtheeastwall', 'KEYWORD', key);
        assert.strictEqual(ADFGX.decrypt(encrypted, 'KEYWORD', key), 'DEFENDTHEEASTWALL', `key ${key}`);
      }
    });

    it('should round-trip every message length for several key lengths', () => {
      const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
      for (const key of ['AB', 'CIPHER', 'GERMANY', 'TRANSPOSITION']) {
        for (let length = 1; length <= 30; length++) {
          const message = Array.from({ length }, (_, i) => alphabet[(i * 7) % 25]).join('');
          const encrypted = ADFGX.encrypt(message, 'PLAYFAIR', key);
          assert.strictEqual(ADFGX.decrypt(encrypted, 'PLAYFAIR', key), message, `key ${key}, length ${length}`);
        }
      }
    });
  });
});