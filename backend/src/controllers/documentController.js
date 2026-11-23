const { HttpError } = require('../errors/HttpError');
const documentService = require('../services/documentService');

function requireOwner(req, res, next) {
  const owner = req.get('X-User-Id')?.trim();

  if (!owner) {
    return next(new HttpError(400, 'O cabeçalho X-User-Id é obrigatório.'));
  }

  req.owner = owner;
  return next();
}

async function upload(req, res) {
  if (!req.file) {
    throw new HttpError(400, 'Envie um arquivo no campo "file".');
  }

  const document = await documentService.createDocument(req.file, req.owner);
  res.status(201).json(document);
}

function list(req, res) {
  res.json(documentService.listDocumentsByOwner(req.owner));
}

function download(req, res, next) {
  const { filePath, originalName, mimeType } = documentService.getDownloadInfo(req.params.id, req.owner);

  res.attachment(originalName);
  res.type(mimeType);
  res.sendFile(filePath, (error) => {
    if (error) {
      next(error);
    }
  });
}

module.exports = { requireOwner, upload, list, download };
