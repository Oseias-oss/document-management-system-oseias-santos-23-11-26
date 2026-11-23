const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const config = require('./env');

fs.mkdirSync(config.storageDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, config.storageDir),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '').slice(0, 10);
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize, files: 1 },
});

const uploadSingleFile = upload.single('file');

module.exports = { uploadSingleFile };
