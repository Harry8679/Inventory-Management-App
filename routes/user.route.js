const express = require('express');
const { home, register, login } = require('../controllers/user.controller');
const router = express.Router();

router.get('/home', home);
router.post('/register', register);
router.post('/login', login);

module.exports = router;