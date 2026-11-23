const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.DMS_STORAGE_DIR = storageDir;
process.env.DMS_MAX_FILE_SIZE = '1024';
process.env.DMS_MAX_STORAGE_SIZE = '1000';

const app = require('../src/app');
const documentRepository = require('../src/repositories/documentRepository');

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

test('upload exige um arquivo', async () => {
  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'ana' },
    body: new FormData(),
  });

  assert.strictEqual(response.status, 400);
  assert.match((await response.json()).error, /arquivo/i);
});

test('listagem e download exigem o cabeçalho X-User-Id', async () => {
  for (const route of ['/documents', '/documents/qualquer/download']) {
    const response = await fetch(`${baseUrl}${route}`);
    assert.strictEqual(response.status, 400);
    assert.match((await response.json()).error, /X-User-Id/);
  }
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

test('download retorna 404 quando o arquivo não existe no disco', async () => {
  const document = await (await uploadFile('ana')).json();
  const storedDocument = documentRepository.findById(document.id);
  fs.unlinkSync(documentRepository.getFilePath(storedDocument.storedName));

  const response = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'ana' },
  });

  assert.strictEqual(response.status, 404);
  assert.match((await response.json()).error, /não encontrado/i);
});

test('repositório rejeita nomes de arquivo que escapariam do diretório de storage', () => {
  assert.throws(() => documentRepository.getFilePath('../fora.txt'), /inválido/i);
  assert.throws(() => documentRepository.getFilePath('subdiretorio/arquivo.txt'), /inválido/i);
  assert.throws(() => documentRepository.getFilePath('arquivo.txt'), /inválido/i);
});

test('upload respeita o limite total de armazenamento e remove o arquivo recusado', async () => {
  const firstResponse = await uploadFile('ana', 'a'.repeat(600));
  assert.strictEqual(firstResponse.status, 201);

  const filesBefore = fs.readdirSync(storageDir).sort();
  const secondResponse = await uploadFile('ana', 'b'.repeat(600));

  assert.strictEqual(secondResponse.status, 507);
  assert.match((await secondResponse.json()).error, /armazenamento/i);
  assert.deepStrictEqual(fs.readdirSync(storageDir).sort(), filesBefore);
});

test('download informa que o navegador não deve interpretar o conteúdo', async () => {
  const document = await (await uploadFile('ana', '<script>alert(1)</script>', 'nota.txt', 'text/html')).json();
  const response = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'ana' },
  });

  assert.strictEqual(response.headers.get('x-content-type-options'), 'nosniff');
});

test('upload rejeita campos multipart adicionais', async () => {
  const form = new FormData();
  form.append('file', new Blob(['conteudo']), 'teste.txt');
  form.append('extra', 'nao permitido');

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'ana' },
    body: form,
  });

  assert.strictEqual(response.status, 400);
});

test('upload remove o arquivo quando falha ao salvar metadados', async (context) => {
  const filesBefore = fs.readdirSync(storageDir).sort();
  context.mock.method(documentRepository, 'save', () => {
    throw new Error('Falha ao salvar metadados');
  });
  context.mock.method(console, 'error', () => {});

  const response = await uploadFile('ana');

  assert.strictEqual(response.status, 500);
  assert.deepStrictEqual(fs.readdirSync(storageDir).sort(), filesBefore);
});

test('upload recusa arquivo acima do tamanho máximo', async () => {
  const response = await uploadFile('ana', 'x'.repeat(2048));
  assert.strictEqual(response.status, 413);
});
