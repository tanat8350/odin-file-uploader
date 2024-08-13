const express = require('express');
const router = express.Router();

const folderController = require('../controllers/folderController');

// workaround for checkLoggedin
router.get('/', folderController.getRoot);

module.exports = router;
