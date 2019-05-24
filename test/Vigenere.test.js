const clarissa = require('../index');
const assert = require('assert');

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
