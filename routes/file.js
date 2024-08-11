const express = require('express');
const router = express.Router();

const fileController = require('../controllers/fileController');

router.get('/:id', fileController.getFile);
router.post('/upload/', fileController.postUploadFile);
router.post('/upload/:id', fileController.postUploadFile);
router.post('/folder/', fileController.postCreateFolder);
router.get('/folder/:id', fileController.getFolder);
router.post('/folder/:id', fileController.postCreateFolder);
router.post('/folder/:id/delete', fileController.postDeleteFolder);
router.post('/folder/:id/rename', fileController.postRenameFolder);
router.post('/download/:id', fileController.postDownloadFile);
router.post('/delete/:id', fileController.postDeleteFile);

module.exports = router;
