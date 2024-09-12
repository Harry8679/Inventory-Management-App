const express = require('express');
const { home, register, login, logout } = require('../controllers/user.controller');
const router = express.Router();

router.get('/home', home);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;