const crypto = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');
const { HttpError } = require('../errors/HttpError');

function toPublicDocument(document) {
  const { id, originalName, mimeType, size, uploadedAt, owner } = document;
  return { id, originalName, mimeType, size, uploadedAt, owner };
}

async function createDocument(file, owner) {
  const document = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };

  try {
    documentRepository.save(document);
  } catch (error) {
    await documentRepository.removeFile(document.storedName);
    throw error;
  }

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
