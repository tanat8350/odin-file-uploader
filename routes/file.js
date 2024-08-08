const express = require('express');
const router = express.Router();

const fileController = require('../controllers/fileController');

router.get('/:id', fileController.getFile);
router.post('/upload', fileController.postUpload);
router.post('/download/:id', fileController.postDownload);
// router.post('/delete/:id', fileController.postDelete);

module.exports = router;
