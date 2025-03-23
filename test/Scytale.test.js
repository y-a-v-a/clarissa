import * as Scytale from '../src/Scytale.js';
import assert from 'node:assert';

describe('Scytale cipher', () => {
  describe('#encrypt()', () => {
    it('should encrypt "IAMHURTVERYBADLYHELP" with diameter 4 to "IUEAH ARRDE MTYLL HVBYP"', () => {
      const result = Scytale.encrypt('IAMHURTVERYBADLYHELP', 4);
      assert(result === 'IUEAH ARRDE MTYLL HVBYP', 'Error in Scytale encryption');
    });

    it('should encrypt "HELLOWORLD" with diameter 3 to "HLODE ORXLW LX"', () => {
      const result = Scytale.encrypt('HELLOWORLD', 3);
      assert(result === 'HLODE ORXLW LX', 'Error in Scytale encryption');
    });

    it('should encrypt "DEFENDTHEEASTWALLOFTHECASTLE" with diameter 5 to "DDALH TETSL ELFHT OCEEE WFAXN EATSX"', () => {
      const result = Scytale.encrypt('DEFENDTHEEASTWALLOFTHECASTLE', 5);
      assert(result === 'DDALH TETSL ELFHT OCEEE WFAXN EATSX', 'Error in Scytale encryption');
    });
  });

  describe('#decrypt()', () => {
    it('should decrypt "IUEAH ARRDE MTYLL HVBYP" with diameter 4 to "IAMHURTVERYBADLYHELP"', () => {
      const result = Scytale.decrypt('IUEAH ARRDE MTYLL HVBYP', 4);
      assert(result === 'IAMHURTVERYBADLYHELP', 'Error in Scytale decryption');
    });

    it('should decrypt "HLODE ORXLW LX" with diameter 3 to "HELLOWORLDXX"', () => {
      const result = Scytale.decrypt('HLODE ORXLW LX', 3);
      assert(result === 'HELLOWORLDXX', 'Error in Scytale decryption');
    });

    it('should decrypt "DDALH TETSL ELFHT OCEEE WFAXN EATSX" with diameter 5 to "DEFENDTHEEASTWALLOFTHECASTLEXX"', () => {
      const result = Scytale.decrypt('DDALH TETSL ELFHT OCEEE WFAXN EATSX', 5);
      assert(result === 'DEFENDTHEEASTWALLOFTHECASTLEXX', 'Error in Scytale decryption');
    });
  });
});