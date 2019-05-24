const clarissa = require('../index');
const assert = require('assert');

describe('Atbash cipher', () => {
  describe("#encrypt()", () => {
    it("", () => {
      const Atbash = clarissa.createCipher('Atbash');
      const result = Atbash.encrypt('old');

      assert(result === 'LOW', 'Error in Atbash enc');
    });

    it("", () => {

      const Atbash = clarissa.createDecipher('Atbash');
      const result = Atbash.decrypt('slow');

      assert(result === 'HOLD', 'Error Atbash dec');
    });
  });
});
