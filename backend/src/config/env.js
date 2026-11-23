const path = require('node:path');

const DEFAULT_STORAGE_DIR = path.resolve(__dirname, '../../storage');
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

module.exports = {
  port: Number(process.env.PORT) || 3000,
  storageDir: path.resolve(process.env.DMS_STORAGE_DIR || DEFAULT_STORAGE_DIR),
  maxFileSize: Number(process.env.DMS_MAX_FILE_SIZE) || DEFAULT_MAX_FILE_SIZE,
};
