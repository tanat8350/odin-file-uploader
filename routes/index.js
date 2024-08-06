const express = require('express');
const router = express.Router();

const indexController = require('../controllers/indexController');
/* GET home page. */
router.get('/', indexController.index);
router.get('/signup', indexController.getSignUp);
router.post('/signup', indexController.postSignUp);
router.get('/login', indexController.getLogin);
router.post('/login', indexController.postLogin);
router.get('/logout', indexController.getLogout);

module.exports = router;
