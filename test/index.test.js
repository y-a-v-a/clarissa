import assert from 'node:assert';
import tabulaRecta from '../src/TabulaRecta.js';

describe("TabulaRecta", () => {
  describe("an entry", () => {
    it("should return 'BCDEFGHIJKLMNOPQRSTUVWXYZA' for the second entry", () => {
      assert(tabulaRecta[1] === 'BCDEFGHIJKLMNOPQRSTUVWXYZA', 'Tabula Recta fail');
    });
  });
});
