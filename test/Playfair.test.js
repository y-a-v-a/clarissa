const Playfair = require('../src/Playfair');
const assert = require('assert');

describe('Playfair cipher', () => {
  describe('#encrypt()', () => {
    it('should encrypt "HELLO" into "KGYVRV" with key "PLAYFAIR"', () => {
      const result = Playfair.encrypt('HELLO', 'PLAYFAIR');
      assert(result === 'KGYVRV', 'Error in Playfair encryption');
    });

    it('should encrypt "HELLOWORLD" into "KGYVRVVQGRCZ" with key "PLAYFAIR"', () => {
      const result = Playfair.encrypt('HELLOWORLD', 'PLAYFAIR');
      assert(result === 'KGYVRVVQGRCZ', 'Error in Playfair encryption');
    });

    it('should encrypt "HIXIXD" into "BFASZB" with key "MONARCHY"', () => {
      const result = Playfair.encrypt('HIXIXD', 'MONARCHY');
      assert(result === 'BFASZB', 'Error in Playfair encryption with different key');
    });
  });

  describe('#decrypt()', () => {
    it('should decrypt "KGYVRV" into "HELXLO" with key "PLAYFAIR"', () => {
      const result = Playfair.decrypt('KGYVRV', 'PLAYFAIR');
      assert(result === 'HELXLO', 'Error in Playfair decryption');
    });

    it('should decrypt "KGYVRVVQGRCZ" into "HELXLOWORLDX" with key "PLAYFAIR"', () => {
      const result = Playfair.decrypt('KGYVRVVQGRCZ', 'PLAYFAIR');
      assert(result === 'HELXLOWORLDX', 'Error in Playfair decryption');
    });

    it('should decrypt "BFASZB" into "HIXIXD" with key "MONARCHY"', () => {
      const result = Playfair.decrypt('BFASZB', 'MONARCHY');
      assert(result === 'HIXIXD', 'Error in Playfair decryption with different key');
    });
  });
});