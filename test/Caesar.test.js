import * as clarissa from '../index.js';
import assert from 'node:assert';

describe('Caesar cipher', () => {
  describe('#encrypt()', () => {
    it('should encrypt "foobar" into "SBBONE"', () => {
      const Caesar = clarissa.createCipher('Caesar');
      const result = Caesar.encrypt('foobar');

      assert(result === 'SBBONE', 'Error in Caesar 13 enc');
    });

    it("should encrypt 'attackatonce' into 'HAAHJRHAVUJL'", () => {
      const Caesar = clarissa.createCipher('Caesar');
      const result2 = Caesar.encrypt('attackatonce', 7);
      assert(result2 === 'HAAHJRHAVUJL', 'Error in Caesar 7 enc');
    });

    it("should encrypt 'abcdefghijklmnopqrstuvwxyz' to 'NOPQRSTUVWXYZABCDEFGHIJKLM' with offset 13", () => {
      const Caesar = clarissa.createCipher('Caesar');
      const result = Caesar.encrypt("abcdefghijklmnopqrstuvwxyz", 13);
      assert(result === "NOPQRSTUVWXYZABCDEFGHIJKLM", "Error in Caesar 13 enc");
    });

    it.skip("should encrypt '123abc' into '123BCD' with offset 1", () => {
      const Caesar = clarissa.createCipher('Caesar');
      const result = Caesar.encrypt("123abc", 1);

      assert(result === "123BCD", "Error in ecrypting numbers");
    })
  });

  describe("#decrypt()", () => {
    it("should decrypt 'sbbone' into 'foobar'", () => {
      const CaesarDecipher = clarissa.createDecipher();
      const result3 = CaesarDecipher.decrypt('sbbone', 13);

      assert(result3 === 'FOOBAR', 'Error in Caesar 13 dec');
    });

    it("should decrypt 'ATTACKATONCE' into 'haahjrhavujl'", () => {
      const CaesarDecipher = clarissa.createDecipher('Caesar');
      const result = CaesarDecipher.decrypt('haahjrhavujl', 7);

      assert(result === 'ATTACKATONCE', 'Error in Caesar 7 dec');
    });
  });
});
