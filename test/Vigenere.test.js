import * as clarissa from '../index.js';
import assert from 'node:assert';

describe("Vigenere", () => {
  describe("#encrypt()", () => {
    it("should encrypt 'testtest' with key 'abcdabcd' to 'TFUWT FUW'", () => {
      const v = clarissa.createCipher('Vigenere');
      const res = v.encrypt('testtest', 'abcdabcd');

      assert(res === 'TFUWT FUW', 'Error Vigenere enc');
    });

    it("should encrypt 'ATTACKATDAWN' with key 'LEMON' to 'LXFOP VEFRN HR'", () => {
      const v = clarissa.createCipher('Vigenere');
      const res = v.encrypt('ATTACKATDAWN', 'LEMON');

      assert(res === 'LXFOP VEFRN HR', 'Error Vigenere enc 2');
    });

    it("should encrypt 'CRYPTOISSHORTFORCRYPTOGRAPHY' with key 'ABCD' to 'CSAST PKVSI QUTGQ UCSAS TPIUA QJB'", () => {
      const v = clarissa.createCipher('Vigenere');
      const res = v.encrypt('CRYPTOISSHORTFORCRYPTOGRAPHY', 'ABCD');

      assert(res === 'CSAST PKVSI QUTGQ UCSAS TPIUA QJB', 'Error Vigenere enc 3');
    });
  });

  describe("#decrypt()", () => {
    it("should decrypt 'MOMIQ WWVES SWIJF VUUDV WYZCK APWHO TJGPK' with key 'thiswouldbeaverylargekey' to 'THEQU ICKBR OWNFO XJUMP SOVER THELA ZYDOG'", () => {
      const v = clarissa.createDecipher('Vigenere');
      const res = v.decrypt('MOMIQ WWVES SWIJF VUUDV WYZCK APWHO TJGPK', 'thiswouldbeaverylargekey');
      assert(res === 'THEQU ICKBR OWNFO XJUMP SOVER THELA ZYDOG', 'Error Vigenere dec');
    });
  });
});
