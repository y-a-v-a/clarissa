// import createCipher from './index';
const clacry = require('./index');
const assert = require('assert');

function test_1() {
  const Caesar = clacry.createCipher('Caesar');
  const result = Caesar.encrypt('foobar');

  assert(result === 'SBBONE', 'Error in Caesar 13 enc');
}

function test_2() {
  const Caesar = clacry.createCipher('Caesar');
  const result2 = Caesar.encrypt('attackatonce', 7);
  assert(result2 === 'HAAHJRHAVUJL', 'Error in Caesar 7 enc');
}

function test_3() {
  const CaesarDecipher = clacry.createDecipher();
  const result3 = CaesarDecipher.decrypt('sbbone', 13);

  assert(result3 === 'FOOBAR', 'Error in Caesar 13 dec');
}

function test_4() {
  const CaesarDecipher = clacry.createDecipher('Caesar');
  const result = CaesarDecipher.decrypt('haahjrhavujl', 7);

  assert(result === 'ATTACKATONCE', 'Error in Caesar 7 dec');
}

function test_5() {
  const Atbash = clacry.createCipher('Atbash');
  const result = Atbash.encrypt('old');

  assert(result === 'LOW', 'Error in Atbash enc');
}

function test_6() {
  const Atbash = clacry.createDecipher('Atbash');
  const result = Atbash.decrypt('slow');

  assert(result === 'HOLD', 'Error Atbash dec');
}

function test_7() {
  const tabulaRecta = require('./src/TabulaRecta');

  assert(tabulaRecta[1] === 'BCDEFGHIJKLMNOPQRSTUVWXYZA', 'Tabula Recta fail');
}

function test_8() {
  const v = clacry.createCipher('Vigenere');
  const res = v.encrypt('testtest', 'abcdabcd');

  assert(res === 'TFUWT FUW', 'Error Vigenere enc');
}

function test_9() {
  const v = clacry.createDecipher('Vigenere');
  const res = v.decrypt('MOMIQ WWVES SWIJF VUUDV WYZCK APWHO TJGPK', 'thiswouldbeaverylargekey');
  assert(res === 'THEQU ICKBR OWNFO XJUMP SOVER THELA ZYDOG', 'Error Vigenere dec');
}

function test_10() {
  const v = clacry.createCipher('Vigenere');
  const res = v.encrypt('ATTACKATDAWN', 'LEMON');

  assert(res === 'LXFOP VEFRN HR', 'Error Vigenere enc 2');
}

function test_0() {
  const ciphers = clacry.getCiphers();
  assert(ciphers.length === 3, 'We have 3 ciphers now');
}

function test_11() {
  const v = clacry.createCipher('Vigenere');
  const res = v.encrypt('CRYPTOISSHORTFORCRYPTOGRAPHY', 'ABCDABCDABCDABCDABCDABCDABCD');

  assert(res === 'CSAST PKVSI QUTGQ UCSAS TPIUA QJB', 'Error Vigenere enc 3');
}

test_0();
test_1();
test_2();
test_3();
test_4();
test_5();
test_6();
test_7();
test_8();
test_9();
test_10();
