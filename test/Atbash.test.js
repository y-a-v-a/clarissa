import * as clarissa from '../index.js';
import assert from 'node:assert';

describe('Atbash cipher', () => {
  describe("#encrypt()", () => {
    it("should encrypt 'old' into 'LOW'", () => {
      const Atbash = clarissa.createCipher('Atbash');
      const result = Atbash.encrypt('old');

      assert(result === 'LOW', 'Error in Atbash enc');
    });

    it("should encrypt 'clarissa' to 'XOZIRHHZ'", () => {
      const Atbash = clarissa.createCipher('Atbash');
      const result = Atbash.encrypt('clarissa');

      assert(result === "XOZIRHHZ", "Error in ancrypting 'clarissa'");
    });

    it("should encrypt 'wizard' to 'DRAZIW'", () => {
      const Atbash = clarissa.createCipher('Atbash');
      const result = Atbash.encrypt('wizard');

      assert(result === "DRAZIW", "Error!");
    });
  });

  describe('#decrypt()', () => {
    it("should dscrypt 'slow' into 'HOLD'", () => {
      const Atbash = clarissa.createDecipher('Atbash');
      const result = Atbash.decrypt('slow');

      assert(result === 'HOLD', 'Error Atbash dec');
    });

    it("should encrypt 'DRAZIW' to 'wizard'", () => {
      const Atbash = clarissa.createCipher('Atbash');
      const result = Atbash.encrypt("DRAZIW");

      assert(result === "WIZARD", "Error!");
    });
  });
});
