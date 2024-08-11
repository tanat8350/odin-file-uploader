const express = require('express');
const router = express.Router();

const fileController = require('../controllers/fileController');

router.get('/:id', fileController.getFile);
router.post('/upload/', fileController.postUploadFile);
router.post('/upload/:id', fileController.postUploadFile);
router.post('/:id/download', fileController.postDownloadFile);
router.post('/:id/delete', fileController.postDeleteFile);
router.post('/:id/update', fileController.postUpdateFile);
router.post('/folder/', fileController.postCreateFolder);
router.get('/folder/:id', fileController.getFolder);
router.post('/folder/:id', fileController.postCreateFolder);
router.post('/folder/:id/delete', fileController.postDeleteFolder);
router.post('/folder/:id/update', fileController.postUpdateFolder);

module.exports = router;
