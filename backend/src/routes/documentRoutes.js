const express = require('express');
const documentController = require('../controllers/documentController');
const { uploadSingleFile } = require('../config/upload');

const router = express.Router();

router.post('/upload', documentController.requireOwner, uploadSingleFile, documentController.upload);
router.get('/documents', documentController.requireOwner, documentController.list);
router.get('/documents/:id/download', documentController.requireOwner, documentController.download);

module.exports = router;
