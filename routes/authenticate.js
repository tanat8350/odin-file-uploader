const express = require('express');
const router = express.Router();

const authenticateController = require('../controllers/authenticateController');
router.get('/signup', authenticateController.getSignUp);
router.post('/signup', authenticateController.postSignUp);
router.get('/login', authenticateController.getLogin);
router.post('/login', authenticateController.postLogin);
router.get('/logout', authenticateController.getLogout);

module.exports = router;
