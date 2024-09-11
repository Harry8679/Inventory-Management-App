const express = require('express');
const { home, register } = require('../controllers/user.controller');
const router = express.Router();

router.get('/home', home);
router.post('/register', register);

module.exports = router;