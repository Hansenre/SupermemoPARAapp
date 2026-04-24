const assert = require('node:assert/strict');
const {
  validateRequiredText,
  ensureSafePageSize,
  ensureSafePage,
  sanitizeFolderPath,
  parseFlashcards
} = require('../server');

function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`not ok - ${name}`);
    throw err;
  }
}

runTest('validateRequiredText enforces required and max length', () => {
  assert.equal(validateRequiredText('  ok  ', 'Campo', 1, 5), 'ok');
  assert.throws(() => validateRequiredText('', 'Campo', 1, 5), /Campo obrigatorio/);
  assert.throws(() => validateRequiredText('abcdef', 'Campo', 1, 5), /excede 5/);
});

runTest('ensureSafePageSize and ensureSafePage sanitize numbers', () => {
  assert.equal(ensureSafePageSize('50', 20, 100), 50);
  assert.equal(ensureSafePageSize('999', 20, 100), 100);
  assert.equal(ensureSafePageSize('-1', 20, 100), 20);
  assert.equal(ensureSafePage('3', 1), 3);
  assert.equal(ensureSafePage('0', 1), 1);
});

runTest('sanitizeFolderPath keeps safe normalized segments', () => {
  const safe = sanitizeFolderPath('modulo_1/unidade_2');
  assert.equal(safe.replaceAll('\\', '/'), 'modulo_1/unidade_2');
  assert.equal(sanitizeFolderPath('../invalido'), 'invalido');
});

runTest('parseFlashcards accepts structured and raw formats', () => {
  const structured = parseFlashcards('', [{ prompt: 'Q1', answer: 'A1' }]);
  assert.equal(structured.length, 1);
  assert.equal(structured[0].prompt, 'Q1');

  const raw = parseFlashcards('Pergunta::Resposta');
  assert.equal(raw.length, 1);
  assert.equal(raw[0].answer, 'Resposta');
});

console.log('all tests passed');
