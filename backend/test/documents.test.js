const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.DMS_STORAGE_DIR = storageDir;
process.env.DMS_MAX_FILE_SIZE = '1024';

const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
  fs.rmSync(storageDir, { recursive: true, force: true });
});

function uploadFile(userId, content = 'conteudo de teste', name = 'teste.txt', type = 'text/plain') {
  const form = new FormData();
  form.append('file', new Blob([content], { type }), name);
  const headers = userId ? { 'X-User-Id': userId } : {};
  return fetch(`${baseUrl}/upload`, { method: 'POST', headers, body: form });
}

test('upload exige o cabeçalho X-User-Id', async () => {
  const response = await uploadFile(null);
  assert.strictEqual(response.status, 400);
});

test('upload cria o documento e a listagem retorna somente os do dono', async () => {
  const response = await uploadFile('ana');
  assert.strictEqual(response.status, 201);

  const document = await response.json();
  assert.strictEqual(document.originalName, 'teste.txt');
  assert.strictEqual(document.owner, 'ana');
  assert.strictEqual(document.storedName, undefined);

  await uploadFile('bruno');

  const listResponse = await fetch(`${baseUrl}/documents`, { headers: { 'X-User-Id': 'ana' } });
  const list = await listResponse.json();
  assert.strictEqual(listResponse.status, 200);
  assert.ok(list.some((item) => item.id === document.id));
  assert.ok(list.every((item) => item.owner === 'ana'));
});

test('download entrega o conteúdo ao dono', async () => {
  const document = await (await uploadFile('carla', 'abc', 'nota.txt', 'text/plain')).json();

  const response = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'carla' },
  });

  assert.strictEqual(response.status, 200);
  assert.strictEqual(await response.text(), 'abc');
  assert.match(response.headers.get('content-disposition'), /attachment; filename="nota.txt"/);
  assert.match(response.headers.get('content-type'), /^text\/plain/);
});

test('download bloqueia usuário que não é dono', async () => {
  const document = await (await uploadFile('elisa')).json();

  const response = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'diego' },
  });

  assert.strictEqual(response.status, 403);
});

test('download retorna 404 para documento inexistente', async () => {
  const response = await fetch(`${baseUrl}/documents/nao-existe/download`, {
    headers: { 'X-User-Id': 'ana' },
  });

  assert.strictEqual(response.status, 404);
});

test('upload recusa arquivo acima do tamanho máximo', async () => {
  const response = await uploadFile('ana', 'x'.repeat(2048));
  assert.strictEqual(response.status, 413);
});
