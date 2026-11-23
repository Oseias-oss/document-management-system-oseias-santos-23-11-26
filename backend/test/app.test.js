const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const app = require('../src/app');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('configuração rejeita tamanho máximo de arquivo inválido', () => {
  const result = spawnSync(process.execPath, ['-e', "require('./src/config/env')"], {
    cwd: __dirname + '/..',
    env: { ...process.env, DMS_MAX_FILE_SIZE: '-1' },
    encoding: 'utf8',
  });

  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /DMS_MAX_FILE_SIZE/);
});
