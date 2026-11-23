const multer = require('multer');
const { HttpError } = require('../errors/HttpError');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'O arquivo excede o tamanho máximo permitido.' });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Falha ao processar o upload do arquivo.' });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error.status === 404) {
    return res.status(404).json({ error: 'Arquivo não encontrado.' });
  }

  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ error: 'Requisição inválida.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

module.exports = { errorHandler };
