const express = require('express');
const router = express.Router();

const folderController = require('../controllers/folderController');

router.get('/', folderController.getRoot);
router.post('/', folderController.postCreateFolder);
router.get('/:id', folderController.getFolder);
router.post('/:id', folderController.postCreateFolder);
router.post('/:id/delete', folderController.postDeleteFolder);
router.post('/:id/update', folderController.postUpdateFolder);

module.exports = router;
