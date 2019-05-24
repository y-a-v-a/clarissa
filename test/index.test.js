const assert = require('assert');
const tabulaRecta = require('../src/TabulaRecta');

describe("TabulaRecta", () => {
  describe("an entry", () => {
    it("should return 'BCDEFGHIJKLMNOPQRSTUVWXYZA' for the second entry", () => {
      assert(tabulaRecta[1] === 'BCDEFGHIJKLMNOPQRSTUVWXYZA', 'Tabula Recta fail');
    });
  });
});
