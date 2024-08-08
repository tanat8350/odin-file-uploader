const express = require('express');
const router = express.Router();

const indexController = require('../controllers/indexController');
const fileController = require('../controllers/fileController');

/* GET home page. */
router.get('/', indexController.index);
router.post('/upload', fileController.postUpload);
router.get('/download/:id', fileController.getDownload);

module.exports = router;
