const path = require('node:path');

const DEFAULT_STORAGE_DIR = path.resolve(__dirname, '../../storage');
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_MAX_STORAGE_SIZE = 1024 * 1024 * 1024;

function readPositiveInteger(name, fallback, maximum = Number.MAX_SAFE_INTEGER) {
  const value = process.env[name];

  if (value === undefined) {
    return fallback;
  }

  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > maximum) {
    throw new Error(`${name} deve ser um número inteiro entre 1 e ${maximum}.`);
  }

  return Number(value);
}

module.exports = {
  port: readPositiveInteger('PORT', 3000, 65535),
  storageDir: path.resolve(process.env.DMS_STORAGE_DIR || DEFAULT_STORAGE_DIR),
  maxFileSize: readPositiveInteger('DMS_MAX_FILE_SIZE', DEFAULT_MAX_FILE_SIZE),
  maxStorageSize: readPositiveInteger('DMS_MAX_STORAGE_SIZE', DEFAULT_MAX_STORAGE_SIZE),
};
