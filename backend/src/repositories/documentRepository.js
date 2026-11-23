const fs = require('node:fs/promises');
const path = require('node:path');
const config = require('../config/env');

const documents = new Map();
const STORED_NAME_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:\.[a-z0-9.]{0,9})?$/i;

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findById(id) {
  return documents.get(id) || null;
}

function findByOwner(owner) {
  return [...documents.values()].filter((document) => document.owner === owner);
}

function getFilePath(storedName) {
  if (typeof storedName !== 'string' || !STORED_NAME_PATTERN.test(storedName)) {
    throw new TypeError('Nome de arquivo armazenado inválido.');
  }

  const storageDir = path.resolve(config.storageDir);
  const filePath = path.resolve(storageDir, storedName);

  if (path.basename(storedName) !== storedName || path.dirname(filePath) !== storageDir) {
    throw new TypeError('Nome de arquivo armazenado inválido.');
  }

  return filePath;
}

function removeFile(storedName) {
  return fs.rm(getFilePath(storedName), { force: true });
}

async function getStorageSize() {
  const entries = await fs.readdir(config.storageDir, { withFileTypes: true });
  let totalSize = 0;

  for (const entry of entries) {
    if (entry.isFile()) {
      const file = await fs.stat(path.join(config.storageDir, entry.name));
      totalSize += file.size;
    }
  }

  return totalSize;
}

module.exports = { save, findById, findByOwner, getFilePath, removeFile, getStorageSize };
