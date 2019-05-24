const clarissa = require('../index');
const assert = require('assert');

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

describe("TabulaRecta", () => {
  describe("an entry", () => {
    it("should return 'BCDEFGHIJKLMNOPQRSTUVWXYZA' for the second entry", () => {
      const tabulaRecta = require('../src/TabulaRecta');

      assert(tabulaRecta[1] === 'BCDEFGHIJKLMNOPQRSTUVWXYZA', 'Tabula Recta fail');
    });
  });
});

describe("Vigenere", () => {
  describe("#encrypt()", () => {
    it("should", () => {
      const v = clarissa.createCipher('Vigenere');
      const res = v.encrypt('testtest', 'abcdabcd');

      assert(res === 'TFUWT FUW', 'Error Vigenere enc');
    });

    it("should", () => {
      const v = clarissa.createCipher('Vigenere');
      const res = v.encrypt('ATTACKATDAWN', 'LEMON');

      assert(res === 'LXFOP VEFRN HR', 'Error Vigenere enc 2');
    });

    it("should", () => {
      const v = clarissa.createCipher('Vigenere');
      const res = v.encrypt('CRYPTOISSHORTFORCRYPTOGRAPHY', 'ABCD');

      assert(res === 'CSAST PKVSI QUTGQ UCSAS TPIUA QJB', 'Error Vigenere enc 3');
    });
  });

  describe("#decrypt()", () => {
    it("", () => {
      const v = clarissa.createDecipher('Vigenere');
      const res = v.decrypt('MOMIQ WWVES SWIJF VUUDV WYZCK APWHO TJGPK', 'thiswouldbeaverylargekey');
      assert(res === 'THEQU ICKBR OWNFO XJUMP SOVER THELA ZYDOG', 'Error Vigenere dec');
    });
  });
});
