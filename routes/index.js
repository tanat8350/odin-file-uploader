const express = require('express');
const router = express.Router();

const folderController = require('../controllers/folderController');

/* GET home page. */
router.get('/', folderController.getRedirectRootFolder);

module.exports = router;
