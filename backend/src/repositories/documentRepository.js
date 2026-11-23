const fs = require('node:fs/promises');
const path = require('node:path');
const config = require('../config/env');

const documents = new Map();

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
  return path.join(config.storageDir, storedName);
}

function removeFile(storedName) {
  return fs.rm(getFilePath(storedName), { force: true });
}

module.exports = { save, findById, findByOwner, getFilePath, removeFile };
