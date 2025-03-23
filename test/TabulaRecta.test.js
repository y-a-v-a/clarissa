import assert from 'node:assert';
import tabulaRecta from '../src/TabulaRecta.js';

describe("TabulaRecta", () => {
  describe("structure", () => {
    it("should have 26 rows", () => {
      assert(tabulaRecta.length === 26, 'TabulaRecta should have 26 rows');
    });

    it("should have each row be 26 characters long", () => {
      for (let i = 0; i < 26; i++) {
        assert(tabulaRecta[i].length === 26, `Row ${i} should have 26 characters`);
      }
    });
  });

  describe("row content", () => {
    it("should have 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' as the first row", () => {
      assert(tabulaRecta[0] === 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'First row should be the standard alphabet');
    });

    it("should have 'BCDEFGHIJKLMNOPQRSTUVWXYZA' as the second row", () => {
      assert(tabulaRecta[1] === 'BCDEFGHIJKLMNOPQRSTUVWXYZA', 'Second row incorrect');
    });

    it("should have 'ZABCDEFGHIJKLMNOPQRSTUVWXY' as the last row", () => {
      assert(tabulaRecta[25] === 'ZABCDEFGHIJKLMNOPQRSTUVWXY', 'Last row incorrect');
    });
  });

  describe("shift patterns", () => {
    it("should have each row shifted one position to the left from the previous row", () => {
      for (let i = 1; i < 26; i++) {
        // Check that the current row is the previous row shifted one position left
        const expectedRow = tabulaRecta[i-1].substring(1) + tabulaRecta[i-1].charAt(0);
        assert(tabulaRecta[i] === expectedRow, `Row ${i} is not correctly shifted`);
      }
    });
  });

  describe("diagonal patterns", () => {
    it("should have consistent letter progression along the main diagonal", () => {
      for (let i = 0; i < 26; i++) {
        const expectedChar = String.fromCharCode('A'.charCodeAt(0) + (i * 2) % 26);
        assert(tabulaRecta[i].charAt(i) === expectedChar, 
          `Diagonal element at row ${i}, col ${i} should be '${expectedChar}' but was '${tabulaRecta[i].charAt(i)}'`);
      }
    });

    it("should have consistent letter progression in each row", () => {
      for (let row = 0; row < 26; row++) {
        for (let col = 0; col < 25; col++) {
          const currentChar = tabulaRecta[row].charAt(col);
          const nextChar = tabulaRecta[row].charAt(col + 1);
          const expectedNextChar = String.fromCharCode(
            ((currentChar.charCodeAt(0) - 'A'.charCodeAt(0) + 1) % 26) + 'A'.charCodeAt(0)
          );
          assert(nextChar === expectedNextChar, 
            `At row ${row}, col ${col}, next character should be '${expectedNextChar}' after '${currentChar}', but was '${nextChar}'`);
        }
      }
    });
  });
});