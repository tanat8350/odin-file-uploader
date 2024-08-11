const express = require('express');
const router = express.Router();

const fileController = require('../controllers/fileController');

router.get('/:id', fileController.getFile);
router.post('/upload/', fileController.postUpload);
router.post('/upload/:id', fileController.postUpload);
router.post('/folder/', fileController.postCreateFolderRoot);
router.get('/folder/:id', fileController.getInFolder);
router.post('/folder/:id', fileController.postCreateFolderRoot);
router.post('/download/:id', fileController.postDownload);
// router.post('/delete/:id', fileController.postDelete);

module.exports = router;
