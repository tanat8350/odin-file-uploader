const express = require('express');
const router = express.Router();

const fileController = require('../controllers/fileController');

router.get('/:id', fileController.getFile);
router.post('/upload/', fileController.postUploadFile);
router.post('/upload/:id', fileController.postUploadFile);
router.post('/:id/download', fileController.postDownloadFile);
router.post('/:id/delete', fileController.postDeleteFile);
router.post('/:id/update', fileController.postUpdateFile);

module.exports = router;
