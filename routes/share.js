const express = require('express');
const router = express.Router();

const shareController = require('../controllers/shareController');

router.get('/:id', shareController.getShared);
router.post('/:id', shareController.postDownloadShared);

module.exports = router;
