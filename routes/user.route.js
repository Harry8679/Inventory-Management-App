const express = require('express');
const { home, register, login, logout, getUser } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/home', home);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/getUser', protect, getUser);

module.exports = router;