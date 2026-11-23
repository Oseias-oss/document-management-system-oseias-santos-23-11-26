const crypto = require('node:crypto');
const config = require('../config/env');
const documentRepository = require('../repositories/documentRepository');
const { HttpError } = require('../errors/HttpError');

function toPublicDocument(document) {
  const { id, originalName, mimeType, size, uploadedAt, owner } = document;
  return { id, originalName, mimeType, size, uploadedAt, owner };
}

function createDocumentRecord(file, owner) {
  return {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };
}

async function ensureStorageCapacity() {
  const storageSize = await documentRepository.getStorageSize();
  if (storageSize > config.maxStorageSize) {
    throw new HttpError(507, 'O limite total de armazenamento foi atingido.');
  }
}

async function persistDocument(document) {
  try {
    await ensureStorageCapacity();
    documentRepository.save(document);
  } catch (error) {
    await documentRepository.removeFile(document.storedName);
    throw error;
  }
}

async function createDocument(file, owner) {
  const document = createDocumentRecord(file, owner);
  await persistDocument(document);
  return toPublicDocument(document);
}

function listDocumentsByOwner(owner) {
  return documentRepository.findByOwner(owner).map(toPublicDocument);
}

function getDownloadInfo(id, owner) {
  const document = documentRepository.findById(id);

  if (!document) {
    throw new HttpError(404, 'Documento não encontrado.');
  }

  if (document.owner !== owner) {
    throw new HttpError(403, 'Você não tem permissão para acessar este documento.');
  }

  return {
    filePath: documentRepository.getFilePath(document.storedName),
    originalName: document.originalName,
    mimeType: document.mimeType,
  };
}

module.exports = { createDocument, listDocumentsByOwner, getDownloadInfo };
